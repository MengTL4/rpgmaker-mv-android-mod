# ADR 0001 — 直装包整体剥离外围第三方 SDK

- 状态：已接受
- 日期：2026-09-04
- 决策者：MengTL（项目负责人）
- 领域：PlayAgain（再刷一把）/ PlayAgain2（再刷一把2）MOD 直装

## 背景

两个直装包都基于原版 APK 重打补丁，而原版包内置了大量**不参与游戏运行**的第三方 SDK：
TapTap 登录/云存档/游戏内悬浮菜单、防沉迷、TapTap 合规/隐私弹窗、以及一套聚合广告
（穿山甲 com.bytedance/bykv/byted、Anythink、快手 com.kwad/kuaishou、sigmob、优量汇
com.qq、百度 mobads、TapAD 等）。这些 SDK：
1. 引入大量无用权限（定位/电话/广告 ID/悬浮窗/查询所有包等）；
2. 冷启动先走隐私弹窗→登录（重签后签名校验必败，失败即静默退出）；
3. 携带几十 MB 无用代码与原生库，且是潜在隐私/合规风险。

用户目标："就单纯保留游戏和 MOD 菜单，其他的诸如 taptap 登录、taptap sdk、防沉迷之类的，
全部去掉。"（Q1=C）。

## 决策

**把"不参与游戏运行"的第三方 SDK 从直装包中整体剥离**，只保留：

- 游戏本体（RPG Maker MV 网页层 + 加密 pak）
- 壳（com.hjgzs.* / com.qihoo.* 原生宿主：入口 Activity、WebView 封装、JS 桥）
- 渲染内核（腾讯 X5 `com.tencent.smtt`，含 com.tencent.smtt 的 dex + X5 内核资源）
- MOD（悬浮球 + Vue 面板 + 作弊 hook）

具体范围：TapTap 登录/云存档/游戏内悬浮菜单（`com.taptap`/`com.tapsdk`/`com.hjgzs.rpgplugin.ll|l|o|CloudSave*`）、
防沉迷、TapTap 合规/隐私弹窗（`cd/`、`com.hjgzs.privacy`）、全部广告（anythink/bytedance/bykv/byted/
sigmob/kwad/kuaishou/kwai/qq/baidu/tapadn/ss/tan + 其设备信息采集 czhj + 图片库 luck/flyjingfish/
drakeet + BasePopup razerdp）。

**不删**：运行必需件——游戏、壳、X5(smtt)、kotlin/kotlinx 运行时、okhttp3/okio、glide(bumptech)、
androidx、以及 czhj 下被 okio/volley 复用的 `com.czhj.wire` / `com.czhj.volley`。

## 机制（怎么做到"断调用 + 清 manifest + 删 smali 类 + 零引用"）

剥离由三层协同完成，全部可入库、可复查、可在换版本时重跑：

1. **剥离清单 `patches/strip-sdk.txt`**：逐行列出要删除的路径（目录/文件/glob），
   `build.sh` 新增的 `[3.5/7]` 阶段在解码树上 `rm -rf` 这些条目。
2. **方法级手术 `tools/surgery/strip_sdk.py`**：把依赖被删类的 KEEP 侧代码等价改造（**判死**：
   凡接口被删、字段类型为被删类、指令引用被删类的方法，一律桩化/重写，且保证 KEEP→DELETED 零引用）：
   - `MainActivity`：去 `implements ll$c/l$II`、删字段 `II/Il/tatuAd`、`z()` 改为直接 `V()`（绕过
     隐私弹窗→登录合规链）、`ab()` 去 anythink（改用 `WebSettings.getDefaultUserAgent` 解 Chrome 版本）、
     `U/ae/af/ba/bb/bc/J` 桩化、24 个 `ll$c`/`l$II` SDK 回调桩化、`onAdShow(II)` 改直发奖励、
     `onActivityResult`/`onDestroy` 重写、删 `t()` 访问器、`MainActivity$o.run` 桩化。
   - `I.smali`：删 `ll` 字段与 `o(Lll;)V` 设值方法、21 个 TapTap 桥接方法桩化（保 `@JavascriptInterface`
     注解）、`O(String)` 存档上报的 `ll` 引用中和。
3. **等价实现补丁 `tools/surgery/patch_eq.py`**：处理 R8 把 SDK 内部类**横向合并进 KEEP 类**的残留，
   用平台 API 等价替换（否则 verifier 解析到被删类即崩）：
   - `a2/ll`、`a2/j`（kotlin `ClosedFloatingPointRange.hashCode`）：`com.taptap.sdk.core.o->o(D)I`
     → `Double.doubleToLongBits` + `(bits ^ bits>>>32)`。
   - `SystemWebViewClient$2`（`getDescription`/`getErrorCode`）、`$3`（`didCrash`）、`WebSettings`
     （`setSafeBrowsingEnabled`）、`Apn`（`getActiveNetwork`）、glide `m$ll`（`getActiveNetwork`）。
   - `j0/c`：`anythink odopt` 关流 → `ContentProviderClient.release()`。
4. **重写 `patches/AndroidManifest.xml`**：只留 `INTERNET/ACCESS_NETWORK_STATE/WRITE|READ_EXTERNAL_STORAGE/
   WAKE_LOCK/VIBRATE` 权限 + `MainActivity`/X5 dexopt 服务/`androidx.startup`，删全部 SDK
   组件/权限/`queries`/`meta-data`。
5. **零引用复查 `tools/surgery/verify_refs.py`**：套用 strip 规则扫全部存活 .smali，若 KEEP 文件仍引用
   被删类即报告；当前目标为 **0 悬空**（构建前铁门）。

## 后果

正面：
- 冷启动直达标题/地图，无隐私弹窗、无登录门、无 TapTap toast（不再"签名不匹配"扰民）。
- APK 明显瘦身（删掉 SDK dex 与 .so）；权限收敛到最小集。
- 广告按钮语义收敛为**奖励直发**：gen1 走 JS 侧 `TorchRewardAd.showRewardAd` 直发；
  gen2 走原生 `onAdShow(II)` → `evaluateJavascript TK.TatuAdReward(1,type,itemId)`（沿用原 SDK 成功回调协议）。

风险与缓解：
- **R8 合并残留**导致 KEEP 类引用被删类 → 用 verify_refs 零引用复查 + apktool b 回编译双重把关，全部等价替换。
- **误删运行必需件**（kotlin/okhttp/glide/X5）→ strip 清单核对 + 装机实测无 `NoClassDefFoundError`。
- **架构差异**：删掉 arm64 之外残留的 x86/x86_64 SDK 库后，曾触发 arm64 设备 `INSTALL_FAILED_NO_MATCHING_ABIS`；
  现整目录删除 `lib/`（游戏为 WebView 壳，无 app 自家 .so），任意 ABI 均可装。

## 验收（Q4）

双设备（平板 `c6efd952` + MuMu `emulator-5554`）各装新包：冷启动直达标题、MOD 悬浮球/面板可用、
logcat 无缺类/SDK 报错、老存档兼容；"在看广告换奖励"按钮点了直接发奖励。（验收记录见各游戏 README。）

## 相关

- `PlayAgain/patches/`、`PlayAgain2/patches/`（strip-sdk.txt + 手术 smali）
- `PlayAgain2/tools/surgery/{strip_sdk,patch_eq,verify_refs}.py`
- CONTEXT.md 词汇：外围 SDK / 登录门 / 奖励直发 / 渲染内核
