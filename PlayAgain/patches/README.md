# patches/ 补丁清单

构建时整体覆盖到 apktool 解码目录（`cp -r patches/. <解码目录>/`）。
基线原版：`game.apk`（md5 `4563cf23eb1a57af7730b858efc8b612`，v5.2.5 / versionCode 525）。

| 文件 | 改动内容 |
|---|---|
| `AndroidManifest.xml` | 仅加 `android:debuggable="true"`（保留 WebView CDP 远程调试通道） |
| `assets/www/index.html` | 在游戏脚本前插入一个 script 标签：`mod/rmmod.js`（vue/naive-ui 由 rmmod.js 首次开面板时懒加载） |
| `smali_classes2/com/qihoo/rpgplugin/MainActivity.smali` | ① `createWebsite()` 内插 `invoke-static {p0}, Lcom/rmmod/ModFloatingWindow;->show(Landroid/app/Activity;)V`；② `onDestroy()` 内插 `invoke-static {}, Lcom/rmmod/ModFloatingWindow;->hide()V` |

mod 网页层（rmmod.js / vendor/）不在本目录，真源是 `mod/www/mod/`，由构建脚本复制到 `assets/www/mod/`。

换游戏版本时入口方法名与行位可能变化（360 壳是 `createWebsite`，其他壳需重新定位 WebView 初始化方法），需按新版重做 diff 与补丁，不能直接复用。
