/* 《再刷一把2》hook v4
 * 1. 反反篡改：bundle-loader 经 new Function/eval 创建看门狗(console 原生性/CDP 堆栈/
 *    window 黑名单检测，命中即跳 about:blank)。按源码特征拦截：
 *    - Function 构造器：返回空函数，看门狗永不创建；
 *    - setInterval/setTimeout：回调源码含特征则不注册；
 *    - 周期清扫：已泄漏到 window 的反篡改函数置空。
 *    ★ 不替换 window.eval：直接 eval 语义必须保留 —— 游戏替换后所有 eval 变间接求值
 *      (this=window)，Yanfly 参数字符串 eval("this.standardPadding()*2") 在窗口方法内
 *      调用即崩 (TypeError)，开局对话必死。
 * 2. 触摸路由：本作壳环境的 touchstart 监听器会失效(touchend 却正常，原因未明)，
 *    在 capture 阶段补挂 TouchInput 四件套路由(幂等，与原生监听器共存无害)；
 *    另外 MV 的 ErrorPrinter 空元素全屏铺开且 pointer-events:auto，会吃掉全部点击，
 *    设为 none 放行。
 * 3. 全局镜像：游戏把 MV 全局改名并搬进 TK.$(42 键)，且 window 上标准名被删除。
 *    其中 30 个键是 getter 包装(调用返回真身)，10 个管理器是类本体。
 *    用 defineProperty getter 代理镜像到 window 标准名，读写语义与原版一致
 *    (getter 每次取闭包当前值，数据加载/新游戏重赋值后引用自动跟进)。
 * 4. 自动启动：Java 侧触发器与 TapSDK 合规流绑定、在重签包上不会发生，
 *    由本 hook 在页面就绪且 TK.$ 出现后守卫调用 TK.$.SceneMrg.run(Scene_Boot)。
 */
(function () {
    function log(m) {
        try { if (window.MOD && MOD.log) { MOD.log(m); } } catch (e) { }
        try { console.log('[RMMODHOOK] ' + m); } catch (e) { }
    }

    /* ResizeObserver loop 错误（naive-ui 虚拟列表一帧内尺寸未收敛）是浏览器规范
       允许忽略的无害通知，但游戏把 window error 挂到致命错误画面——数据 tab
       角色技能搜索时列表重排即误杀。capture 阶段先于游戏 handler 过滤掉。 */
    window.addEventListener('error', function (e) {
        try {
            var m = (e && (e.message || (e.error && e.error.message))) || '';
            if (m.indexOf('ResizeObserver loop') >= 0) {
                if (e.stopImmediatePropagation) e.stopImmediatePropagation();
                if (e.preventDefault) e.preventDefault();
            }
        } catch (err) { }
    }, true);

    /* ---------- 1. 反反篡改 ---------- */
    function isAntiTamper(src) {
        if (typeof src !== 'string') return false;
        return src.indexOf('killPage') >= 0
            || src.indexOf('checkCssssssss') >= 0
            || src.indexOf('protectWindowWithFakeTail') >= 0
            || (src.indexOf('about:blank') >= 0 && src.indexOf('setInterval') >= 0)
            || (src.indexOf('about:blank') >= 0 && src.indexOf('$dataActors') >= 0);
    }

    var _FC = Function;
    try {
        window.Function = function () {
            var a = arguments, src = a[a.length - 1];
            if (isAntiTamper(src)) {
                log('BLOCKED anti-tamper Function len=' + String(src).length);
                return function () { };
            }
            return _FC.apply(this, a);
        };
        window.Function.prototype = _FC.prototype;
        try { window.Function.prototype.constructor = window.Function; } catch (e) { }
    } catch (e) { log('Function hook fail ' + e); }

    /* 定时器回调特征拦截（不依赖 eval patch 的新防线） */
    try {
        var _SI = window.setInterval, _ST = window.setTimeout;
        window.setInterval = function (fn, ms) {
            if (isAntiTamper(String(fn))) { log('BLOCKED anti-tamper setInterval len=' + String(fn).length); return 0; }
            return _SI.apply(window, arguments);
        };
        window.setTimeout = function (fn, ms) {
            if (isAntiTamper(String(fn))) { log('BLOCKED anti-tamper setTimeout len=' + String(fn).length); return 0; }
            return _ST.apply(window, arguments);
        };
    } catch (e) { log('timer hook fail ' + e); }

    /* 周期清扫：eval 放行后泄漏的反篡改函数（定义与调用间有窗口期，赶在触发前置空） */
    (function sweep() {
        var names = ['killPage', 'checkCssssssss', 'protectWindowWithFakeTail'];
        setInterval(function () {
            for (var i = 0; i < names.length; i++) {
                try {
                    if (typeof window[names[i]] === 'function') {
                        window[names[i]] = function () { };
                        log('swept anti-tamper fn: ' + names[i]);
                    }
                } catch (e) { }
            }
            restoreGameClasses();
            /* WebGL 渲染器热切换：游戏引擎初始化成 PIXI.CanvasRenderer（2d 软绘），
               地图场景仅 ~39fps。引擎保留完整原版 Graphics（_createRenderer 的 webgl
               分支 / render 里的 gl.flush() 兼容），运行时换 WebGLRenderer + 替换
               canvas 元素即可，实测地图场景 39 -> 60fps。失败则保持原样无害。 */
            switchToWebGL();
            /* 镜像巡检：游戏会用 Object.defineProperty 绕过 setter 把箭头函数塞回 window
               （ redefine 不走 [[Set]] ），发现坏形态立即强制重镜像 */
            try {
                if (window.__mvMirrored) {
                    var probe = [window.$gameParty, window.$dataActors, window.Game_Party];
                    for (var pi = 0; pi < probe.length; pi++) {
                        if (typeof probe[pi] === 'function' && !probe[pi].prototype) {
                            window.__mvMirrored = false;
                            log('re-mirror: mirror slot ' + pi + ' clobbered by arrow fn');
                            mirrorGlobals();
                            break;
                        }
                    }
                }
            } catch (e) { }
        }, 150);
    })();

    /* ---------- 2.5 Game_* 类恢复（rmmod.js 面板挂载与金手指依赖） ----------
     * 游戏反调试把 Game_Party/Game_Map/Game_Actor/Game_Enemy/Game_Interpreter 从 window
     * 删除，真身存在混淆名（sduUDsaagdia_g 等），TK.$.temporaryRestore() 是游戏自留的
     * 互备工具（幂等）。rmmod.js 还需要 Game_Battler/Game_CharacterBase/Game_Player/
     * Game_Action，分别从原型链/实例反推/原型特征扫描补齐。 */
    function restoreGameClasses() {
        try {
            if (typeof TK === 'undefined' || !TK.$ || !TK.$.temporaryRestore) return false;
            TK.$.temporaryRestore();
            if (window.Game_Actor && !window.Game_Battler) {
                window.Game_Battler = Object.getPrototypeOf(window.Game_Actor.prototype).constructor;
            }
            if (window.Game_Player && !window.Game_CharacterBase) {
                var ch = Object.getPrototypeOf(window.Game_Player.prototype).constructor; /* Game_Character */
                window.Game_Character = ch;
                window.Game_CharacterBase = Object.getPrototypeOf(ch.prototype).constructor;
            }
            if (!window.Game_Player) {
                try {
                    var gp = TK.$.gamePlayer();
                    if (gp && gp.constructor) window.Game_Player = gp.constructor;
                } catch (e) { }
            }
            if (!window.Game_Action) {
                /* Game_Action 特征：prototype 上同时有 setSubject/apply/itemEffect，扫 window 找混淆真身 */
                for (var k in window) {
                    try {
                        var f = window[k];
                        if (typeof f === 'function' && f.prototype
                            && typeof f.prototype.setSubject === 'function'
                            && typeof f.prototype.apply === 'function'
                            && typeof f.prototype.itemEffect === 'function') {
                            window.Game_Action = f;
                            log('Game_Action restored from window.' + k);
                            break;
                        }
                    } catch (e) { }
                }
            }
            if (!window.__gameClassesRestored
                && window.Game_Battler && window.Game_Party && window.Game_Actor && window.Game_Enemy) {
                window.__gameClassesRestored = true;
                log('Game_* classes restored for rmmod');
            }
            return !!window.__gameClassesRestored;
        } catch (e) { return false; }
    }

    /* ---------- 2. 触摸路由 + ErrorPrinter 放行 ---------- */
    function fixInput() {
        if (window.__modInputFixed) return true;
        try {
            if (!window.TouchInput || !document.getElementById('GameCanvas')) return false;
            var ti = window.TouchInput;
            document.addEventListener('touchstart', function (e) { try { ti._onTouchStart(e); } catch (err) { } }, true);
            document.addEventListener('touchmove', function (e) { try { ti._onTouchMove(e); } catch (err) { } }, true);
            document.addEventListener('touchend', function (e) { try { ti._onTouchEnd(e); } catch (err) { } }, true);
            document.addEventListener('touchcancel', function (e) { try { ti._onTouchCancel(e); } catch (err) { } }, true);
            window.__modInputFixed = true;
            log('touch capture router installed');
        } catch (e) { log('fixInput fail ' + (e && e.message)); }
        return window.__modInputFixed || false;
    }

    function fixErrorPrinter() {
        try {
            var ep = document.getElementById('ErrorPrinter');
            if (ep && ep.style.pointerEvents !== 'none') {
                ep.style.pointerEvents = 'none';
                log('ErrorPrinter pointer-events -> none');
            }
        } catch (e) { }
    }

    /* ---------- 2.8 WebGL 渲染器热切换 ---------- */
    function switchToWebGL() {
        try {
            if (window.__modWebGL) return true;
            if (!window.Graphics || !Graphics._renderer || !window.PIXI || !PIXI.WebGLRenderer) return false;
            if (Graphics.isWebGL()) { window.__modWebGL = true; return true; }
            if (Graphics.hasWebGL && !Graphics.hasWebGL()) return false;
            var old = Graphics._canvas;
            var parent = old && old.parentElement;
            if (!parent) return false;
            var nc = document.createElement('canvas');
            nc.id = old.id;
            nc.width = old.width;
            nc.height = old.height;
            nc.style.cssText = old.style.cssText;
            var nr = new PIXI.WebGLRenderer(old.width, old.height, {
                view: nc, transparent: false, antialias: false, preserveDrawingBuffer: false
            });
            try { Graphics._renderer.destroy(false); } catch (e) { }
            parent.replaceChild(nc, old);
            Graphics._renderer = nr;
            Graphics._canvas = nc;
            Graphics._rendererType = 'webgl';
            Graphics._updateAllElements();
            window.__modWebGL = true;
            log('renderer switched to WebGL ' + nc.width + 'x' + nc.height);
            return true;
        } catch (e) { log('webgl switch fail ' + (e && e.message)); return false; }
    }

    /* ---------- 3. MV 全局镜像(TK.$ -> window 标准名) ---------- */
    var MV_MAP = {
        dataActors: '$dataActors', dataClasses: '$dataClasses', dataSkills: '$dataSkills',
        dataItems: '$dataItems', dataWeapons: '$dataWeapons', dataArmors: '$dataArmors',
        dataEnemies: '$dataEnemies', dataTroops: '$dataTroops', dataStates: '$dataStates',
        dataAnimations: '$dataAnimations', dataTilesets: '$dataTilesets',
        dataCommonEvents: '$dataCommonEvents', dataSystem: '$dataSystem',
        dataMapInfos: '$dataMapInfos', dataMap: '$dataMap', dataConfig: '$dataConfig',
        gameTemp: '$gameTemp', gameSystem: '$gameSystem', gameScreen: '$gameScreen',
        gameTimer: '$gameTimer', gameMessage: '$gameMessage', gameSwitches: '$gameSwitches',
        gameVariables: '$gameVariables', gameSelfSwitches: '$gameSelfSwitches',
        gameActors: '$gameActors', gameParty: '$gameParty', gameTroop: '$gameTroop',
        gameMap: '$gameMap', gamePlayer: '$gamePlayer',
        DataMrg: 'DataManager', ConfigMrg: 'ConfigManager', StorageMrg: 'StorageManager',
        ImageMrg: 'ImageManager', AudioMrg: 'AudioManager', SoundMrg: 'SoundManager',
        TextMrg: 'TextManager', SceneMrg: 'SceneManager', BattleMrg: 'BattleManager',
        PluginMrg: 'PluginManager'
    };

    function mirrorGlobals() {
        if (window.__mvMirrored) return true;
        try {
            if (typeof TK === 'undefined' || !TK.$ || !TK.$.SceneMrg) return false;
            var count = 0;
            Object.keys(MV_MAP).forEach(function (tkName) {
                var stdName = MV_MAP[tkName];
                try {
                    var v = TK.$[tkName];
                    /* 探针：箭头函数没有 prototype 属性（语言规范），类/普通函数有。
                       getter 包装键(箭头)需调用取真身；类本体键(DataMrg 等)直接引用。
                       游戏运行期会把箭头函数原样放回 window（如 $gameParty），此时
                       window 上的"已存在"值是坏的——必须覆盖为调用语义 getter。 */
                    if (stdName in window) {
                        var exist = window[stdName];
                        var vArrow = typeof v === 'function' && !v.prototype;
                        var eArrow = typeof exist === 'function' && !exist.prototype;
                        if (!(vArrow && eArrow)) { count++; return; }
                    }
                    Object.defineProperty(window, stdName, {
                        get: function () {
                            try {
                                var val = TK.$[tkName];
                                if (typeof val === 'function' && !val.prototype) {
                                    try { return val(); } catch (e) { return val; }
                                }
                                return val;
                            } catch (e) { return undefined; }
                        },
                        set: function () { },
                        configurable: true
                    });
                    count++;
                } catch (e) { }
            });
            window.__mvMirrored = true;
            log('MV globals mirrored x' + count + ' (TK.$ proxy)');
            return true;
        } catch (e) { log('mirror fail ' + (e && e.message)); return false; }
    }

    /* ---------- 4. 守卫式自动启动 ---------- */
    (function boot() {
        var tries = 0;
        var inputTries = 0;
        var timer = setInterval(function () {
            tries++;
            fixErrorPrinter();
            if (!window.__modInputFixed && inputTries < 900) { inputTries++; fixInput(); }
            var ready = false;
            try {
                ready = document.readyState === 'complete'
                    && typeof TK !== 'undefined' && TK.$ && TK.$.SceneMrg
                    && typeof window.Scene_Boot === 'function';
            } catch (e) { }
            if (!ready) {
                if (tries > 900) { clearInterval(timer); log('auto-boot timeout (TK/Scene_Boot not ready)'); }
                return;
            }
            clearInterval(timer);
            if (!mirrorGlobals()) log('mirror deferred');
            fixInput();
            /* 略等一拍：若 Java 侧触发器先启动则跳过，避免双重初始化 */
            setTimeout(function () {
                try {
                    var S = TK.$.SceneMrg;
                    if (!S._scene) {
                        S.run(window.Scene_Boot);
                        log('auto-run Scene_Boot OK');
                    } else {
                        log('scene already active (' + (S._scene.constructor && S._scene.constructor.name) + '), skip auto-run');
                    }
                } catch (e) { log('auto-run error ' + (e && e.message)); }
            }, 1200);
        }, 100);
    })();

    log('hook v4 armed, MOD=' + typeof window.MOD);
})();
