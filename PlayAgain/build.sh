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
cp -r "$PATCHES/." "$STAGE/"
cp -r "$MODSRC/www/." "$STAGE/assets/www/"

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
