# RMToolboxM

RPG Maker 手游 MOD 直装工具箱：免 Root，把悬浮修改器（原生 Java 悬浮球 + WebView Vue 面板）注入游戏 APK，重打包签名后直接安装，装完即用。

## 特性

- **免 Root、免悬浮窗权限**：悬浮球挂在游戏 Activity 的 DecorView 上，不申请 `SYSTEM_ALERT_WINDOW`，安装即用
- **混合架构**：原生 Java 悬浮球 + 游戏 WebView 内 Vue 3 + Naive UI 面板（修改器 / 游戏数据双 tab，支持搜索、虚拟滚动、图标解密渲染）
- **零启动负担**：UI 懒加载 —— vue/naive-ui（约 1.7MB）只在首次点开面板时动态注入，作弊钩子不依赖 UI、启动即生效
- **状态持久化**：作弊开关/倍率写 localStorage 即时恢复，悬浮球位置写 SharedPreferences
- **通用管线**：apktool 反编译 → 补丁覆盖 → javac + D8 → dex 自动选号注入 → v1/v2/v3 重签名，新游戏按文档四步接入
- **功能面板**：战斗（无敌/一击必杀/免耗）、移动（穿墙/无遇敌/奔跑）、锁值（HP/MP/TP）、倍率（经验/金钱/掉落 ×1~100）、快捷操作（回满/全灭/金币/全物品/存读档等）、游戏数据浏览与修改（物品/武器/防具/角色/地图/开关/变量）

## 已适配游戏

| 游戏 | 包名 | 版本基线 | 引擎 / 壳 | 目录 |
|---|---|---|---|---|
| 再刷一把 | `com.hjgzs.zsyb` | v5.2.5 (vc525) | RPG Maker MV + 360 加固壳 | [PlayAgain/](PlayAgain/README.md) |
| 再刷一把2：金色传说 | `com.hjgzs.zseb` | v0.6.3 (vc63) | RPG Maker MV（魔改）+ 腾讯 X5 内核 + wasm 资源加密 + 四层反篡改 | [PlayAgain2/](PlayAgain2/README.md) |

各游戏目录内的 README 是完整的技术档案：反篡改破解、X5 内核绕过、渲染管线修复、WebView 兼容性坑等，对同类 RPG Maker 手游的 MOD 制作有参考价值。

## 快速开始

环境：JDK 8+、Python 3、adb；Windows 下用 Git Bash / MSYS 运行脚本。

1. **准备 android.jar**（javac 编译用的 Android SDK 平台包，Google 许可限制不能随仓库分发）：

   ```bash
   bash tools/setup-sdk.sh   # 自动从 Google 官方地址下载 platform-31 并提取
   ```
   或手动把 `platforms/android-31/android.jar` 复制为 `tools/sdk/android-12/android.jar`。

2. **放入原版 APK**：自行合法获取游戏安装包，命名为 `<游戏目录>/game.apk`。构建脚本会强制校验 md5（补丁按基线版本的混淆名制作，版本不符会拒绝构建）。

3. **一键构建**（两款游戏均已支持）：

   ```bash
   bash PlayAgain/build.sh             # 产物 PlayAgain/build/PlayAgain-mod.apk
   bash PlayAgain2/build.sh            # 产物 PlayAgain2/build/PlayAgain2-mod.apk
   bash PlayAgain2/build.sh game.apk <设备序列号>   # 构建后顺便 adb install -r
   ```

   另有增量构建 `bash tools/build.sh <游戏目录> [序列号]`，适用于 `decode/` 已存在时的快速重建。

4. 安装后启动游戏，点悬浮球即可打开 MOD 面板。

## 目录结构

```
RMToolboxM/
├─ PlayAgain/           《再刷一把》专属目录（技术档案见其内 README）
│  ├─ build.sh            一键构建脚本
│  ├─ patches/            补丁覆盖层（manifest / 入口 smali / index.html）
│  └─ mod/                MOD 源码（java/ 原生三件套 + www/ 网页层）
├─ PlayAgain2/          《再刷一把2：金色传说》专属目录（同构，另有 hook.js 反反篡改）
├─ tools/                通用工具（跨游戏复用）
│  ├─ build.sh            增量构建脚本（decode/ 已存在时）
│  ├─ setup-sdk.sh        下载 android.jar
│  ├─ apktool.jar         反编译/重打包
│  ├─ r8.jar              D8 打 dex
│  ├─ uber-apk-signer.jar 签名（v1/v2/v3 + zipalign）
│  └─ debug/              WebView CDP 调试脚本（cdp_eval.py 等）
└─ README.md
```

游戏原版 APK、`decode/` 反编译产物、`build/` 构建产物均不入库（见 .gitignore），每款游戏一个顶层目录，互不干扰。

## 接入新游戏

1. **反编译**：`java -jar tools/apktool.jar d game.apk -o <游戏目录>/decode`

2. **注入入口**：找到入口 Activity（`adb shell dumpsys activity activities | grep topResumedActivity`，或看 manifest），在其初始化 WebView 的方法（qihoo 壳是 `createWebsite`，原生壳一般是 `onCreate`）里加：
   ```smali
   invoke-static {p0}, Lcom/rmmod/ModFloatingWindow;->show(Landroid/app/Activity;)V
   ```
   在 `onDestroy` 里加：
   ```smali
   invoke-static {}, Lcom/rmmod/ModFloatingWindow;->hide()V
   ```

3. **manifest 加调试开关**：application 节点加 `android:debuggable="true"`（run-as 调试和 WebView CDP 都依赖它）。

4. **建 MOD 源码**：
   - `<游戏目录>/mod/java/` —— 直接复用 PlayAgain 的三个类（`ModHub` 上下文、`ModFloatingWindow` 悬浮球、`ModBridge` JS 桥），无需改动
   - `<游戏目录>/mod/www/mod/` —— 拷贝 PlayAgain 的 `rmmod.js` + `vendor/` 作起点，改 JS 侧游戏对象适配（RPG Maker MV 系全局对象 `$gameParty`/`$dataItems` 等通用，非 MV 引擎则重写数据层）

5. **构建**：参照 `PlayAgain/build.sh` 写一键脚本（补丁建议沉淀为 `patches/` 覆盖层），或先用 `bash tools/build.sh <游戏目录> [序列号]` 增量构建。

## 调试

```bash
# WebView CDP（游戏运行中）：
adb shell cat /proc/net/unix | grep devtools_remote   # 拿到 socket 名（含 pid）
adb forward tcp:9222 localabstract:webview_devtools_remote_<pid>
python tools/debug/cdp_eval.py "任意 JS 表达式"

# 截图（免拉取）：
adb exec-out screencap -p > shot.png
```

注意：带加固壳的游戏（360/qihoo 等）冷启动要 30~40 秒，验证截图别太早。

## 技术要点

- 注入 Java 不能用 androidx：`javac -source 8 -target 8 -bootclasspath tools/sdk/android-12/android.jar`，产物用 D8 合成 dex
- dex 注入自动选号：扫描 APK 已有的 classesN.dex 取下一个空号（一代是 classes3.dex，已有 4 个 dex 的二代用 classes5.dex），游戏自有 dex 不动
- MOD UI 懒加载：`index.html` 只挂 `hook.js`（二代）/`rmmod.js`；vue + naive-ui 由 rmmod.js 在首次点开面板时才动态注入 `<script>`，不拖游戏冷启动
- RPG Maker MV 游戏逻辑全在 `assets/www` 的 JS 里，MOD 主要工作在 JS 层；资源 `.rpgmvp`/`.rpgmvo` 为 XOR 加密

## 二代特殊机制备忘（详见 [PlayAgain2/README.md](PlayAgain2/README.md)）

- **加密资源**：二代把 www 主体加密进 `core.pak`/`plugins.pak`/`data.pak`（wasm AES 解密），且 bundle-loader 经 `new Function` 创建四层反篡改看门狗（console 原生性/CDP 堆栈/window 黑名单/键数假名）—— hook.js 包装 `Function` + `setInterval`/`setTimeout` 按特征拦截（**不包装 `window.eval`**：替换会破坏直接求值语义，Yanfly 参数 `eval("this.standardPadding()*2")` 开局对话必崩）
- **TK.$ 命名空间**：MV 全局被改名搬进 `TK.$`（getter 箭头函数调用返回真身；管理器是类本体），hook.js 用 `defineProperty` getter 镜像回 window 标准名，rmmod.js 零改动
- **自动启动**：重签包上壳的启动触发器不发生，hook.js 守卫调用 `TK.$.SceneMrg.run(window.Scene_Boot)`
- **渲染终局**：`ce/u1.b()` 插 return-void 跳过 X5 初始化强制系统内核 fallback（X5 proxy 模式 rAF 节流 1.5~3fps 且 canvas 合成提交缺失；系统内核 + 原版硬件层 60fps 全通），再加热切换 WebGL 渲染器（39→60fps）
- **闪退修复**：重签名致 TapSDK 静默登录 `signature not match`，壳重试耗尽后 `exit()` —— `ll$l` 的 `onFail`/`onCancel` 插 return-void；webview 仅登录成功回调才显示 —— `onResume` 守卫强制调 `V()`

## 免责声明

- 本项目仅供学习与研究 Android 应用结构、RPG Maker 引擎及 WebView 相关技术之用。
- 仓库不包含任何游戏本体、游戏资源或其解密产物；请通过官方渠道支持正版并自行获取游戏安装包。
- 修改、重打包游戏可能违反其用户协议，由此产生的一切后果由使用者自行承担；**请勿传播修改后的游戏安装包**。
- 本项目与相关游戏的开发商、发行商无任何关联。如有侵权，请联系删除。

## License

[MIT](LICENSE)。`tools/` 内第三方构建工具（apktool / R8 / uber-apk-signer）与 `mod/www/mod/vendor/` 内前端库（Vue / Naive UI）的版权归各自作者所有，遵循其原始许可证。
