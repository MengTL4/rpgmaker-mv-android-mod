# PlayAgain2 —— 《再刷一把2：金色传说》MOD 直装

《再刷一把》一代 MOD 直装的姐妹项目。二代是 Steam PC 版 RPG Maker MV 游戏（greenworks/steam_api）的 Android 移植，加密与反篡改强度远高于一代，且壳使用**腾讯 X5 内核**，带来一整套新问题。

- 包名：`com.hjgzs.zseb`，版本 0.6.3
- 入口：`com.hjgzs.rpgplugin.MainActivity`（作者自用壳，WebView 在其字段 `O`）
- 产物：`build/PlayAgain2-mod.apk`（classes5.dex 注入三件套 + assets 打补丁）
- 复用一代的 `mod/java/`（ModHub/ModFloatingWindow/ModBridge）与 `mod/www/mod/`（rmmod.js + vendor），UI 与一代完全一致

## 〇、2026-09：外围 SDK 剥离（免登录直达 + 奖励直发）

本代直装包已**整体剥离不参与运行的外围 SDK**（TapTap 登录/云存档/防沉迷/游戏内悬浮菜单、TapTap 合规
隐私弹窗、聚合广告 anythink/穿山甲/快手/sigmob/优量汇/百度等），只保留游戏本体、壳、X5 内核、MOD。
决策与机制见 `docs/adr/0001`，补丁逐项与换版本步骤见 `patches/README.md`。

- **冷启动直达游戏**：`MainActivity.z()` 改直接调 `V()`（showGameView），绕过 隐私弹窗(cd/a)→登录合规链，
  再无"签名不匹配"toast / 登录失败闪退；`onResume` 的 `__modVShown` 守卫仍是兜底。
- **奖励直发**：`onAdShow(II)` 替换 AnyThink 播放链，直接向游戏注入
  `javascript:TK.TatuAdReward(1,type,itemId)`（沿用原 SDK 成功回调协议），"看广告换奖励"点了即发。
- **剥离机制**：`patches/strip-sdk.txt`（删除清单）+ `tools/surgery/{strip_sdk,patch_eq,verify_refs}.py`
  （方法级手术 + R8 合并等价替换 + 零引用复查）+ 重写的 `AndroidManifest.xml`（最小权限）。
- **安装兼容**：整目录删除 `lib/`（游戏为 WebView 壳、无 app 自家 .so），任意 ABI 设备均可装
  （此前残留 x86/x86_64 SDK 库会致 arm64 报 `INSTALL_FAILED_NO_MATCHING_ABIS`）。

## 一、资源加密与反篡改（本代核心难点）

### 资源管线

`index.html`(混淆 + wasm_bindgen) → `js/libs/bundle-loader.js`(39KB 混淆) → wasm 解密 `core.pak / plugins.pak / data.pak`（JSON `{"iv":...,"data":...}` AES）→ 解密出的代码以内联 `<script>` 注入全局作用域。

### 反篡改体系（bundle-loader 早期经 `new Function` 创建）

捕获自诊断包（反篡改看门狗全文，本地留存未入库），共四层：

1. `console.log/dir` 原生性检查 + `Object.freeze(console)`，定时审计
2. `checkCssssssss()`：`document.createEvent('TK')` 抛错的异常对象上挂 message getter，读取时的调用栈若匹配 `/InjectedScript|V8Inspector|Chrome_DevTools|VM\d+|at Console./i`（**CDP evaluate 的必然特征**）→ 跳 `about:blank`
3. `detection()` 看门狗每秒查 window 黑名单（`$dataActors…$gameParty`、`DataManager`、`SceneManager`、`Scene_MenuBase` 等）→ 杀页面。**一代同款检测，但二代在 window 上根本不存在这些名字（见下），黑名单防的是"把标准名种回 window"的调试手法**
4. `protectWindowWithFakeTail()`：window 键数超 200 时 `Object.keys/getOwnPropertyNames/Reflect.ownKeys` 返回随机假名（句柄 `globalThis.__pw`）

**破解**（hook.js v4）：在 bundle-loader 之前包装 `window.Function`（源码特征 `killPage`/`checkCssssssss`/`protectWindowWithFakeTail`/`about:blank`+`setInterval`/`about:blank`+`$dataActors` 命中即返回空函数）+ 包装 `setInterval/setTimeout`（回调源码含特征则不注册）+ 150ms 周期清扫已泄漏到 window 的反篡改函数。

> ⚠️ **v4 不再包装 `window.eval`**（v1~v3 拦 eval 是错的）：直接 eval 语义必须保留——`window.eval` 被替换后，游戏代码里所有 `eval(...)` 变成**间接求值（this=window）**，Yanfly 参数字符串 `eval("this.standardPadding()*2")` 在窗口方法内调用即崩（`TypeError: this.standardPadding is not a function`），开局对话 `Window_NameBox.refresh` 必死。eval 防线由 Function 拦截 + 定时器拦截 + 清扫接管后，反篡改依然压制住（页面稳定）。

## 二、TK.$ 命名空间（本代最重要的机制）

游戏把 MV 全局**改名混淆并搬进 `TK.$`**（42 键），window 上的标准名被删除：

| TK.$ 键 | 性质 | 对应 |
|---|---|---|
| `dataActors…dataConfig`（16 个） | **getter 箭头函数** `()=>闭包变量`，**调用返回真身** | `$dataActors…$dataConfig` |
| `gameTemp…gamePlayer`（14 个） | 同上 | `$gameTemp…$gamePlayer` |
| `DataMrg/ConfigMrg/StorageMrg/ImageMrg/AudioMrg/SoundMrg/TextMrg/SceneMrg/BattleMrg/PluginMrg` | **类本体**（混淆类名，如 `settings51asKsJj`） | `DataManager/…/PluginManager` |
| `temporaryRestore / deleteClass` | 工具函数 | 恢复/删除 5 个 Game_ 类 |

关键坑：getter 每次调用返回**闭包当前值**，若在 `loadDatabase` 前快照赋值到 window 会拿到 null/旧引用。

**Game_* 类被反调试删除**：游戏把 `Game_Party/Game_Map/Game_Actor/Game_Enemy/Game_Interpreter` 从 window 删除，真身存于混淆名（`sduUDsaagdia_g` 等 5 个）。`TK.$.temporaryRestore()` 是游戏自留的标准名↔混淆名互备工具（幂等）。**rmmod.js 面板挂载与金手指依赖这些类**——缺失时 pollReady 永不就绪，"点悬浮球无反应"（面板从未挂载）即此症。

**方案**（hook.js v6）：`Object.defineProperty(window, 标准名, { get: () => 真身, set: noop })` 共 40 项镜像——读走 getter 实时取值，写因对象引用相同天然生效（整体替换数组不生效，rmmod.js 只做引用内修改，兼容）。`window.Scene_Boot` 未改名，可直接引用。另每 150ms 调 `temporaryRestore()` 重种 5 类（游戏会周期 `deleteClass` 再删），并补齐 rmmod 依赖的其余 4 类：`Game_Battler`（Game_Actor 原型链）、`Game_Character/Game_CharacterBase`（Game_Player 原型链）、`Game_Player`（`TK.$.gamePlayer()` 实例反推）、`Game_Action`（扫 window 找 prototype 上同时有 `setSubject/apply/itemEffect` 的混淆真身）。

**镜像判定的探针（v6 关键修复）**：箭头函数**没有 `prototype` 属性**（语言规范）、类/普通函数有——getter 用 `!fn.prototype` 判定是否调用取真身，比字符串前缀判定稳（不依赖键值形态快照，永不失效）。两个坑的由来：
1. 游戏运行期会把箭头函数**原样放回 window**（如 `window.$gameParty = ()=>闭包`），旧版"键已存在就跳过"导致镜像值是**函数而非实例**——`$gameParty.members` 变 undefined，rmmod 全部功能静默失效（`window.$gameParty` 一直能读但点啥都没反应）。v6 对双箭头形态强制覆盖为调用语义 getter。
2. 游戏还能用 `Object.defineProperty` redefine 绕过 setter——150ms 清扫里对 `$gameParty/$dataActors/Game_Party` 巡检坏形态，发现即强制重镜像。

**rmmod 的 hook 打点（v7 关键修复）**：二代魔改引擎在子类上**重复实现**了基类方法（如 `Game_Actor`/`Game_Enemy` 各有自己的 `gainHp`，带 `hpg/rec` 系数），旧版打在 `Game_Battler.prototype` 的补丁被子类覆盖——**开关开着但血照扣**。rmmod.js 的 `hookAll` 改为 `hookMethod(ctor, name, wrap)`：沿原型链找到方法**实际定义层**打补丁；无敌/锁定/免耗对 `Game_Actor/Game_Enemy/Game_Battler` 三类分别打，穿墙/移速对 `Game_Player/Game_Character/Game_Event/Game_CharacterBase` 四层分别打。已实测：无敌开启扣血无效、金币 10 倍 `gainGold(50)→+500`。

**CDP 行为实测补丁（v8.1）**：装机后用 CDP 逐钩子行为验证，又抓到两个引擎差异——①二代引擎**同样没有 `isPlayer()` 方法**（实测 `undefined`），v8 给穿墙/移速钩子写的 `self.isPlayer()` 条件全部短路（穿墙 PASS 是越界坐标天然可行走的假象），与一代 v7 同一个坑，改为实例身份 `self === window.$gamePlayer`（移速实测 base4→7）；②二代引擎**没有 battler `update` 方法**（实测 `A.update is not a function`），v8 的锁定 update 钩子从未装上（三项锁定全 FAIL），改用与一代相同的 300ms 定时回写（实测 hp/mp/tp 打残后 600ms 内回满）。另：`Game_Action.makeDamageValue`（一击必杀钩子）在引擎合成调用下报 `null.baseDamage`——引擎伤害实现依赖完整战斗帧流程初始化的内部状态，非 MOD 缺陷；钩子已验证挂在全引擎唯一实现上（全 window 扫描确认）且真实调用必经 wrapper（计数器证实），一次真实战斗攻击即生效。CDP 行为验证脚本为本地测试留存，未随仓库发布。

**数据 tab 图标（v7）**：一代走 XHR `img/system/IconSet.rpgmvp` + XOR 解密——二代 `img/` 整体加密进 pak，XHR 404（日志 `icon xhr err`），图标全空。改为**优先走游戏运行时管线**：`ImageManager.loadSystem('IconSet')` 经游戏解密管线返回 Bitmap，轮询 `isReady()` 后取 `_canvas/_image` 作为裁剪源（512×IconSet 标准布局，`iconIndex` 逐 32px 裁剪转 dataURL，与一代同款渲染）；拿不到 Bitmap 再退回一代 XHR。渲染规则不变：`iconIndex=0` 或越界返回 null → 空占位，**有图标就显示、没图标不显示**。实测物品列表 17/19 行带彩色图标，武器/防具/角色同机制。

**ResizeObserver 错误误杀（v8 补丁）**：naive-ui 虚拟列表一帧内尺寸未收敛会抛 `ResizeObserver loop completed with undelivered notifications.`——浏览器规范允许忽略的无害通知，但游戏把 window error 挂到致命错误画面，数据 tab 角色技能搜索（列表重排）即弹全屏 Error。hook.js 在 **capture 阶段**挂 error 过滤器（`stopImmediatePropagation + preventDefault`），先于游戏 handler 吞掉该类错误；已注入合成错误验证不再弹画面。

## 三、启动链与自动启动

真加载器（`sc_0004.js`，诊断捕获）末尾：`if (document.readyState === 'complete') { TK.$.SceneMrg.run(Scene_Boot); }`。原版包靠 Java 侧触发器（与 TapSDK 合规流绑定）唤起；**重签包上该触发不发生** → 黑屏死等。

**破解**（hook.js v3）：轮询 `readyState==='complete' && TK.$.SceneMrg && window.Scene_Boot`，延时 1.2s 守卫调用 `TK.$.SceneMrg.run(window.Scene_Boot)`（`_scene` 已存在则跳过，防双重启动）。

## 四、Java 侧注入（MainActivity.smali）

1. **`ad()V`**（webview 初始化，ModBridge 注入处附近）：
   - `addJavascriptInterface(MOD)` + `ModFloatingWindow.show` + `R()` + `P()`（一代同款，`R()` 内含原版 `setLayerType(HARDWARE)`）
   - ~~`u1.d()` 本地内核安装~~ **已回退**：它触发"内核安装→等待重启→System.exit"循环，是**安装后每次启动必闪退**的元凶之一
2. **`onResume()V`** 注入块（`:cond_0` 内，iget O 之后）：
   - `webView.resumeTimers()`（弹窗遮挡后定时器停摆不恢复）
   - **守卫调用 `V()`**：静态字段 `__modVShown` 保证仅一次。**webview 在 onCreate 里被壳 `setVisibility(INVISIBLE)`**，只有 TapSDK 登录成功的回调链（onSuccess→`V()`=setAlpha(0)+setVisibility(0)+animate 淡入+ae() 悬浮按钮）才会显示它；重签包上静默登录必败 → webview 永不可见（canvas 有内容但不上屏）→ onResume 直接调 `V()` 补上显示，**二段黑屏的决定性修复**
   - ~~`setLayerType(SOFTWARE)`~~ **已回退**：它会覆盖 `R()` 设的原版硬件层，系统内核下 SOFTWARE 光栅化会**跳过 canvas 元素**（DOM 背景色能上屏、游戏画面全黑，`body 背景红 97.7% 上屏 + canvas 位图有内容 + 屏幕黑`即此症）
3. `onDestroy()`：`ModFloatingWindow.hide()`（一代同款）

**`ce/u1.smali`**：`b()V` 开头插 `return-void` —— 跳过 X5 内核初始化（initX5Environment），强制 smtt WebView 走系统 WebView fallback。X5 proxy 模式 rAF 被节流到 1.5~3fps 且合成提交缺失，系统内核 + 原版硬件层 rAF 60fps+ 且渲染全通。

**`ll$l.smali`**（TapSDK 登录回调）：`onFail`/`onCancel` 在日志后插 `return-void` —— **启动闪退的决定性修复**。重签名后 TapSDK 静默登录报 `signature not match`，原版 onFail 重试 3 次耗尽后 `exit()` 闪退；补丁后登录失败仅记日志，游戏照常启动。

**`GatekeeperRepository.smali`**（TapSDK 守门人，smali_classes3）：`showErrorToast` 方法开头插 `return-void` —— 重签包上签名校验必败，SDK 会**周期弹"包名、签名错误。详见 ErrLog"toast**（token 自动续期失败各弹一次），补丁后彻底安静。同文件 `showGatekeeperError()` 的另一分支走的也是 showErrorToast，无需重复处理。

`AndroidManifest.xml` 保留 `debuggable=true`（CDP 调试 + `run-as` 依赖）。

## 五、渲染终局方案（取代早期 X5 折腾）

最终栈：**系统 WebView fallback + 原版硬件加速层 + hook 自动启动**。早期 X5 排查记录（proxy 模式 rAF 节流、SOFTWARE 软绘修复后又破坏 canvas 光栅化、TBS 本地内核安装卡 install_status=2）全部作废——绕过 X5 一了百了。遗留坑仅一条：清 app_tbs_64 后 SDK 会自动解压内置内核到 core_share（128MB 无用文件，不影响运行）。

**帧率定位与 WebGL 切换（2026-09-01 实测）**：用户反馈卡顿后定位——MOD 菜单无关（Vue 面板整个 unmount 前后 39→40fps 不变；hook 定时器微秒级；设备 31°C 无降频），真因是引擎初始化成了 **PIXI.CanvasRenderer 2D 软渲染**（每帧 CPU 全量重绘，地图场景仅 ~39fps）。但游戏 bundle 里 **PIXI 4.5.4 完整在位**且引擎保留原版 Graphics（`_createRenderer` 有 webgl 分支、`render()` 里做了 `gl.flush()` 兼容）——只是 `_rendererType` 被初始化为 'canvas'。

**hook.js v8 修复**：150ms 清扫里执行 `switchToWebGL()`——新建 canvas 元素 + `new PIXI.WebGLRenderer(w,h,{view})` + DOM replaceChild + 更新 `Graphics._canvas/_renderer/_rendererType` + `_updateAllElements()`，`destroy(false)` 释放旧 renderer（UpperCanvas 输入层独立不动）。实测**地图场景 39→60fps、标题 60fps**，画面/对话/名牌/手柄/MOD 面板全部正常。失败（无 WebGL 等）保持原样无害降级。

## 六、构建

```bash
bash PlayAgain2/build.sh              # 原版 game.apk 进 → 成品 build/PlayAgain2-mod.apk 出，全自动
bash PlayAgain2/build.sh game.apk <序列号>   # 构建后顺便 adb install -r
```

全流水线（约 5~8 分钟）：md5 校验原版 → apktool 解码 → 覆盖 `patches/`（manifest/smali/index.html）→ 复制 `mod/www` 网页层 → javac+D8 编译 mod dex → apktool 回编译 → 注入 classes5.dex → uber-apk-signer 签名。补丁逐项说明与换版本须知见 `patches/README.md`。原版 APK 必须与补丁基线一致（game.apk，md5 `27f0bcd6...`），脚本会强制校验。

旧法（decode/ 已含补丁时的增量重建）：`bash tools/build.sh PlayAgain2`，与一键脚本产物等价。

**已验证（2026-09-01）**：从 game.apk 全新走一键流水线，产物与当时装机包逐条目比对 4277 项 CRC 全等（仅 zip 时间戳不同）。之后重装/分发直接用 `build.sh` 产出即可，无需依赖 decode/。

`adb install -r build/PlayAgain2-mod.apk`   # 同签名覆盖升级不弹扫描页

**全新安装（设备上无任何版本时）ColorOS 会弹安全扫描**，流程：安装 → "继续安装"按钮先灰后绿（扫描 15~60s，且**按钮位置会跳变**）→ 点绿按钮。用 `uiautomator dump` 拿按钮 bounds 再 `input tap`，勿盲点坐标（点错会进 CancelInstallActivity 且 adb 会话已死报 -99）。大包安装建议 `adb push` 到 `/data/local/tmp` 后 `adb shell "nohup pm install ... &"`。

首启流程：隐私弹窗"同意"(1700,1326) 后即自动启动（TapSDK 授权弹窗出现与否均可，登录失败已被 `ll$l` 补丁消化——允许可登录云存档，取消/报错 toast 不影响进游戏）。

## 七、调试

```bash
adb forward tcp:9222 localabstract:webview_devtools_remote_$(adb shell pidof com.hjgzs.zseb)
python tools/debug/cdp_eval.py "<js>" [port]   # port 省略时用 9222
```

- MSYS 环境一切设备路径用 `MSYS_NO_PATHCONV=1`，且给 adb 传 **Windows 风格路径**（`E:/...`）——本地路径与设备路径的转换规则不同，`pm install` 用 `adb push` 到 `/data/local/tmp` 后设备端执行
- 日志：hook.js 走 `MOD.log` + console；壳中文日志走 `-TK-` tag（部分落 `files/log/`）
- **CDP `Input.dispatchTouchEvent` 只到 DOM**，要驱动游戏逻辑用直接方法调用（如 `TK.$.SceneMrg._scene.commandNewGame()`）

## 八、触摸输入调查（adb 注入不可用的结论）

现象：`adb shell input tap` 在游戏 Activity 内全程无效（DOM 计数器 ts=0，WebView 收不到），桌面/音量键正常。已排除：ErrorPrinter 空元素全屏拦截（hook.js 已设 `pointer-events:none`）、壳层触摸覆写（无）、悬浮球（DecorView 小控件）、窗口 flags（正常）。

**结论**：设备开启了 ColorOS 游戏助手防误触（`settings get secure gesture_mistouch_in_game_mode` = 1），游戏模式下系统拦截 instrumented 注入触摸（防连点器/脚本），**真实手指（evdev 硬件路径）不受影响**——原版包同壳用户可玩为证。CDP 全链路（DOM 事件→TouchInput 函数体→坐标换算→场景方法）均验证通过，自动化测试一律走 CDP 方法调用。hook.js v4 仍附带 touch capture 路由补挂（TouchInput 四件套，幂等保险）与 ErrorPrinter 放行。

## 九、验收记录（2026-09-01 终版，OPD2404 / ColorOS，07:54 build）

| 项 | 结果 |
|---|---|
| 启动不闪退 | ✅ TapSDK 登录失败不再退出（toast 无害） |
| 自动启动到标题 | ✅ 无需手动干预，标题画面完整渲染 |
| 反篡改看门狗 | ✅ Function/定时器拦截+清扫，页面稳定 |
| TK.$ 镜像 | ✅ 数据加载 $dataItems 4001 条 |
| 进入游戏 | ✅ 新的冒险 → 存档选择（文件 1-10）→ 确认 → Scene_Map |
| 开局对话 | ✅ "欢迎来到再刷一把2。" + 名牌"迈达斯Hand"正常渲染（eval 语义修复生效） |
| 虚拟手柄/MOD 球 | ✅ 摇杆 + A/B + MOD 球全部出现 |
| 已知限制 | ⚠️ 游戏模式下 adb 注入触摸被系统拦截（真实手指不受影响）；TapSDK 静默登录因重签必败（单机无碍，toast 已堵） |
| MOD 球/面板 | ✅ 冷启动挂载（Game_* 类恢复）+ 开关面板/双 tab/作弊开关/倍率滑条全部正常 |
| MOD 功能生效 | ✅ 无敌（扣血无效）、金币 10 倍（gainGold(50)→+500）实测通过；hook 打点已适配子类覆盖 |
| TapSDK toast | ✅ 守门人 showErrorToast 已吞，启动与运行期均不再弹"包名、签名错误" |

### 2026-09-04：外围 SDK 剥离验收（`800877ab74a9af03a5acff3365f459e6`）

剥离后重跑（平板 OPD2404 + MuMu 各装新包，冷启动 + CDP 运行时抽查）：

| 项 | 结果 |
|---|---|
| 双设备安装 | ✅ 平板(arm64) `Success`；MuMu(x86_64) `Success`（整删 `lib/` 后任意 ABI 可装） |
| 冷启动直达 | ✅ 无需任何弹窗/登录，CDP 确认 `document.title=MOD_LOADED`、`scene=Scene_Map` |
| MOD 挂载 | ✅ `window.rmmod`/mod DOM 根在位（rmmod.js 初始化） |
| 奖励直发 | ✅ 游戏侧 `TK.TatuAdReward` 为活函数；原生 `onAdShow(II)` 直注入 `1,type,itemId` |
| logcat | ✅ 无 `NoClassDefFoundError`/`VerifyError`/`ClassNotFound`/SDK 报错（仅系统 service bind 的 W 级告警，无碍） |
| 云存档/本地存档 | ⚠️ TapTap 云存档已随 SDK 移除（stub），**本地存档走游戏自身 StorageMrg 不受影响**；云存档按钮不再报错（静默） |
| 已知限制 | ⚠️ 游戏模式拦截 adb 触摸注入，"看广告换奖励 / MOD 面板开关"的字面点击需真实手指（自动化为运行时链路可证明，见上）；MuMu 模拟器 WebView 默认不暴露远程调试 socket，CDP 仅在平板抽查 |

## 十、目录结构

```
PlayAgain2/
├── game.apk                  # 设备拉取的原版包 = 补丁基线（md5 27f0bcd6...，一键构建强校验）
├── zseb-original.apk         # 渠道原版包备份（zip 结构非标准，不能作构建输入）
├── build.sh                  # 一键构建：原版 APK → 成品（用法见"六、构建"）
├── patches/                  # 补丁覆盖层，构建时 cp -r patches/. → 解码目录；逐项说明见 patches/README.md
│   ├── AndroidManifest.xml           # 仅 +debuggable（保留 CDP 调试通道）
│   ├── assets/www/index.html         # +mod 两标签（hook/rmmod → bundle-loader 前；vendor 由 rmmod.js 懒加载）
│   └── smali_classes*/...            # ce/u1(跳过X5) ll$l(闪退) MainActivity(强启V) GatekeeperRepository(toast)
├── decode/                   # apktool 反编译产物（已打补丁，调试/查阅用；一键构建不依赖它）
├── mod/
│   ├── java/                 # 一代三件套源码（复用，编译出 classes5.dex）
│   └── www/mod/              # hook.js(v8, WebGL 热切) + rmmod.js(v8 懒加载 UI+hook+图标) + vendor/
├── original-data-backup/     # 原版私有数据备份
└── build/PlayAgain2-mod.apk  # 最终产物
```

诊断资料（反篡改全文 fn_0002.js、真加载器 sc_0004.js）为本地调试留存，未随仓库发布。
