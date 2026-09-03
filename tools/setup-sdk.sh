#!/bin/bash
# 下载 Android SDK Platform 31 (android-12) 的 android.jar 到 tools/sdk/android-12/
# 该文件来自 Google 官方仓库，受 Android SDK 许可约束不能随本仓库分发，需自行下载。
# 构建只需要 android.jar（javac bootclasspath），不提取平台包其余内容。
set -e
cd "$(dirname "$0")/.."

URL="https://dl.google.com/android/repository/platform-31_r01.zip"
DEST="tools/sdk"
JAR="$DEST/android-12/android.jar"

if [ -f "$JAR" ]; then
    echo "已存在: $JAR"
    exit 0
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "下载 $URL ..."
curl -fL "$URL" -o "$TMP/platform.zip"

echo "提取 android.jar ..."
mkdir -p "$DEST"
unzip -o "$TMP/platform.zip" "android-12/android.jar" -d "$DEST" >/dev/null

echo "完成: $JAR"
