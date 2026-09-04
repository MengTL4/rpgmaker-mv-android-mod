#!/bin/bash
# PlayAgain（再刷一把 v5.2.5）MOD 直装包一键构建
# 原版 APK 进 -> 成品 build/PlayAgain-mod.apk 出，全自动。
# 用法: bash PlayAgain/build.sh [原版APK] [设备序列号]
#   原版APK     默认 PlayAgain/game.apk（脚本校验 md5，必须与补丁基线一致）
#   设备序列号  可选；提供则构建完成后自动 adb install -r 安装
# 依赖: tools/{apktool.jar,r8.jar,uber-apk-signer.jar,sdk/android-12/android.jar}、PATH 里有 java/python/adb
set -e
cd "$(dirname "$0")/.."

GAME_DIR="$PWD/PlayAgain"
ORIG="${1:-$GAME_DIR/game.apk}"
SERIAL="${2:-}"
PATCHES="$GAME_DIR/patches"
MODSRC="$GAME_DIR/mod"
OUT="$GAME_DIR/build"
STAGE="$OUT/work-decode"
SDK=tools/sdk/android-12/android.jar
FINAL="$OUT/PlayAgain-mod.apk"
KNOWN_MD5="4563cf23eb1a57af7730b858efc8b612"   # game.apk (v5.2.5, versionCode 525)

w() { cygpath -m "$1"; }   # Windows 原生工具(java/python)需要混合路径

[ -f "$ORIG" ]      || { echo "错误: 原版 APK 不存在: $ORIG"; exit 1; }
[ -d "$PATCHES" ]   || { echo "错误: 缺少补丁目录 $PATCHES"; exit 1; }
[ -d "$MODSRC/www" ]  || { echo "错误: 缺少 $MODSRC/www"; exit 1; }
[ -d "$MODSRC/java" ] || { echo "错误: 缺少 $MODSRC/java"; exit 1; }
[ -f "$SDK" ]       || { echo "错误: 缺少 $SDK（运行 tools/setup-sdk.sh 获取）"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "错误: 需要 node（用于资源自动解密，Node stdlib 即可，无 npm 依赖）"; exit 1; }

echo "[1/7] 校验原版 APK ..."
MD5="$(md5sum "$ORIG" | cut -d' ' -f1)"
if [ "$MD5" != "$KNOWN_MD5" ]; then
    echo "错误: 原版 APK md5=$MD5，与补丁基线 game.apk（md5=$KNOWN_MD5, v5.2.5 vc525）不一致。"
    echo "      补丁按该版本制作（入口 MainActivity.createWebsite 等），"
    echo "      换版本必须重新 diff 并更新 patches/，见 patches/README.md。"
    exit 1
fi
echo "      md5 校验通过"

echo "[2/7] apktool 解码原版 ..."
mkdir -p "$OUT"; rm -rf "$STAGE"
java -Xmx4g -jar tools/apktool.jar d -f "$(w "$ORIG")" -o "$(w "$STAGE")" 2>&1 | tail -1

echo "[3/7] 应用补丁（manifest/smali/index.html + mod 网页层）..."
# 原版资源是加密布局（www/jfm_data = JS、www/qingyi = 游戏数据，由壳内 X5WebViewClient 按需解密）。
# 重打包后改走明文 index.html，必须换成明文 js/data，否则游戏脚本全部 404。
# 现在由 tools/decrypt/decrypt.js 自动解码（digest→路径清单 resource-map.json，仅字符串可入库），
# 不再依赖本地 decode 缓存。换游戏版本需重跑 tools/decrypt/gen-map.js 重新生成清单。
if [ -d "$STAGE/assets/www/jfm_data" ] && [ ! -d "$STAGE/assets/www/js" ]; then
    echo "检测到原版加密资源布局（jfm_data/qingyi），自动解密..."
    node "$GAME_DIR/tools/decrypt/decrypt.js" "$(w "$STAGE/assets/www")" "$GAME_DIR/tools/decrypt/resource-map.json" \
        || { echo "错误: 资源自动解密失败（需 node + tools/decrypt/resource-map.json）"; exit 1; }
    rm -rf "$STAGE/assets/www/jfm_data" "$STAGE/assets/www/qingyi"
fi
cp -r "$PATCHES/." "$STAGE/"
cp -r "$MODSRC/www/." "$STAGE/assets/www/"

# [3.5/7] 外围 SDK 剥离：目录覆盖表达不了删除，按清单 prune（smali 树 / so / assets / 孤儿类）。
# 清单维护原则（先断引用后删树、grep 零引用复查）见 patches/strip-sdk.txt 头注释与 patches/README.md。
if [ -f "$PATCHES/strip-sdk.txt" ]; then
    echo "[3.5/7] 剥离外围 SDK（strip-sdk.txt）..."
    while IFS= read -r line; do
        case "$line" in ''|\#*) continue;; esac
        for p in $STAGE/$line; do
            [ -e "$p" ] || continue
            rm -rf "$p"
        done
    done < "$PATCHES/strip-sdk.txt"
fi

echo "[4/7] 编译 mod Java -> dex ..."
CLASSES="$OUT/classes"; DEX="$OUT/dex"
rm -rf "$CLASSES" "$DEX"; mkdir -p "$CLASSES" "$DEX"
SOURCES=()
while IFS= read -r -d '' f; do SOURCES+=("$(w "$f")"); done < <(find "$MODSRC/java" -name "*.java" -print0)
[ ${#SOURCES[@]} -gt 0 ] || { echo "错误: 未找到 Java 源码"; exit 1; }
javac -source 8 -target 8 -bootclasspath "$(w "$SDK")" -d "$(w "$CLASSES")" "${SOURCES[@]}" 2>&1 | grep -vE "警告|warning|已过时|注：" || true
CLASSFILES=()
while IFS= read -r -d '' f; do CLASSFILES+=("$(w "$f")"); done < <(find "$CLASSES" -name "*.class" -print0)
[ ${#CLASSFILES[@]} -gt 0 ] || { echo "错误: 未编译出 class"; exit 1; }
java -cp tools/r8.jar com.android.tools.r8.D8 --release --lib "$(w "$SDK")" --output "$(w "$DEX")" "${CLASSFILES[@]}"
[ -f "$DEX/classes.dex" ] || { echo "错误: dex 生成失败"; exit 1; }

echo "[5/7] apktool 回编译 ..."
java -Xmx4g -jar tools/apktool.jar b "$(w "$STAGE")" -o "$(w "$OUT/game-unsigned.apk")" 2>&1 | tail -2

echo "[6/7] 注入 dex（自动选号，避开游戏已有 classesN.dex）..."
python - "$(w "$DEX/classes.dex")" "$(w "$OUT/game-unsigned.apk")" <<'PY'
import zipfile, shutil, sys
dex, src = sys.argv[1], sys.argv[2]
tmp = src + '.tmp'
with zipfile.ZipFile(src, 'r') as zin:
    names = zin.namelist()
    n = 1
    while ('classes.dex' if n == 1 else 'classes%d.dex' % n) in names:
        n += 1
    dexname = 'classes.dex' if n == 1 else 'classes%d.dex' % n
    with zipfile.ZipFile(tmp, 'w') as zout:
        for item in zin.infolist():
            zout.writestr(item, zin.read(item.filename))
        zout.write(dex, dexname, zipfile.ZIP_DEFLATED)
shutil.move(tmp, src)
print('   %s 已注入' % dexname)
PY

echo "[7/7] 签名（v1/v2/v3，uber-apk-signer 默认调试密钥）..."
java -jar tools/uber-apk-signer.jar -a "$(w "$OUT/game-unsigned.apk")" --allowResign --overwrite 2>&1 | grep -E "sign success|signature verified|error|Error" | head -3
rm -f "$OUT/game-unsigned.apk.idsig"
cp "$OUT/game-unsigned.apk" "$FINAL"
rm -rf "$STAGE"

echo "完成: $FINAL"
md5sum "$FINAL"

if [ -n "$SERIAL" ]; then
    echo "安装到 $SERIAL ..."
    adb -s "$SERIAL" install -r "$(w "$FINAL")" | tail -1
fi
