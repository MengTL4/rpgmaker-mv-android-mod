#!/bin/bash
# RMToolboxM 通用构建：按游戏目录构建 MOD 直装包
# 用法: bash tools/build.sh [游戏目录] [设备序列号(可选，提供则构建后自动安装)]
# 游戏目录结构:
#   <game>/decode/       apktool 反编译产物（含注入的入口 smali）
#   <game>/mod/java/     原生 Java 源码（悬浮球/桥）
#   <game>/mod/www/      覆盖到 decode/assets/www 的网页层（rmmod.js 等）
set -e
cd "$(dirname "$0")/.."

GAME="${1:-PlayAgain}"
SERIAL="${2:-}"
GAME_DIR="$PWD/$GAME"
DECODE="$GAME_DIR/decode"
OUT="$GAME_DIR/build"
MODSRC="$GAME_DIR/mod"
SDK=tools/sdk/android-12/android.jar
MODAPK="$(echo "$GAME" | tr ' ' '_')-mod.apk"

# Windows 原生工具(javac/java/python/adb)需要混合路径(E:/x/y)，MSYS 工具(cp/find)用 POSIX 路径
w() { cygpath -m "$1"; }

[ -d "$DECODE" ] || { echo "错误: 缺少 $DECODE"; exit 1; }
[ -d "$MODSRC/java" ] || { echo "错误: 缺少 $MODSRC/java"; exit 1; }
mkdir -p "$OUT"

echo "[1/5] 同步 mod/www -> decode/assets/www ..."
mkdir -p "$DECODE/assets/www"
cp -r "$MODSRC/www/." "$DECODE/assets/www/"

echo "[2/5] 编译 mod Java -> dex ..."
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
DEXFILE="$DEX/classes.dex"
[ -f "$DEXFILE" ] || { echo "错误: dex 生成失败"; exit 1; }

echo "[3/5] apktool 重打包 ..."
java -Xmx4g -jar tools/apktool.jar b "$(w "$DECODE")" -o "$(w "$OUT/game-unsigned.apk")" 2>&1 | tail -3

echo "[4/5] 注入 dex（自动选号，避开游戏已有 classesN.dex）..."
python - "$(w "$DEXFILE")" "$(w "$OUT/game-unsigned.apk")" <<'PY'
import zipfile, shutil, sys, re
dex, src = sys.argv[1], sys.argv[2]
tmp = src + '.tmp'
with zipfile.ZipFile(src, 'r') as zin:
    names = zin.namelist()
    # Android 标准命名是 classes.dex, classes2.dex, classes3.dex...（没有 classes1.dex）
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

echo "[5/5] 签名 (v1/v2/v3 + zipalign) ..."
java -jar tools/uber-apk-signer.jar -a "$(w "$OUT/game-unsigned.apk")" --allowResign --overwrite 2>&1 | grep -E "sign success|signature verified|error|Error" | head -3
cp "$OUT/game-unsigned.apk" "$OUT/$MODAPK"
echo "完成: $OUT/$MODAPK"
ls -la "$OUT/$MODAPK"

if [ -n "$SERIAL" ]; then
  echo "安装到 $SERIAL ..."
  adb -s "$SERIAL" install -r "$(w "$OUT/$MODAPK")" | tail -1
fi
