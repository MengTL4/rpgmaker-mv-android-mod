# 《再刷一把》(Play Again) MOD 直装包

## 游戏信息

- 包名 `com.hjgzs.zsyb`，RPG Maker MV 引擎 + 360(qihoo) 加固壳，入口 Activity `com.qihoo.rpgplugin.MainActivity`
- 游戏逻辑全部在 `assets/www`（index.html + js/ + img/）；图片/音频 `.rpgmvp/.rpgmvo` XOR 加密，密钥 `a7f1bbc90496ca91cfd4c4fd6a33d161`
- 测试设备：OPD2404 平板，2120x3000 @420dpi（游戏横屏渲染，截图为 3000x2120 横版）

## 目录内容

| 路径 | 说明 |
|---|---|
| `game.apk` | 原版包（补丁基线，md5 `4563cf23...`，v5.2.5；不入库） |
| `build.sh` | 一键构建：原版 APK → 成品，全自动 |
| `patches/` | 补丁覆盖层（manifest / 入口 smali / index.html），逐项说明见其内 README |
| `decode/` | apktool 反编译产物（已打补丁，调试/查阅用；一键构建不依赖它，不入库） |
| `mod/java/` | 原生 Java：`ModHub`(上下文)、`ModFloatingWindow`(悬浮球)、`ModBridge`(JS 桥) |
| `mod/www/mod/` | `rmmod.js`（Vue3 + Naive UI 面板）+ `vendor/`（本地 vue/naive-ui，无网络依赖） |
| `build/` | 产物 `PlayAgain-mod.apk`（不入库） |
| `decrypt/` `extract/` `original-dex/` | 早期资源解密与结构分析产物（不入库） |
| `backup-save/` `backup-tablet-save/` | 手机/平板测试存档备份（不入库） |

## 架构（混合方案：原生球 + WebView 面板）

- **悬浮球**：`ModFloatingWindow` 挂在 MainActivity 的 DecorView 上（免 `SYSTEM_ALERT_WINDOW` 权限）。LGLTeam/SemiJni 风格**静态**球：深蓝渐变底 + 绿描边 + "MOD" 字样，圆形轮廓阴影，无动画。拖动在原生层（绝对坐标：`setTranslationX(nx - getLeft())`，注意与 margin 混用会漂移），位置存 SharedPreferences `rmmod_prefs`（ball_x/ball_y）
- **面板**：游戏 WebView 内 `rmmod.js` 注入 Vue3 + Naive UI（darkTheme，本地 vendor），修改器 / 数据两个 tab，右上角悬浮。v8 起 vendor（约 1.7MB）**懒加载**：`index.html` 只挂 `rmmod.js`，首次点球开面板时才动态注入 vue/naive，不拖游戏启动
- **桥**：`window.MOD = ModBridge`（`addJavascriptInterface`）。JS 每 300ms `takeCommand()` 拉原生命令（球点击 → `queue("menu")` → JS `__RMMOD_TOGGLE` 开面板）；`setBallVisible` 开面板时藏球；`log` → `Log.i("RMMOD")`
- **入口补丁**：`decode/smali_classes2/com/qihoo/rpgplugin/MainActivity.smali`
  - `createWebsite()` 第 260 行：`invoke-static {p0}, Lcom/rmmod/ModFloatingWindow;->show(Landroid/app/Activity;)V`
  - `onDestroy()` 第 958 行：`invoke-static {}, Lcom/rmmod/ModFloatingWindow;->hide()V`
- manifest 已加 `android:debuggable="true"`（run-as + WebView CDP 调试依赖）

## 功能清单

- 作弊开关（分组折叠）：战斗（无敌/一击必杀/免技能消耗）、移动（穿墙/无遇敌/常时奔跑）、锁定（HP/HP上限/MP/TP）
- 倍率滑条：经验/金钱/掉落 ×1~100，移速加成 0~10
- 锁值步进：锁HP值/锁MP值（步进 100）、锁TP值（步进 10）
- 快捷操作：全队回满/全灭敌人/逃离战斗/金币+99999/全物品×99/全武器/全防具/快速存档/读档/新游戏/转标题/淡入屏幕
- 数据 tab：物品/武器/防具/角色/地图/开关/变量 分类 + 搜索 + naive-ui 虚拟滚动（1152 条目），图标解密渲染
- 作弊状态持久化：localStorage `rmmod-cheats`（watchEffect 即时写回，启动恢复，仿 SemiJni）
- 悬浮球位置持久化：`rmmod_prefs`（SharedPreferences）
  - 注意：`rmmod_prefs.xml` 里 `expmult:` 等带冒号旧键是**早期原生菜单版本的遗留孤儿数据**，现代码不读不写，无害

## WebView 内四大坑与修复（通用经验）

1. **游戏清零内联 z-index**（`Graphics._modifyExistingElements`）→ MOD 层级全部用样式表 `!important` 声明：`#rmmod-ui > .n-config-provider` z-99990、`.rm-panel` z-2147483002、`n-modal` 容器 z-100000。**mask 绝不能跟着抬**，否则遮罩反过来盖住弹窗卡片
2. **游戏在 document 捕获阶段对触摸 preventDefault**（`TouchInput`）→ MOD UI 的 touchstart/move/cancel 在捕获阶段 `stopPropagation`；touchend 再 `preventDefault`（防真实 click 落到刚打开的弹窗遮罩上瞬间关闭）。面板滑条靠兼容鼠标事件 → pointermove 合成 mousedown/mousemove/mouseup，并做**手势方向仲裁**（纵向滚动放弃鼠标合成，防误拖滑条，合成 click 带 `__rmShim` 标记 + 去重）
3. **弹窗卡片钉死在左上角**：面板容器的 `transform: translateZ(0)` 使 modal 容器成为 fixed 后代的包含块 → MOD 容器一律不加 transform
4. **球/按钮点不到（click 被杀）**：原生球不依赖 click（`onTouch` UP 直接 `queue("menu")`）；HTML 层按钮用 pointerup 重派发兜底

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
