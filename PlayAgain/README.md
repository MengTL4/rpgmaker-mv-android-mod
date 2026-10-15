# 《再刷一把》(Play Again) MOD 直装包

## 游戏信息

- 包名 `com.hjgzs.zsyb`，RPG Maker MV/MZ 混合引擎 + qihoo 风格插件壳（非真加固，dex 明文），入口 Activity `com.qihoo.rpgplugin.MainActivity`
- 游戏逻辑全部在 `assets/www`；图片/音频 `.rpgmvp/.rpgmvo` XOR 加密（引擎自解），密钥 `a7f1bbc90496ca91cfd4c4fd6a33d161`
- **脚本与数据加密**：`www/jfm_data/<sha256(路径)>`（全部 JS 模块，含入口 `index.html` 引用的 `.mjs`）与 `www/qingyi/<sha256>`（226 个 data/*.json），由壳内 `X5WebView$1`（WebViewClient）拦截请求按需解密
- **登录门**：`Config.Single_Game=true` 时 MainActivity 走 TapTap 全链（`TapLoginHelper.init` → 登录监听 → 防沉迷 → 登录检查，失败 `finish()`）；模拟器 / TapTap 未登录设备上表现为启动即闪退
- 测试设备：OPD2404 平板（2120x3000 @420dpi）、MuMu 模拟器（Android 15 x86_64）

## 重打包必须处理的两件事（踩坑记录 2026-09-04）

1. **登录门**：`patches/` 里 `Config.smali` 把 `Single_Game` 改 `false`，跳过 TapTap 链直接 `createWebsite()`。**丢失此补丁的后果**：MuMu 上 TapTap 未登录 → 启动 1 秒内静默退出（无 crash 日志，进程自杀）；平板上因 TapTap 已登录而不暴露
2. **资源解密**：重打包后改走明文 index.html，不能依赖壳的运行时解密。build.sh 检测到加密布局（有 `jfm_data` 无 `js/`）时，**自动由 `tools/decrypt/decrypt.js` 解码** `jfm_data→js/`、`qingyi→data/`（按 `tools/decrypt/resource-map.json` 的 digest→路径清单命名），并删除 `jfm_data/qingyi`，不再依赖本地 `decode/` 缓存。

   解密算法（已验证可从原版 apk 单独复现，无需运行时抓取）：`jfm_data`/`qingyi` 文件名 = sha256(URL)；`key = digest[48:64]` 逐字节 ^ `0xb6`，`iv = digest[0:16]`，AES-128-GCM，authTag = 密文末尾 16 字节。`resource-map.json`（仅字符串路径，可入库）由 `tools/decrypt/gen-map.js` 从"apk 密文 + 正确命名的 decode/www"生成；**换游戏版本需重跑 `gen-map.js` 重新生成清单**并同步更新 `patches/` 的 smali diff。构建需 `node`（仅 stdlib，无 npm 依赖）。

## 目录内容

| 路径 | 说明 |
|---|---|
| `game.apk` | 原版包（补丁基线，md5 `4563cf23...`，v5.2.5；不入库） |
| `build.sh` | 一键构建：原版 APK → 成品，全自动 |
| `patches/` | 补丁覆盖层（manifest / 入口 smali / index.html），逐项说明见其内 README |
| `decode/` | apktool 反编译产物（已打补丁 + 解密资源缓存 `assets/www/{js,data}`；一键构建依赖其解密缓存，不入库） |
| `mod/java/` | 原生 Java：`ModHub`(上下文)、`ModFloatingWindow`(悬浮球)、`ModBridge`(JS 桥) |
| `mod/www/mod/` | `rmmod.js`（Vue3 + Naive UI 面板）+ `vendor/`（本地 vue/naive-ui，无网络依赖） |
| `build/` | 产物 `PlayAgain-mod.apk`（不入库） |
| `tools/decrypt/` | 自动解码：`decrypt.js`（构建时 jfm_data/qingyi→js/data）+ `gen-map.js`（生成 digest→路径清单）+ `resource-map.json`（清单，可入库）。构建仅需 node stdlib |
| `decrypt/` `extract/` `original-dex/` | 早期逆向/结构分析产物（一次性研究用，不入库；密码算法已沉淀进 `tools/decrypt/` 与 README） |
| `backup-save/` `backup-tablet-save/` | 手机/平板测试存档备份（不入库） |

## 架构（混合方案：原生球 + WebView 面板）

- **悬浮球**：`ModFloatingWindow` 挂在 MainActivity 的 DecorView 上（免 `SYSTEM_ALERT_WINDOW` 权限）。**静态**球：与面板标识同色系的蓝紫渐变底 + 半透明白描边 + "MOD" 字样，圆形轮廓阴影，无动画。拖动在原生层（LayoutParams 固定左上角无 margin，位置完全用 translation 表示），松手吸附左/右边缘；位置存 SharedPreferences `rmmod_prefs`（ball_side/ball_y），屏幕尺寸变化（旋转/分屏）时按新尺寸重新摆放，始终在屏内。系统 ACTION_CANCEL 不视为点击
- **面板**：游戏 WebView 内 `rmmod.js` 注入 Vue3 + Naive UI（darkTheme，本地 vendor），修改器 / 数据两个页签（头部分段控件），右侧贴边悬浮、上下撑满。样式全部集中在 mount() 的样式表里（`:root` 上 `--rm-*` 设计令牌 + `rm-*` 类），模板不再写内联样式。v8 起 vendor（约 1.7MB）**懒加载**：`index.html` 只挂 `rmmod.js`，首次点球开面板时才动态注入 vue/naive，不拖游戏启动
- **桥**：`window.MOD = ModBridge`（`addJavascriptInterface`）。JS 每 150ms（面板打开/页面不可见时 600ms）`takeCommand()` 拉原生命令（球点击 → `queue("menu")` → JS `__RMMOD_TOGGLE` 开面板）；`setBallVisible` 开面板时藏球；`log` → `Log.i("RMMOD")`
- **入口补丁**：`decode/smali_classes2/com/qihoo/rpgplugin/MainActivity.smali`
  - `createWebsite()` 第 260 行：`invoke-static {p0}, Lcom/rmmod/ModFloatingWindow;->show(Landroid/app/Activity;)V`
  - `onDestroy()` 第 958 行：`invoke-static {}, Lcom/rmmod/ModFloatingWindow;->hide()V`
- manifest 已加 `android:debuggable="true"`（run-as + WebView CDP 调试依赖）

## 功能清单

- 作弊开关（卡片式：图标 + 名称 + 一句话说明，点整张卡切换，开启为绿色态；组标题显示已开数量，一键全部关闭）：战斗（无敌/一击必杀/免技能消耗，均只作用于我方）、移动（穿墙/无遇敌/常时奔跑）、锁定（HP/满HP/MP/TP）
- 倍率档位：经验/金钱 ×1/2/5/10/50/100、掉落 ×1/2/3/5/10，另可自定义 1~100（替代原 1~100 滑条：手机上一格约 2px 难以精确，且拖动依赖合成鼠标事件）；移速加成 默认/+0.5/+1/+1.5/+2/+3（更大会跳格）
- 锁值步进：锁HP值/锁MP值（步进 100）、锁TP值（步进 10），不超过上限
- 快捷操作（分组）：金币增加/设为任意值；战斗（全队回满/全灭敌人/逃离战斗，非战斗时禁用）；物资（全物品/武器/防具×99，物品不含重要/隐藏物品）；存档（存/读槽1、新游戏、回标题，覆盖与丢进度操作二次确认）；卡死修复（恢复画面/清除图片/中止事件/解除强制移动/返回地图）
- 数据 tab：物品/武器/防具/角色/地图/开关/变量 分类 + 搜索 + 刷新 + naive-ui 虚拟滚动（1152 条目），图标解密渲染，表格高度随屏幕自适应；详情弹窗操作后不关闭、原地刷新（物品 +1/+10/+99/-1/清零，角色显示等级/HP/MP 且等级默认当前值）
- 作弊状态持久化：localStorage `rmmod-cheats`（setState 防抖写回，启动恢复并做取值校验）；面板页签/数据分类/折叠状态存 `rmmod-ui`
- 悬浮球位置持久化：`rmmod_prefs`（SharedPreferences）
  - 注意：`rmmod_prefs.xml` 里 `expmult:` 等带冒号旧键是**早期原生菜单版本的遗留孤儿数据**，现代码不读不写，无害

## WebView 内四大坑与修复（通用经验）

1. **游戏清零内联 z-index**（`Graphics._modifyExistingElements`）→ MOD 层级全部用样式表 `!important` 声明：`#rmmod-ui > .n-config-provider` z-99990、`.rm-panel` z-2147483002、`n-modal` 容器 z-100000。**mask 绝不能跟着抬**，否则遮罩反过来盖住弹窗卡片
2. **游戏在 document 捕获阶段对触摸 preventDefault**（`TouchInput`）→ MOD UI 的 touchstart/move/cancel 在捕获阶段 `stopPropagation`；touchend 再 `preventDefault`（防真实 click 落到刚打开的弹窗遮罩上瞬间关闭）。面板滑条靠兼容鼠标事件 → pointermove 合成 mousedown/mousemove/mouseup，并做**手势方向仲裁**（纵向滚动放弃鼠标合成，防误拖滑条，合成 click 带 `__rmShim` 标记 + 去重）
3. **弹窗卡片钉死在左上角**：面板容器的 `transform: translateZ(0)` 使 modal 容器成为 fixed 后代的包含块 → MOD 容器一律不加 transform
4. **球/按钮点不到（click 被杀）**：原生球不依赖 click（`onTouch` UP 直接 `queue("menu")`）；HTML 层按钮用 pointerup 重派发兜底
5. **面板操作漏到游戏**（v9 修复）：合成的 mousedown 冒泡到 document 被 `TouchInput` 当成地图点击（人物朝面板背后走）→ 包装 `TouchInput._onLeftButtonDown/_onRelease` 忽略来自 MOD UI 的事件（不能截停冒泡：Naive 滑条依赖 window 上的事件委托）；游戏 `Input` 对 Backspace/方向键 preventDefault 且把 Q/W/X/Z 映射成游戏键 → body 冒泡阶段截停来自 MOD UI 的键盘事件

## v9 功能修复（相对 v8，按原版 MV 语义校验）

- **无遇敌效果相反**：旧版让 `makeEncounterCount` 返回 0，但该方法是给 `_encounterCount` 赋值而非返回值，计数器不再重置 → 几乎每步遇敌。改为 `canEncounter/executeEncounter` 返回 false
- **无敌连敌人一起无敌**：`gainHp` 钩子不分敌我，开无敌后打不动敌人。改为只保护我方，并在 `makeDamageValue` 源头归零、挡掉即死状态
- **免技能消耗敌我不分**：同上，只作用于我方；一击必杀不再秒混乱时被打的队友
- **设等级按差值算**：`changeLevel(level)` 参数是目标等级，旧版传 `目标-当前`，设 50 级得到 49 级，再设一次变 1 级
- **全灭敌人无效**：原版没有 `BattleManager._enemies`，改用 `$gameTroop.aliveMembers()`；战斗判定改用 `$gameParty.inBattle()`（`_phase` 战后不清空），并播放倒下效果
- **数量"设为 0"变成 1**、**变量 `12abc` 被截成 12**、**非战斗时"全灭敌人"也提示成功**、**存档不调 `onBeforeSave`/读档不调 `onAfterLoad`**、**全物品发放空名占位条目** 等一并修复
- **性能**：作弊钩子读原始配置对象（不走 Vue 响应式 Proxy）、直接生成包装函数透传 `arguments`（不再每次调用分配 arguments 对象），每帧对所有角色调用的移动/通行钩子开销降到约 1/60；触摸补丁只跟踪 MOD UI 上的按下，游戏画布上的拖动不再逐事件做 DOM 查询；状态栏无变化不触发整面板重渲染；图标裁剪复用同一画布
- 页面重载时若面板开着，原生球会永久隐藏 → 启动即恢复球显示；`ModBridge` 日志队列无上限增长 → 限 200 条

## 性能（实测，作为"不换原生控件框架"的依据）

- 面板打开 17ms；首渲染仅一次 140ms 长任务；列表滚动 57FPS、零长任务；内存 117MB
- 结论：WebView + Vue 面板流畅度足够，交互能力（搜索/虚拟列表/图标）反而更强，保持混合方案

## 构建 / 调试

```bash
# 一键构建（推荐）：原版 game.apk 进 → build/PlayAgain-mod.apk 出，全自动
bash PlayAgain/build.sh [原版APK路径] [序列号]

# 增量构建（decode/ 已存在时的快速重建；无线调试单设备时序列号可省略）
bash tools/build.sh PlayAgain [序列号]

# CDP 调试（游戏运行中）
adb shell cat /proc/net/unix | grep devtools_remote     # socket 名含 pid
adb forward tcp:9222 localabstract:webview_devtools_remote_<pid>
python ../tools/debug/cdp_eval.py "任意 JS 表达式"
```

注意：360 壳冷启动 30~40 秒，启动后截图别太早。

## 验收记录（2026-09-01，无线调试冒烟测试）

悬浮球显示/位置记忆 → 点球开面板 → 标题无图标 → 分组开关与倍率滑条渲染 → 数据 tab 1152 条加载 + 滚动 + 图标 → 关面板球回收 → localStorage 持久化（17 项完整状态写回）—— **全部通过**。

## 验收记录（2026-09-04，MuMu 闪退修复回归）

- **根因**：9/4 重跑 build.sh 重建时，旧 decode 树里的两个关键处理没沉淀进 patches/ —— ① `Config.Single_Game=false`（跳过 TapTap 登录链）；② 解密资源 `www/{js,data}`。MuMu 上 TapTap 未登录 → 登录检查失败 `finish()` → 启动 1 秒闪退（无 crash 日志）；平板因 TapTap 已登录 + 旧构建而未暴露
- **修复**：`Config.smali` 入 patches/；build.sh 增加解密资源换入步骤；两者均已文档化
- **回归**：MuMu（pm clear 全新数据）：进标题画面 ✓ 悬浮球 ✓ 面板 v8 完整渲染 ✓；平板（install -r 保留存档）：进标题 ✓ 悬浮球位置记忆 ✓ 面板 ✓ —— **全部通过**

## 验收记录（2026-09-04，外围 SDK 剥离）

双设备（平板 + MuMu）安装 `build/PlayAgain-mod.apk`（md5 `64bde54e...`），冷启动 + CDP 运行时抽查：

- **冷启动直达**：CDP 确认 `document.title=MOD_LOADED`、`scene=Scene_Title`（直达标题，无隐私弹窗/登录门）
- **奖励直发**：`window.showRewardAd` 运行时为**直发补丁**（`TorchMapMapper.put` + `setTimeout` 直接触发回调）——"看广告换奖励"点了即发
- **logcat**：无 `NoClassDefFoundError`/`VerifyError`/SDK 报错；进程存活
- **已知限制**：游戏模式拦截 adb 触摸注入，"看广告换奖励 / 悬浮球+面板"的字面点击需真实手指（自动化到运行时链路为止）
