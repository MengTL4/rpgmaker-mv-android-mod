# patches/ 补丁清单

构建时整体覆盖到 apktool 解码目录（`cp -r patches/. <解码目录>/`）。
基线原版：`game.apk`（md5 `27f0bcd684b1b286f57e303208514838`，v0.6.3 / versionCode 63）。

2026-09 起本代直装包执行**外围 SDK 整体剥离**（见 `docs/adr/0001`），补丁由四类组成：
网页层、启动链重接、等价实现替换、剥离清单。`build.sh` 在应用补丁后新增 `[3.5/7]` 阶段按
`strip-sdk.txt` 删除 SDK 目录/文件。

## 一、网页层

| 文件 | 改动 |
|---|---|
| `assets/www/index.html` | 在 bundle-loader 前插入 4 个 script：`mod/hook.js`、`mod/vendor/vue.global.prod.js`、`mod/vendor/naive-ui.prod.js`、`mod/rmmod.js` |

`mod/www/mod/` 真源在 `build.sh` 复制到 `assets/www/mod/`，不在本目录。

## 二、启动链重接（MainActivity，`tools/surgery/strip_sdk.py` 生成）

| 改动 | 说明 |
|---|---|
| 去 `implements ll$c/l$II` | 这两个接口类随 TapTap 剥离删除 |
| 删字段 `II:ll`、`Il:l`、`tatuAd:ce/f1` | 字段类型为被删类，必须连同全部引用指令一起移除 |
| `z()` → 直接 `V()` | 绕过 隐私弹窗(cd/a)→MainActivity$l→af()→ll.e() 合规登录链，冷启动直达游戏 |
| `ab()` 去 anythink | 改用 `WebSettings.getDefaultUserAgent` 解析 Chrome 主版本（原 SDK≥26 走 anythink 工具） |
| `U/ae/af/ba/bb/bc/J` 桩化 | 悬浮菜单/登录管理器/广告SDK初始化/本地安全库(msaoaidsec) 全部空实现 |
| 24 个 SDK 回调桩化 | `ll$c`(18) 登录/防沉迷/成就/动态 + `l$II`(6) 悬浮菜单点击 + `onOpenCloudSaveUI` |
| `onAdShow(II)` **奖励直发** | 替换 AnyThink 播放链为直接 `evaluateJavascript "javascript:TK.TatuAdReward(1,type,itemId)"`（沿用原 SDK 成功回调协议） |
| `onActivityResult` 重写 | 原仅处理 TapTap 悬浮窗权限回调，只留 `super` |
| `onDestroy` 重写 | 去 ll/l/tatuAd 清理，保留 WebView/MOD/本地服务/Handler 清理 |
| 删 `t()` 访问器 | 返回已删字段 II，调用者均为被删/已桩化 |
| `MainActivity$o.run` 桩化 | 原为 TapTap 登录态轮询（ll->n()） |

## 三、JS 桥（I.smali，`tools/surgery/strip_sdk.py` 生成）

- 删 `ll` 字段与 `o(Lll;)V` 设值方法。
- 21 个 TapTap 桥接方法桩化（**保留 `@JavascriptInterface`/`@Throws` 注解**）：登录/云存档/成就/动态/
  上传等。本地存读走游戏自身 StorageMrg，不受影响。
- `O(String)` 存档上报：强制跳过云上传块、中和 `ll->r0` 指令（openWeb/onOpenDebug 分发保留）。

## 四、等价实现补丁（R8 横向合并残留，`tools/surgery/patch_eq.py` 生成）

R8 把 SDK 内部类横向合并进了 KEEP 类，删除 SDK 后这些引用悬空，改用平台 API 等价替换：

| 文件 | 替换 |
|---|---|
| `smali_classes3/a2/ll.smali`、`a2/j.smali` | kotlin range `hashCode()` 的 `com.taptap.sdk.core.o->o(D)I` → `Double.doubleToLongBits`+`(bits^bits>>>32)` |
| `smali_classes3/com/tencent/smtt/sdk/SystemWebViewClient$2.smali` | `tapsdk/anythink o->o(...)` → `WebResourceError.getDescription()/getErrorCode()` |
| `smali_classes3/com/tencent/smtt/sdk/SystemWebViewClient$3.smali` | `kwad o->o(RenderProcessGoneDetail)Z` → `didCrash()` |
| `smali_classes3/com/tencent/smtt/sdk/WebSettings.smali` | `anythink o->o(WebSettings,Z)` → `setSafeBrowsingEnabled(Z)` |
| `smali_classes3/com/tencent/smtt/utils/Apn.smali` | `anythink o->o(ConnectivityManager)Network` → `getActiveNetwork()` |
| `smali_classes2/j0/c.smali` | `anythink odopt` 关流 → `ContentProviderClient.release()` |
| `smali/com/bumptech/glide/manager/m$ll.smali` | anythink `o->o(ConnectivityManager)Network` → `getActiveNetwork()` |

## 五、剥离清单 `strip-sdk.txt`

逐行列出删除目标（空行/`#` 跳过；目录整删；文件名行可带 glob）。`build.sh [3.5/7]` 遍历删除。
覆盖：登录/广告 SDK 包（taptap/tapsdk/bytedance/anythink/sigmob/kwad/kuaishou/qq/baidu/tapadn/ss/tan）、
其设备采集/图片/弹窗辅助（czhj/sdk+devicehelper、luck、flyjingfish、drakeet、razerdp、e3、f3、g3/i3/k3/m3）、
R8 散射到保留短目录的 SDK UI 类（ba/bb/bd/bf、ce 云存档/广告胶水 b1/e1/h1/ll/cc/cd/ae/bf/k1/l1/f1/n1/a..m/lI）、
`q0`、n1 快手 weapon 簇、`cd/`、`com.hjgzs.privacy`、rpgplugin 的 ll/l/o/CloudSave*/MainActivity$l、
整个 `lib/`、SDK assets（1561739095/bdxadsdk.jar/gdt_plugin/ksad_*/supplierconfig/whiteList）。

**整目录删 `lib/`**：游戏为 WebView 壳，无 app 自家 .so（`MainActivity.J` 的 `loadLibrary("msaoaidsec")`
已桩化）。删 arm64 之外残留 SDK 库后 arm64 设备曾报 `INSTALL_FAILED_NO_MATCHING_ABIS`，现整删 `lib/`
任意 ABI 均可装。

## 六、旧补丁移除

本次剥离同时删除了两个旧补丁（它们所补的文件已被整删）：
`ll$l.smali`（TapSDK 登录回调闪退）与 `com/taptap/.../GatekeeperRepository.smali`（签名 toast）。
对应的启动闪退/签名 toast 问题已随 TapTap 整体剥离一并消失。

## 换版本须知

这些混淆名（ce/u1、MainActivity、I、a2/ll、SystemWebViewClient$2 等）随版本会变。换版本时：
1. 重新 `apktool d` 新版 → `python tools/surgery/strip_sdk.py` + `patch_eq.py`（读 `decode/` 写 `patches/`）；
2. 跑 `tools/surgery/verify_refs.py` 确保 0 悬空；
3. 更新 `strip-sdk.txt`（核对新增/消失的 SDK 包、`lib/`、assets）；
4. 重写 `AndroidManifest.xml`（删新版新增的 SDK 组件/权限）；
5. 全新构建 + 双设备验收（见 ADR 0001 验收节）。
