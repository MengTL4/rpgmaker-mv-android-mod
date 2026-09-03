# patches/ 补丁清单

构建时整体覆盖到 apktool 解码目录（`cp -r patches/. <解码目录>/`）。
基线原版：`game.apk`（md5 `27f0bcd684b1b286f57e303208514838`，v0.6.3 / versionCode 63）。

| 文件 | 改动内容 |
|---|---|
| `AndroidManifest.xml` | 仅加 `android:debuggable="true"`（保留 WebView CDP 远程调试通道） |
| `assets/www/index.html` | 在 bundle-loader 前插入 4 个 script 标签：`mod/hook.js`、`mod/vendor/vue.global.prod.js`、`mod/vendor/naive-ui.prod.js`、`mod/rmmod.js` |
| `smali_classes2/ce/u1.smali` | `b()` 改为 `return-void`：跳过 X5 内核初始化，强制系统 WebView 内核（X5 下黑屏） |
| `smali_classes2/com/hjgzs/rpgplugin/ll$l.smali` | TapSDK 回调 `onFail`/`onCancel` 改为 `return-void`：验证失败不再 finish() 闪退 |
| `smali_classes2/com/hjgzs/rpgplugin/MainActivity.smali` | ① `__modVShown` 静态字段；② onResume 注入：`resumeTimers()` + 首次进入强制走 `V()`（showGameView），不再依赖 TapSDK 验证回调 |
| `smali_classes3/com/taptap/sdk/initializer/repository/GatekeeperRepository.smali` | `showErrorToast` 开头插 `return-void`：吞掉"包名、签名错误"toast |

mod 网页层（hook.js / rmmod.js / vendor/）不在本目录，真源是 `mod/www/mod/`，由构建脚本复制到 `assets/www/mod/`。

换游戏版本时这些混淆名（ce/u1、ll$l 等）很可能变化，需按新版重做 diff 与补丁，不能直接复用。
