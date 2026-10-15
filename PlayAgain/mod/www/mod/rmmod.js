/* RMToolboxM 作弊 mod —— 去壳直装版 v9 (Vue 3 + Naive UI)
 * - 作弊核心：钩子 + 命令（Java 桥），启动即生效
 * - UI：仿 RMCH，Vue 3 + Naive UI，**懒加载**：1.7MB vendor 不拖游戏启动，首次点开面板才注入
 * - 两款游戏共用同一份源码，仅 GAME_NAME 不同（PlayAgain / PlayAgain2 两份文件保持逐字一致）
 */
(function () {
    'use strict';
    if (window.__RMMOD_LOADED) return;
    window.__RMMOD_LOADED = true;
    try { document.title = 'MOD_LOADED'; } catch (e) {}

    var GAME_NAME = '再刷一把';
    var MOD_VER = 'v9';

    function L(m) { try { console.log('[RMMOD] ' + m); if (window.MOD && window.MOD.log) window.MOD.log(String(m)); } catch (e) {} }

    /* 页面重载（如 WebView reload）时 JS 面板状态丢失；若上次面板开着，原生球仍是隐藏态，
       用户将再也点不开面板。启动时无条件把球显示回来。 */
    try { if (window.MOD && window.MOD.setBallVisible) window.MOD.setBallVisible(true); } catch (e) {}

    /* ==================== 状态 ==================== */
    var BOOL_KEYS = ['invincible', 'onehit', 'noskill', 'through', 'noencounter', 'dash', 'lockhp', 'lockhpmax', 'lockmp', 'locktp'];
    // [最小, 最大, 默认, 小数位]
    var NUM_LIMITS = {
        expmult: [1, 100, 1, 1], goldmult: [1, 100, 1, 1], dropmult: [1, 100, 1, 0], movespeed: [0, 3, 0, 1],
        lockhpval: [0, 99999999, 0, 0], lockmpval: [0, 99999999, 0, 0], locktpval: [0, 99999, 0, 0]
    };
    function defaultState() {
        var s = {};
        for (var i = 0; i < BOOL_KEYS.length; i++) s[BOOL_KEYS[i]] = false;
        for (var k in NUM_LIMITS) s[k] = NUM_LIMITS[k][2];
        return s;
    }
    /* 值规范化：旧版本允许倍率滑到 0（金币/经验获取直接归零），且持久化后每次启动都带着 0；
       这里统一夹到合法区间，读档与写入都过一遍 */
    function normValue(k, v) {
        if (BOOL_KEYS.indexOf(k) >= 0) return !!v;
        var lim = NUM_LIMITS[k];
        if (!lim) return v;
        var n = Number(v);
        if (v === null || v === '' || !isFinite(n)) n = lim[2];
        n = Math.min(lim[1], Math.max(lim[0], n));
        var p = Math.pow(10, lim[3]);
        return Math.round(n * p) / p;
    }
    // 普通对象起步（钩子立即可用）；UI 懒加载完成时包装为 reactive。
    var state = defaultState();
    try {
        var saved = JSON.parse(localStorage.getItem('rmmod-cheats') || 'null');
        if (saved && typeof saved === 'object') {
            for (var sk in state) if (sk in saved) state[sk] = normValue(sk, saved[sk]);
        }
    } catch (e) {}

    // 钩子专用的原始对象引用：initUi 会把 state 换成同一对象的响应式代理，cfg 始终指向原对象
    var cfg = state;

    var persistT = null;
    function persistState() {
        if (persistT) clearTimeout(persistT);
        // 防抖 300ms：拖滑条不每帧同步写 localStorage
        persistT = setTimeout(function () {
            persistT = null;
            try {
                var out = {};
                for (var k in state) out[k] = state[k];
                localStorage.setItem('rmmod-cheats', JSON.stringify(out));
            } catch (e) {}
        }, 300);
    }
    function setState(k, v) {
        if (!(k in state)) return;
        state[k] = normValue(k, v);
        persistState();
    }
    function toggleState(k) { setState(k, !state[k]); }

    /* ==================== 游戏对象 ==================== */
    function party() { try { return window.$gameParty || null; } catch (e) { return null; } }
    function pActors() { try { var a = window.$gameActors; return a ? a._data : null; } catch (e) { return null; } }
    function inBattle() { try { var p = party(); return !!(p && p.inBattle && p.inBattle()); } catch (e) { return false; } }
    function isActorObj(b) { try { return !!(b && b.isActor && b.isActor()); } catch (e) { return false; } }
    function onMap() { try { return !!(window.$gameMap && $gameMap.mapId && $gameMap.mapId() > 0); } catch (e) { return false; } }
    function dataArr(kind) {
        try {
            return kind === 'item' ? window.$dataItems : kind === 'weapon' ? window.$dataWeapons
                : kind === 'armor' ? window.$dataArmors : kind === 'skill' ? window.$dataSkills : null;
        } catch (e) { return null; }
    }
    function sceneClass(name) { try { return window[name] || null; } catch (e) { return null; } }
    function actorById(id, create) {
        try {
            var ga = window.$gameActors; if (!ga) return null;
            if (!create) return (ga._data && ga._data[id]) || null; // 不触发实例化
            return ga.actor(id) || null;
        } catch (e) { return null; }
    }

    function itemCount(kind, id) {
        try {
            var p = party(); if (!p) return 0;
            var arr = dataArr(kind);
            if (!arr || !arr[id]) return 0;
            if (typeof p.numItems === 'function') { var n = p.numItems(arr[id]); return n || 0; }
            return 0;
        } catch (e) { return 0; }
    }

    /* ==================== 作弊函数 ====================
       返回约定：'ok' | 'ok:提示' | 'warn:提示' | 'err:提示'（UI 据此弹 toast） */
    var NO_GAME = 'warn:游戏数据未就绪';
    var bypassMult = false; // 修改器自身加金币时不吃金钱倍率

    function recoverAll() {
        var p = party(); if (!p) return NO_GAME;
        var list = [];
        try { list = p.allMembers ? p.allMembers() : (p.members ? p.members() : []); } catch (e) {}
        var n = 0;
        for (var i = 0; i < list.length; i++) {
            var a = list[i]; if (!a) continue;
            try {
                // setHp 走 refresh：HP>0 时引擎自动移除战斗不能状态（复活），其余状态保留
                if (a.setHp) a.setHp(a.mhp); else a._hp = a.mhp;
                if (a.setMp) a.setMp(a.mmp); else a._mp = a.mmp;
                var mtp = typeof a.maxTp === 'function' ? a.maxTp() : 100;
                if (a.setTp) a.setTp(mtp); else a._tp = mtp;
                n++;
            } catch (e) {}
        }
        try { p.requestMotionRefresh(); } catch (e) {}
        return n ? 'ok:已回满 ' + n + ' 人' : 'warn:队伍为空';
    }
    function curGold() { var p = party(); try { return p ? (typeof p.gold === 'function' ? p.gold() : (p._gold || 0)) : 0; } catch (e) { return 0; } }
    function changeGold(delta) {
        var p = party(); if (!p) return false;
        delta = Math.round(delta) || 0;
        bypassMult = true;
        try {
            if (delta > 0) p.gainGold(delta);
            else if (delta < 0) { if (p.loseGold) p.loseGold(-delta); else p.gainGold(delta); }
        } finally { bypassMult = false; }
        return true;
    }
    function setGold(v) {
        if (!party()) return NO_GAME;
        changeGold(Math.max(0, Math.round(Number(v) || 0)) - curGold());
        return 'ok:金币 = ' + curGold();
    }
    function addGold(v) {
        if (!party()) return NO_GAME;
        var before = curGold();
        changeGold(Number(v) || 0);
        var now = curGold();
        if (v > 0 && now === before) return 'warn:金币已达上限 ' + now;
        return 'ok:金币 = ' + now;
    }
    function itemName(kind, id) { var arr = dataArr(kind); return (arr && arr[id] && arr[id].name) || ('#' + id); }
    function giveItem(kind, id, qty) {
        var arr = dataArr(kind), p = party(); if (!arr || !p) return NO_GAME;
        if (!arr[id]) return 'err:不存在的 ID ' + id;
        qty = Math.round(Number(qty) || 0);
        if (qty > 0) p.gainItem(arr[id], qty, false);
        else if (qty < 0) p.loseItem(arr[id], -qty, false);
        return 'ok:' + itemName(kind, id) + ' 持有 ' + itemCount(kind, id);
    }
    function setItemCount(kind, id, count) {
        var arr = dataArr(kind), p = party(); if (!arr || !p) return NO_GAME;
        if (!arr[id]) return 'err:不存在的 ID ' + id;
        count = Math.max(0, Math.round(Number(count) || 0));
        var delta = count - itemCount(kind, id);
        if (delta > 0) p.gainItem(arr[id], delta, false);
        else if (delta < 0) p.loseItem(arr[id], -delta, false);
        var now = itemCount(kind, id);
        if (now !== count) return 'warn:' + itemName(kind, id) + ' 持有 ' + now + '（受上限限制）';
        return 'ok:' + itemName(kind, id) + ' 持有 ' + now;
    }
    /* 批量发放：跳过数据库里的空名占位条目；物品跳过"重要物品/隐藏物品"（itypeId 2/3/4），
       剧情钥匙类道具批量塞进背包可能打乱任务流程，需要的话在数据页单独给 */
    function giveAll(kind, count) {
        var arr = dataArr(kind), p = party(); if (!arr || !p) return NO_GAME;
        var n = 0;
        for (var i = 1; i < arr.length; i++) {
            var d = arr[i];
            if (!d || !d.name) continue;
            if (kind === 'item' && d.itypeId && d.itypeId !== 1) continue;
            try { p.gainItem(d, count, false); n++; } catch (e) {}
        }
        return 'ok:已发放 ' + n + ' 种';
    }
    function inParty(id) { var p = party(); try { return !!(p && p._actors && p._actors.indexOf(id) >= 0); } catch (e) { return false; } }
    function partyAdd(id) {
        var p = party(); if (!p) return NO_GAME;
        id = id | 0;
        if (!window.$dataActors || !$dataActors[id]) return 'err:不存在的角色 ' + id;
        if (!inParty(id)) p.addActor(id);
        return inParty(id) ? 'ok:已入队' : 'err:入队失败';
    }
    function partyRemove(id) {
        var p = party(); if (!p) return NO_GAME;
        id = id | 0;
        if (inParty(id)) {
            if (p._actors.length <= 1) return 'warn:队伍至少保留一人';
            p.removeActor(id);
        }
        return 'ok:已离队';
    }
    function skillLearn(actorId, skillId) { var a = actorById(actorId | 0, true); if (!a) return 'err:角色不存在'; a.learnSkill(skillId | 0); return 'ok:已学习'; }
    function skillForget(actorId, skillId) { var a = actorById(actorId | 0, true); if (!a) return 'err:角色不存在'; a.forgetSkill(skillId | 0); return 'ok:已遗忘'; }
    function setSwitch(id, v) { if (!window.$gameSwitches) return NO_GAME; $gameSwitches.setValue(id, !!v); return 'ok:开关 #' + id + ' = ' + (v ? 'ON' : 'OFF'); }
    function setVar(id, v) { if (!window.$gameVariables) return NO_GAME; $gameVariables.setValue(id, v); return 'ok:变量 #' + id + ' = ' + v; }
    function actorRecover(actorId) {
        var a = actorById(actorId | 0, true); if (!a) return 'err:角色不存在';
        try {
            a.setHp(a.mhp); a.setMp(a.mmp);
            a.setTp(typeof a.maxTp === 'function' ? a.maxTp() : 100);
        } catch (e) { return 'err:' + e.message; }
        return 'ok:已全恢复';
    }
    function setActorLevel(actorId, lv) {
        var a = actorById(actorId | 0, true); if (!a) return 'err:角色不存在';
        lv = Math.max(1, Math.round(Number(lv) || 1));
        // MV 的 changeLevel(level, show) 参数是目标等级（旧版误传差值，设 50 级会变成 +40 → 50-当前）
        a.changeLevel(lv, false);
        return 'ok:' + (a.name ? a.name() + ' ' : '') + 'Lv' + a._level;
    }
    /* 兼容 Java 桥旧命令 actor:<id>:<hp|mp|tp|level>:<v> */
    function setActor(actorId, field, v) {
        if (field === 'level') return setActorLevel(actorId, v);
        var a = actorById(actorId | 0, true); if (!a) return 'err:角色不存在';
        if (field === 'hp') a.setHp(v | 0); else if (field === 'mp') a.setMp(v | 0); else if (field === 'tp') a.setTp(v | 0);
        return 'ok';
    }
    function transfer(mapId, x, y) {
        var p = window.$gamePlayer; if (!p) return NO_GAME;
        mapId = mapId | 0;
        if (!window.$dataMapInfos || !$dataMapInfos[mapId]) return 'err:不存在的地图 ' + mapId;
        if (inBattle()) return 'warn:战斗中无法传送';
        p.reserveTransfer(mapId, Math.max(0, x | 0), Math.max(0, y | 0), p.direction ? p.direction() : 2, 0);
        return 'ok:传送中…';
    }
    function killEnemies() {
        if (!inBattle()) return 'warn:不在战斗中';
        var list = [];
        try {
            if (window.$gameTroop && $gameTroop.aliveMembers) list = $gameTroop.aliveMembers();
            else list = (window.BattleManager && BattleManager._enemies) || [];
        } catch (e) {}
        var n = 0;
        for (var i = 0; i < list.length; i++) {
            var e = list[i];
            if (!e || (e.isAlive && !e.isAlive())) continue;
            try {
                e.setHp(0);
                if (e.isAlive && e.isAlive() && e.addState && e.deathStateId) e.addState(e.deathStateId());
                if (e.performCollapse) e.performCollapse();
                n++;
            } catch (err) {}
        }
        return n ? 'ok:已击杀 ' + n + ' 个敌人' : 'warn:没有存活的敌人';
    }
    function escapeBattle() {
        if (!inBattle()) return 'warn:不在战斗中';
        try { BattleManager.processAbort(); } catch (e) { return 'err:' + e.message; }
        return 'ok:已脱离战斗';
    }
    function pushScene(name) {
        var map = { Item: 'Scene_Item', Skill: 'Scene_Skill', Equip: 'Scene_Equip', Status: 'Scene_Status', Menu: 'Scene_Menu', Options: 'Scene_Options' };
        var cls = sceneClass(map[name]); if (!cls || !window.SceneManager) return 'err:场景不可用'; SceneManager.push(cls); return 'ok';
    }
    function repair(what) {
        try {
            if (what === 'fadein') {
                $gameScreen.startFadeIn(30);
                if ($gameScreen.startTint) $gameScreen.startTint([0, 0, 0, 0], 30);
                return 'ok:画面已恢复';
            } else if (what === 'clearpics') { $gameScreen.clearPictures(); return 'ok:已清除图片'; }
            else if (what === 'clearevent') {
                if (!$gameMap._interpreter) return 'warn:没有运行中的事件';
                $gameMap._interpreter.clear();
                return 'ok:已中止事件';
            } else if (what === 'clearmove') {
                if (!$gamePlayer) return NO_GAME;
                $gamePlayer._moveRouteForcing = false;
                if ($gamePlayer.clearMoveRoute) $gamePlayer.clearMoveRoute();
                return 'ok:已解除强制移动';
            } else if (what === 'tomap') {
                var SM = sceneClass('Scene_Map'); if (!SM) return 'err:场景不可用';
                if (!onMap()) return 'warn:请先进入游戏';
                SceneManager.goto(SM); return 'ok:已返回地图';
            } else if (what === 'title') {
                var ST = sceneClass('Scene_Title'); if (!ST) return 'err:场景不可用';
                SceneManager.goto(ST); return 'ok:已返回标题';
            }
        } catch (e) { return 'err:' + e.message; }
        return 'err:未知操作';
    }
    function hasSave() { try { return !!(window.DataManager && DataManager.isThisGameFile(1)); } catch (e) { return false; } }
    /* 与 Scene_Save / Scene_Load 对齐：存前 onBeforeSave（记录 BGM、存档次数），
       读后 onAfterLoad（恢复 BGM 等）+ 版本变更时重载地图；检查返回值，不再一律报成功 */
    function quickSave() {
        if (!window.DataManager || !DataManager.saveGame) return 'err:存档功能不可用';
        if (inBattle()) return 'warn:战斗中不能存档';
        if (!onMap()) return 'warn:请进入游戏后再存档';
        try {
            try { if ($gameSystem && $gameSystem.onBeforeSave) $gameSystem.onBeforeSave(); } catch (e) {}
            var ok = DataManager.saveGame(1);
            if (ok === false) return 'err:存档失败';
            return 'ok:已存档到槽 1';
        } catch (e) { return 'err:' + e.message; }
    }
    function quickLoad() {
        if (!hasSave()) return 'warn:槽 1 没有存档';
        var SM = sceneClass('Scene_Map'); if (!SM) return 'err:场景不可用';
        try {
            var ok = DataManager.loadGame(1);
            if (ok === false) return 'err:读档失败';
            try { if ($gameSystem.onAfterLoad) $gameSystem.onAfterLoad(); } catch (e) {}
            try {
                if (window.$dataSystem && $gameSystem.versionId && $gameSystem.versionId() !== $dataSystem.versionId) {
                    $gamePlayer.reserveTransfer($gameMap.mapId(), $gamePlayer.x, $gamePlayer.y);
                    $gamePlayer.requestMapReload();
                }
            } catch (e) {}
            SceneManager.goto(SM);
            return 'ok:已读档';
        } catch (e) { return 'err:' + e.message; }
    }
    function newGame() {
        var SM = sceneClass('Scene_Map'); if (!SM) return 'err:场景不可用';
        try { DataManager.setupNewGame(); SceneManager.goto(SM); return 'ok:已开始新游戏'; } catch (e) { return 'err:' + e.message; }
    }

    /* 列表数据（UI 直接调用） */
    function getList(kind) {
        var out = [];
        try {
            if (kind === 'map') {
                var mi = window.$dataMapInfos;
                for (var k in mi) { var m = mi[k]; if (m && m.name) out.push({ id: parseInt(k, 10), name: m.name, icon: 0, value: '' }); }
            } else if (kind === 'switch') {
                var sys = window.$dataSystem || null;
                var sn = sys && sys.switches;
                var sd = window.$gameSwitches ? window.$gameSwitches._data : null;
                if (sn && sn.length) for (var i = 1; i < sn.length; i++) out.push({ id: i, name: sn[i] || ('开关 ' + i), icon: 0, value: (sd && sd[i]) ? 'ON' : 'OFF' });
            } else if (kind === 'variable') {
                var sys2 = window.$dataSystem || null;
                var vn = sys2 && sys2.variables;
                var vd = window.$gameVariables ? window.$gameVariables._data : null;
                if (vn && vn.length) for (var i2 = 1; i2 < vn.length; i2++) out.push({ id: i2, name: vn[i2] || ('变量 ' + i2), icon: 0, value: (vd && vd[i2] != null) ? String(vd[i2]) : '0' });
            } else if (kind === 'actor') {
                var da = window.$dataActors || [];
                for (var i3 = 1; i3 < da.length; i3++) {
                    var d = da[i3]; if (!d || !d.name) continue;
                    // 只读"已实例化"的角色：$gameActors.actor(i) 会为所有角色批量 new Game_Actor
                    // 并永久进入存档，列表浏览不该付出这个代价
                    var inst = actorById(i3, false);
                    var inP = inParty(i3);
                    var value = inst ? ((inP ? '在队 ' : '') + 'Lv' + inst._level) : (inP ? '在队' : '');
                    out.push({ id: i3, name: d.name, icon: 0, value: value, inParty: inP });
                }
            } else {
                var src = dataArr(kind);
                if (src) {
                    for (var i4 = 1; i4 < src.length; i4++) {
                        try {
                            var dd = src[i4]; if (!dd || !dd.name) continue;
                            var val = '';
                            if (kind === 'item') val = itemCount('item', i4) + ' 个';
                            else if (kind === 'weapon') val = itemCount('weapon', i4) + ' 件';
                            else if (kind === 'armor') val = itemCount('armor', i4) + ' 件';
                            out.push({ id: i4, name: dd.name, icon: dd.iconIndex || 0, value: val, count: kind === 'skill' ? 0 : itemCount(kind, i4) });
                        } catch (e2) { /* 单条坏数据跳过，不中断整个列表 */ }
                    }
                }
            }
        } catch (e) {}
        return out;
    }

    /* ==================== 钩子 ==================== */
    /* 魔改引擎在子类上重复实现了很多方法（一代 Game_Actor 自有 gainHp、Game_Player 自有
       isMapPassable；二代 Game_Actor/Game_Enemy 各有自己的 gainHp，均已实测确认），只打基类
       prototype 会被覆盖失效。hookMethod 沿原型链找到方法"实际定义层"打补丁；__rmhook 去重避免
       经多个子类重复包装（如 realMoveSpeed 被多次叠加）。
       另注意：两代引擎都没有 isPlayer() 方法，玩家判断用实例身份（self === $gamePlayer）。 */
    function hookMethod(ctor, name, make) {
        try {
            if (!ctor || !ctor.prototype) return false;
            var target = ctor.prototype, o = ctor.prototype;
            while (o) {
                if (Object.prototype.hasOwnProperty.call(o, name)) { target = o; break; }
                o = Object.getPrototypeOf(o);
            }
            var orig = target[name];
            if (typeof orig !== 'function') return false;
            if (orig.__rmhook) return false; // 已在其定义层打过
            var wrapped = make(orig);
            wrapped.__rmhook = true;
            target[name] = wrapped;
            return true;
        } catch (e) { return false; }
    }

    /* 性能：移动/通行类钩子每帧对地图上每个角色调用（几十个事件 × 60fps）。
       - 钩子读 cfg（原始对象）而非 Vue 响应式代理：UI 加载后 state 变成 Proxy，每次读都走 get 陷阱；
         Proxy 写入会同步落到同一个原始对象，所以 cfg 永远是最新值。
       - 由 make(orig) 直接生成包装函数，用 orig.apply(this, arguments) 透传：旧写法
         wrap(this, arguments, orig) 把 arguments 传给另一个函数，每次调用都要分配 arguments 对象。
       - 先判开关再判玩家（二代 $gamePlayer 是 getter，开关关闭时不触发）。 */
    function installHooks() {
        var ok = 0;
        function H(ctor, name, make) { if (hookMethod(ctor, name, make)) ok++; }
        var G = function (n) { try { return window[n] || null; } catch (e) { return null; } };

        /* 倍率 */
        H(G('Game_Actor'), 'gainExp', function (orig) {
            return function (exp) {
                if (exp > 0 && cfg.expmult !== 1) arguments[0] = Math.round(exp * cfg.expmult);
                return orig.apply(this, arguments);
            };
        });
        H(G('Game_Party'), 'gainGold', function (orig) {
            return function (amount) {
                if (!bypassMult && amount > 0 && cfg.goldmult !== 1) arguments[0] = Math.round(amount * cfg.goldmult);
                return orig.apply(this, arguments);
            };
        });
        /* 伤害：一击必杀只对"我方打敌方"生效（混乱时我方互殴不秒队友）；
           无敌在伤害源头把我方受到的正伤害归零（注意 subject 是方法必须调用） */
        H(G('Game_Action'), 'makeDamageValue', function (orig) {
            return function (target) {
                var v = orig.apply(this, arguments);
                if (!(v > 0) || !(cfg.invincible || cfg.onehit)) return v;
                if (cfg.invincible && isActorObj(target)) return 0;
                if (cfg.onehit && target && !isActorObj(target)) {
                    var su = null;
                    try { su = (typeof this.subject === 'function') ? this.subject() : this.subject; } catch (e) {}
                    if (isActorObj(su)) v = Math.max(v, ((target.mhp || target.hp || 99999) * 10));
                }
                return v;
            };
        });
        /* 无敌/免消耗：逐类打（覆盖子类自有实现），且只作用于我方——
           旧版不分敌我，开无敌后敌人同样不掉血、敌人放技能同样免消耗 */
        var battlers = [G('Game_Actor'), G('Game_Enemy'), G('Game_Battler')];
        for (var bi = 0; bi < battlers.length; bi++) {
            var C = battlers[bi];
            if (!C) continue;
            H(C, 'gainHp', function (orig) {
                return function (value) {
                    if (cfg.invincible && value < 0 && isActorObj(this)) arguments[0] = 0;
                    return orig.apply(this, arguments);
                };
            });
            H(C, 'addState', function (orig) {
                return function (stateId) {
                    // 无敌时挡掉"即死"类状态（即死技能/事件直接附加战斗不能，不经过 gainHp）
                    if (cfg.invincible && isActorObj(this)) {
                        try { if (this.deathStateId && stateId === this.deathStateId()) return; } catch (e) {}
                    }
                    return orig.apply(this, arguments);
                };
            });
            H(C, 'skillMpCost', function (orig) {
                return function () { return (cfg.noskill && isActorObj(this)) ? 0 : orig.apply(this, arguments); };
            });
            H(C, 'skillTpCost', function (orig) {
                return function () { return (cfg.noskill && isActorObj(this)) ? 0 : orig.apply(this, arguments); };
            });
        }
        /* 移动：穿墙同时打 isMapPassable（地形）与 isThrough（事件/NPC 碰撞），只对玩家生效；
           移速加成：跟随者的 realMoveSpeed 取自玩家，自动同步 */
        var movers = [G('Game_Player'), G('Game_Character'), G('Game_Event'), G('Game_CharacterBase')];
        for (var mi = 0; mi < movers.length; mi++) {
            var M = movers[mi];
            if (!M) continue;
            H(M, 'isMapPassable', function (orig) {
                return function () {
                    if (cfg.through && this === window.$gamePlayer) return true;
                    return orig.apply(this, arguments);
                };
            });
            H(M, 'isThrough', function (orig) {
                return function () {
                    if (cfg.through && this === window.$gamePlayer) return true;
                    return orig.apply(this, arguments);
                };
            });
            H(M, 'realMoveSpeed', function (orig) {
                return function () {
                    var s = orig.apply(this, arguments);
                    if (cfg.movespeed && this === window.$gamePlayer) s += cfg.movespeed;
                    return s;
                };
            });
        }
        H(G('Game_Player'), 'isDashButtonPressed', function (orig) {
            return function () { return cfg.dash ? true : orig.apply(this, arguments); };
        });
        /* 无遇敌：旧版 hook makeEncounterCount 返回 0——但原版该方法是"给 _encounterCount 赋值"
           而不是返回值，替换后计数器永不重置，走一步就 ≤0 触发遇敌，效果正好相反（每步遇敌）。
           改为让 canEncounter / executeEncounter 返回 false */
        H(G('Game_Player'), 'canEncounter', function (orig) {
            return function () { return cfg.noencounter ? false : orig.apply(this, arguments); };
        });
        H(G('Game_Player'), 'executeEncounter', function (orig) {
            return function () { return cfg.noencounter ? false : orig.apply(this, arguments); };
        });
        /* 掉落：按倍率复制每件掉落物（整数倍） */
        H(G('Game_Enemy'), 'makeDropItems', function (orig) {
            return function () {
                var items = orig.apply(this, arguments);
                var m = Math.round(cfg.dropmult) || 1;
                if (m > 1 && items && items.length) {
                    var out = [];
                    for (var i = 0; i < items.length; i++) for (var j = 0; j < m; j++) out.push(items[i]);
                    return out;
                }
                return items;
            };
        });
        return ok;
    }

    function hookAll() {
        var ok = installHooks();
        /* 二代的 Game_Action/Game_Player 等由 hook.js 从混淆名补回，可能晚于 Game_Battler 就绪；
           安装是幂等的（已包装的方法带 __rmhook 会跳过），前 60s 每 2s 补装一次缺失的钩子 */
        var lateTries = 0;
        var lateTimer = setInterval(function () {
            var n = 0;
            try { n = installHooks(); } catch (e) {}
            if (n) L('late hooks installed (+' + n + ')');
            if (++lateTries >= 30) clearInterval(lateTimer);
        }, 2000);
        /* 锁定：引擎 Game_Battler 没有 update 方法（v7 包装 undefined 每次调用必抛异常，
           锁定从未生效），改用定时回写，地图/战斗都生效。指定值不超过上限 */
        setInterval(function () {
            try {
                if (!(cfg.lockhp || cfg.lockhpmax || cfg.lockmp || cfg.locktp)) return;
                var d = pActors(); if (!d) return;
                for (var i = 1; i < d.length; i++) {
                    var a = d[i]; if (!a) continue;
                    if (a.isAlive && !a.isAlive()) continue;
                    if (cfg.lockhpmax) a._hp = a.mhp;
                    else if (cfg.lockhp) a._hp = cfg.lockhpval > 0 ? Math.min(cfg.lockhpval, a.mhp) : a.mhp;
                    if (cfg.lockmp) a._mp = cfg.lockmpval > 0 ? Math.min(cfg.lockmpval, a.mmp) : a.mmp;
                    if (cfg.locktp) {
                        var mtp = typeof a.maxTp === 'function' ? a.maxTp() : 100;
                        a._tp = cfg.locktpval > 0 ? Math.min(cfg.locktpval, mtp) : mtp;
                    }
                }
            } catch (e) {}
        }, 300);
        L('cheat hooks installed (x' + ok + ')');
    }

    /* ==================== Java 桥命令 ==================== */
    function exec(cmd) {
        if (!cmd) return;
        L('cmd ' + cmd);
        var r = 'ok';
        try {
            var c = cmd.split(':');
            var n1 = parseInt(c[1], 10), n2 = parseInt(c[2], 10);
            switch (c[0]) {
                case 'menu': togglePanel(); break;
                case 'menushow': uiShow(true); break;
                case 'menuhide': uiShow(false); break;
                case 'invincible': case 'onehit': case 'noskill': case 'through': case 'noencounter':
                case 'dash': case 'lockhp': case 'lockhpmax': case 'lockmp': case 'locktp':
                    toggleState(c[0]); break;
                case 'goldmult': case 'expmult': case 'dropmult': case 'movespeed':
                case 'lockhpval': case 'lockmpval': case 'locktpval':
                    setState(c[0], parseFloat(c[1])); break;
                case 'recover': r = recoverAll(); break;
                case 'gold': r = setGold(n1 || 0); break;
                case 'goldadd': r = addGold(n1 || 0); break;
                case 'item': case 'weapon': case 'armor': r = giveItem(c[0], n1, n2 || 1); break;
                case 'itemset': r = setItemCount('item', n1, n2 || 0); break;
                case 'weaponset': r = setItemCount('weapon', n1, n2 || 0); break;
                case 'armorset': r = setItemCount('armor', n1, n2 || 0); break;
                case 'allitems': r = giveAll('item', n1 || 1); break;
                case 'allweapons': r = giveAll('weapon', n1 || 1); break;
                case 'allarmors': r = giveAll('armor', n1 || 1); break;
                case 'partyadd': r = partyAdd(n1); break;
                case 'partyremove': r = partyRemove(n1); break;
                case 'skilllearn': r = skillLearn(n1, n2); break;
                case 'skillforget': r = skillForget(n1, n2); break;
                case 'sw': r = setSwitch(n1, c[2] === '1'); break;
                case 'var': r = setVar(n1, parseFloat(c[2]) || 0); break;
                case 'actor': r = setActor(n1, c[2], parseInt(c[3], 10) || 0); break;
                case 'map': r = transfer(n1, n2 || 0, parseInt(c[3], 10) || 0); break;
                case 'save': r = quickSave(); break;
                case 'load': r = quickLoad(); break;
                case 'newgame': r = newGame(); break;
                case 'scene': r = pushScene(c[1]); break;
                case 'repair': r = repair(c[1]); break;
                case 'kill': r = killEnemies(); break;
                case 'escape': r = escapeBattle(); break;
                default: r = 'unknown';
            }
        } catch (e) { r = 'err:' + e.message; }
        L('cmd result ' + r);
        return r;
    }
    /* 拉取原生命令：每次 takeCommand 都是一次同步 JS→Java 跨线程调用。
       面板关闭时 150ms 一次（点球 → 开面板的响应延迟上限）；面板打开时球已隐藏、
       几乎不会有新命令，页面不可见时也无需响应，都降到 600ms 一次 */
    var pollTick = 0;
    setInterval(function () {
        pollTick++;
        var idle = panelOpen || document.hidden;
        if (idle && (pollTick & 3) !== 0) return;
        try { if (window.MOD && window.MOD.takeCommand) { var c = window.MOD.takeCommand(); if (c) exec(c); } } catch (e) {}
    }, 150);

    /* ==================== Toast（零依赖 DOM 消息，UI 未加载也能用） ==================== */
    var toastHost = null;
    function ensureToastHost() {
        if (toastHost || !document.body) return;
        var s = document.createElement('style');
        s.textContent = [
            '#rm-toasts{position:fixed;left:0;right:0;bottom:24px;display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none;z-index:2147483647!important}',
            '.rm-toast{padding:8px 14px;border-radius:10px;background:rgba(27,31,42,.96);border:1px solid #272c39;color:#eaecf3;font-size:13px;box-shadow:0 6px 22px rgba(0,0,0,.5);opacity:1;transition:opacity .18s,transform .18s;max-width:80vw;pointer-events:none;animation:rmtoast .18s ease-out}',
            '.rm-toast.ok{border-color:rgba(34,197,94,.5);color:#22c55e}',
            '.rm-toast.err{border-color:rgba(239,68,68,.5);color:#ef4444}',
            '.rm-toast.warn{border-color:rgba(245,158,11,.5);color:#f59e0b}',
            '.rm-toast.out{opacity:0;transform:translateY(8px)}',
            '@keyframes rmtoast{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}'
        ].join('\n');
        document.head.appendChild(s);
        toastHost = document.createElement('div');
        toastHost.id = 'rm-toasts';
        document.body.appendChild(toastHost);
    }
    function toast(msg, type) {
        ensureToastHost();
        if (!toastHost) return;
        // 连点时最多同时显示 3 条，避免刷屏
        while (toastHost.childNodes.length >= 3) toastHost.removeChild(toastHost.firstChild);
        var t = document.createElement('div');
        t.className = 'rm-toast' + (type ? ' ' + type : '');
        t.textContent = (type === 'ok' ? '✓ ' : type === 'err' ? '✕ ' : type === 'warn' ? '⚠ ' : '') + msg;
        toastHost.appendChild(t);
        setTimeout(function () { t.classList.add('out'); }, 1800);
        setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2100);
    }
    /* 按返回约定弹 toast */
    function report(r, okMsg) {
        r = r == null ? 'ok' : String(r);
        if (r.indexOf('err:') === 0) toast(r.slice(4) || '执行失败', 'err');
        else if (r.indexOf('warn:') === 0) toast(r.slice(5), 'warn');
        else if (r === 'unknown') toast('未知操作', 'err');
        else toast(r.indexOf('ok:') === 0 ? r.slice(3) : (okMsg || '已执行'), 'ok');
        return r;
    }

    /* ==================== UI 懒加载 ====================
     * vue/naive 共约 1.7MB，不再随游戏启动解析；首次点球/开面板时才注入 <script>。
     * 作弊钩子与 Java 命令通道不依赖 UI，游戏启动即生效。 */
    var uiReady = false, uiBooting = false, uiWantOpen = false;
    var panelOpen = false; // 面板可见状态（命令轮询降频用）
    function loadScript(src, ok) {
        // 加载失败重试时不重复注入已成功的脚本
        if (src.indexOf('vue.global') >= 0 && window.Vue) return ok();
        if (src.indexOf('naive-ui') >= 0 && window.naive) return ok();
        var el = document.createElement('script');
        el.src = src;
        el.onload = ok;
        el.onerror = function () {
            uiBooting = false; uiWantOpen = false;
            if (el.parentNode) el.parentNode.removeChild(el);
            toast('UI 组件加载失败，请重试', 'err');
        };
        document.head.appendChild(el);
    }
    function bootUi() {
        if (uiReady || uiBooting) return;
        uiBooting = true;
        loadScript('mod/vendor/vue.global.prod.js', function () {
            loadScript('mod/vendor/naive-ui.prod.js', function () {
                try { initUi(); uiReady = true; } catch (e) { L('ui init err ' + (e && e.message)); toast('UI 初始化失败', 'err'); }
                uiBooting = false;
                if (uiReady && uiWantOpen) { uiWantOpen = false; try { window.__RMMOD_SHOW(true); } catch (e) {} }
            });
        });
    }
    function togglePanel() {
        if (uiReady) { try { window.__RMMOD_TOGGLE(); } catch (e) {} return; }
        if (!uiBooting) toast('面板加载中…', 'warn');
        uiWantOpen = true;
        bootUi();
    }
    function uiShow(on) {
        if (uiReady) { try { window.__RMMOD_SHOW(on); } catch (e) {} return; }
        uiWantOpen = !!on;
        if (on) bootUi();
    }

    /* MOD UI 元素判定（面板挂载点 / Naive 传送到 body 的弹层 / toast） */
    /* 每个触摸/指针事件都会调用（含游戏画布上的操作）：合并成一次 closest 查询 */
    var MOD_UI_SEL = '#rmmod-ui,.n-modal-container,.n-dialog-container,.v-binder-follower-container,#rm-toasts';
    function isModUiTarget(t) {
        try { return !!(t && t.closest && t.closest(MOD_UI_SEL)); } catch (e) { return false; }
    }

    /* ==================== UI（首次打开面板时才执行；依赖 vendor） ==================== */
    function initUi() {
        var Vue = window.Vue, naive = window.naive;
        if (!Vue || !naive) throw new Error('vendor missing');
        var h = Vue.h;
        var ref = Vue.ref, computed = Vue.computed;
        var defineComponent = Vue.defineComponent;

        /* 状态包装为响应式；持久化由 setState 统一负责 */
        state = Vue.reactive(state);

        var uiPrefs = { tab: 'trainer', dataKind: 'item' };
        try {
            var up = JSON.parse(localStorage.getItem('rmmod-ui') || 'null');
            if (up && typeof up === 'object') for (var uk in uiPrefs) if (uk in up) uiPrefs[uk] = up[uk];
        } catch (e) {}
        function saveUiPrefs(patch) {
            for (var k in patch) uiPrefs[k] = patch[k];
            try { localStorage.setItem('rmmod-ui', JSON.stringify(uiPrefs)); } catch (e) {}
        }

        /* ==================== UI 图标（SVG） ==================== */
        var ICON_PATHS = {
            shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
            sliders: '<line x1="4" y1="6" x2="20" y2="6"/><circle cx="9" cy="6" r="2"/><line x1="4" y1="12" x2="20" y2="12"/><circle cx="15" cy="12" r="2"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="7" cy="18" r="2"/>',
            zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
            coins: '<circle cx="8" cy="8" r="6"/><path d="M16.5 6.5a6 6 0 1 1-8.8 8.4"/>',
            users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
            save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',
            archive: '<rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v12h16V8"/><line x1="10" y1="12" x2="14" y2="12"/>',
            power: '<path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/>',
            refresh: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
            sword: '<path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/>',
            search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
            layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
            box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5"/><line x1="12" y1="13" x2="12" y2="21"/>',
            database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
            map: '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
            heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
            activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
            flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
            hash: '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>',
            lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
            tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
            logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
            eyeoff: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
            wind: '<path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>',
            droplet: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
            trending: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
            gift: '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
            ffwd: '<polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/>',
            grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
            image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
            stop: '<circle cx="12" cy="12" r="10"/><rect x="9" y="9" width="6" height="6"/>',
            sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
            home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
            plus: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
            nav: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
            chevron: '<polyline points="9 18 15 12 9 6"/>',
            close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
        };
        var MIcon = defineComponent({
            name: 'MIcon',
            props: { name: { type: String, required: true }, size: { type: [Number, String], default: 15 } },
            setup: function (props) {
                return function () {
                    var p = ICON_PATHS[props.name] || '';
                    if (!p) return null;
                    return h('svg', {
                        width: props.size, height: props.size, viewBox: '0 0 24 24', fill: 'none',
                        stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
                        innerHTML: p
                    });
                };
            }
        });

        /* ==================== NFlex 补充（此版本 Naive 未内置） ==================== */
        var NAMED_SIZE = { small: 8, medium: 12, large: 16 };
        var EDGE = { start: 'flex-start', end: 'flex-end' };
        function gapOf(size) {
            if (Array.isArray(size)) return size[0] + 'px ' + size[1] + 'px';
            if (typeof size === 'number') return size + 'px';
            if (typeof size === 'string' && NAMED_SIZE[size]) return NAMED_SIZE[size] + 'px';
            return NAMED_SIZE.medium + 'px';
        }
        var NFlex = defineComponent({
            name: 'NFlex',
            props: {
                vertical: { type: Boolean, default: false },
                size: { type: [Number, String, Array], default: 'medium' },
                align: String,
                justify: { type: String, default: 'start' },
                wrap: { type: Boolean, default: true },
                inline: { type: Boolean, default: false }
            },
            setup: function (props, ctx) {
                return function () {
                    return h('div', {
                        style: {
                            display: props.inline ? 'inline-flex' : 'flex',
                            flexDirection: props.vertical ? 'column' : 'row',
                            flexWrap: props.wrap && !props.vertical ? 'wrap' : 'nowrap',
                            alignItems: EDGE[props.align] || props.align || undefined,
                            justifyContent: EDGE[props.justify] || props.justify,
                            gap: gapOf(props.size)
                        }
                    }, ctx.slots.default ? ctx.slots.default() : []);
                };
            }
        });

        /* ==================== 游戏物品 IconSet ==================== */
        /* 优先走游戏运行时管线：二代 img/ 整体加密进 pak，XHR 拿不到文件；
           ImageManager.loadSystem('IconSet') 经游戏解密管线返回 Bitmap，就绪后取 _canvas/_image
           作为裁剪源。3s 内未就绪则并行走一代的 rpgmvp XHR（密钥优先取 $dataSystem.encryptionKey），
           谁先成功用谁；加载中不重复发起。 */
        var iconSetImg = null, iconCache = {}, iconRev = ref(0), iconLoading = false;
        var iconCanvas = null, iconCtx = null; // 裁剪单个图标复用的 32x32 画布（快速滚动列表时不反复创建）
        var ICON_KEY_FALLBACK = 'a7f1bbc90496ca91cfd4c4fd6a33d161';
        function iconLoaded(src, how) {
            if (iconSetImg) return;
            iconSetImg = src; iconCache = {}; iconLoading = false;
            iconRev.value++;
            L('icon set via ' + how + ' ' + src.width + 'x' + src.height);
        }
        function loadIconSet() {
            if (iconSetImg || iconLoading) return;
            iconLoading = true;
            var xhrStarted = false;
            function startXhr() { if (!xhrStarted && !iconSetImg) { xhrStarted = true; loadIconSetXhr(); } }
            try {
                var im = window.ImageManager || (window.TK && TK.$ && TK.$.ImageMrg);
                var bmp = null;
                if (im && typeof im.loadSystem === 'function') { try { bmp = im.loadSystem('IconSet'); } catch (e) {} }
                if (bmp) {
                    var waits = 0;
                    var timer = setInterval(function () {
                        waits++;
                        var ready = false, src = null;
                        try { ready = bmp.isReady ? bmp.isReady() : false; src = bmp._canvas || bmp._image || null; } catch (e) {}
                        if (iconSetImg) { clearInterval(timer); return; }
                        if (ready && src && src.width > 0) { clearInterval(timer); iconLoaded(src, 'game pipeline'); return; }
                        if (waits === 15) startXhr();                   // 3s 未就绪：并行走 XHR
                        if (waits > 150) { clearInterval(timer); startXhr(); } // 30s 放弃管线，由 XHR 收尾
                    }, 200);
                    return;
                }
            } catch (e) { L('icon pipeline err ' + e); }
            startXhr();
        }
        function iconKeyBytes() {
            var hex = '';
            try { hex = (window.$dataSystem && $dataSystem.encryptionKey) || ''; } catch (e) {}
            if (!/^[0-9a-fA-F]{32}$/.test(hex)) hex = ICON_KEY_FALLBACK;
            var out = [];
            for (var j = 0; j < 16; j++) out.push(parseInt(hex.substr(j * 2, 2), 16));
            return out;
        }
        function loadIconSetXhr() {
            function fail(m) { L(m); if (!iconSetImg) iconLoading = false; }
            function loadImg(url) {
                var img = new Image();
                img.onload = function () { iconLoaded(img, 'xhr'); };
                img.onerror = function () { fail('icon img decode err'); };
                img.src = url;
            }
            try {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', 'img/system/IconSet.rpgmvp', true);
                xhr.responseType = 'arraybuffer';
                xhr.onload = function () {
                    try {
                        if (!xhr.response || xhr.response.byteLength <= 32) { loadImg('img/system/IconSet.png'); return; }
                        var body = new Uint8Array(xhr.response, 16);
                        var key = iconKeyBytes();
                        for (var j = 0; j < 16; j++) body[j] ^= key[j];
                        loadImg(URL.createObjectURL(new Blob([body], { type: 'image/png' })));
                    } catch (e) { fail('icon err ' + e); }
                };
                xhr.onerror = function () { loadImg('img/system/IconSet.png'); };
                xhr.send();
            } catch (e) { fail('icon err ' + e); }
        }
        function iconDataUrl(index) {
            if (!iconSetImg || !(index > 0)) return null;
            if (iconCache[index] !== undefined) return iconCache[index];
            var url = null;
            try {
                var x = (index % 16) * 32, y = Math.floor(index / 16) * 32;
                if (x < iconSetImg.width && y < iconSetImg.height) {
                    if (!iconCanvas) { iconCanvas = document.createElement('canvas'); iconCanvas.width = iconCanvas.height = 32; iconCtx = iconCanvas.getContext('2d'); }
                    iconCtx.clearRect(0, 0, 32, 32);
                    iconCtx.drawImage(iconSetImg, x, y, 32, 32, 0, 0, 32, 32);
                    url = iconCanvas.toDataURL(); // 跨源污染画布会抛 SecurityError，吞掉只是不显示图标
                }
            } catch (e) { url = null; }
            iconCache[index] = url;
            return url;
        }
        function iconSrc(index) { iconRev.value; return iconDataUrl(index); }

        /* ==================== 主题（仿 RMCH dark） ==================== */
        var themeOverrides = {
            common: {
                fontSize: '13px', borderRadius: '8px', borderRadiusSmall: '6px',
                primaryColor: '#5b8cff', primaryColorHover: '#7aa4ff', primaryColorPressed: '#4571e0',
                infoColor: '#8b5cf6', infoColorHover: '#a17ff8', infoColorPressed: '#7442e4',
                successColor: '#22c55e', successColorHover: '#3dd47a', successColorPressed: '#17a84c',
                warningColor: '#f59e0b', warningColorHover: '#fbb42a', warningColorPressed: '#d98706',
                errorColor: '#ef4444', errorColorHover: '#f76a6a', errorColorPressed: '#d93030',
                bodyColor: '#0d1016', cardColor: '#141922', modalColor: '#141922', popoverColor: '#1a202b',
                tableColor: '#141922', tableColorHover: 'rgba(91,140,255,0.08)', tableHeaderColor: '#171c26',
                inputColor: '#10141b', inputColorDisabled: '#141821', actionColor: '#1a202b',
                hoverColor: 'rgba(91,140,255,0.11)', borderColor: '#252c3a', dividerColor: '#222936',
                textColorBase: '#e9ecf3', textColor1: '#f4f6fb', textColor2: '#b7becd', textColor3: '#7d8699',
                placeholderColor: '#566074', closeIconColor: '#7d8699',
                boxShadow2: '0 6px 22px rgba(0,0,0,0.5)', boxShadow3: '0 10px 34px rgba(0,0,0,0.58)'
            },
            Card: { paddingMedium: '16px 18px 18px', titleFontSizeMedium: '15px', borderRadius: '16px', borderColor: '#2f3747' },
            DataTable: { thPaddingSmall: '7px 10px', tdPaddingSmall: '6px 10px', thFontWeight: '500', borderRadius: '0', tdColorHover: 'rgba(91,140,255,0.08)' },
            Dialog: { borderRadius: '16px', color: '#141922' },
            Tag: { borderRadius: '6px' }, Button: { fontWeight: '500' }
        };

        /* ==================== 数据定义 ==================== */
        var KIND_LABELS = { item: '物品', weapon: '武器', armor: '防具', actor: '角色', map: '地图', switch: '开关', variable: '变量' };
        var KIND_ORDER = ['item', 'weapon', 'armor', 'actor', 'map', 'switch', 'variable'];
        var KIND_ICONS = { item: 'box', weapon: 'sword', armor: 'shield', actor: 'users', map: 'map', switch: 'flag', variable: 'hash' };
        // 作弊开关：卡片式，点整张卡切换
        var CHEAT_GROUPS = [
            { name: 'battle', title: '战斗', items: [
                { key: 'invincible', label: '无敌', desc: '免伤 · 防即死', icon: 'shield' },
                { key: 'onehit', label: '一击必杀', desc: '秒杀敌人', icon: 'sword' },
                { key: 'noskill', label: '免技能消耗', desc: '不耗 MP/TP', icon: 'zap' }
            ] },
            { name: 'move', title: '移动', items: [
                { key: 'through', label: '穿墙', desc: '无视阻挡', icon: 'layers' },
                { key: 'noencounter', label: '无遇敌', desc: '不触发战斗', icon: 'eyeoff' },
                { key: 'dash', label: '常时奔跑', desc: '一直奔跑', icon: 'wind' }
            ] },
            { name: 'lock', title: '锁定', items: [
                { key: 'lockhp', label: '锁 HP', icon: 'heart', val: 'lockhpval' },
                { key: 'lockhpmax', label: '锁满 HP', desc: '始终满血', icon: 'heart' },
                { key: 'lockmp', label: '锁 MP', icon: 'droplet', val: 'lockmpval' },
                { key: 'locktp', label: '锁 TP', icon: 'activity', val: 'locktpval' }
            ] }
        ];
        // 倍率：预设档位一点即用（替代 1~100 滑条：手机上一格只有约 2px，难以精确），另可自定义
        var RATES = [
            { key: 'expmult', label: '经验倍率', icon: 'trending', presets: [1, 2, 5, 10, 50, 100], custom: true },
            { key: 'goldmult', label: '金钱倍率', icon: 'coins', presets: [1, 2, 5, 10, 50, 100], custom: true },
            { key: 'dropmult', label: '掉落倍率', icon: 'gift', presets: [1, 2, 3, 5, 10], custom: true },
            { key: 'movespeed', label: '移速加成', icon: 'ffwd', presets: [0, 0.5, 1, 1.5, 2, 3], plus: true }
        ];
        var LOCKS = [
            { key: 'lockhpval', label: 'HP', step: 100 },
            { key: 'lockmpval', label: 'MP', step: 100 },
            { key: 'locktpval', label: 'TP', step: 10 }
        ];
        // 快捷操作分组；tone: 图标配色；battle: 仅战斗中可用；confirm: 执行前二次确认
        var QUICK_GROUPS = [
            { title: '战斗', items: [
                { label: '全队回满', act: 'recover', tone: 'green', icon: 'heart' },
                { label: '全灭敌人', act: 'kill', tone: 'red', icon: 'sword', battle: true },
                { label: '逃离战斗', act: 'escape', tone: 'amber', icon: 'logout', battle: true }
            ] },
            { title: '物资', items: [
                { label: '全物品 ×99', act: 'allitems', tone: 'blue', icon: 'box' },
                { label: '全武器 ×99', act: 'allweapons', tone: 'blue', icon: 'sword' },
                { label: '全防具 ×99', act: 'allarmors', tone: 'blue', icon: 'shield' }
            ] },
            { title: '存档', items: [
                { label: '存档 槽1', act: 'save', tone: 'blue', icon: 'save' },
                { label: '读档 槽1', act: 'load', tone: 'violet', icon: 'archive', confirm: '读取槽 1 存档？当前未保存的进度会丢失。' },
                { label: '新游戏', act: 'newgame', tone: 'amber', icon: 'plus', confirm: '开始新游戏？当前未保存的进度会丢失。' },
                { label: '回标题', act: 'title', tone: 'gray', icon: 'home', confirm: '返回标题画面？当前未保存的进度会丢失。' }
            ] },
            { title: '卡死修复', items: [
                { label: '恢复画面', act: 'fadein', tone: 'gray', icon: 'sun' },
                { label: '清除图片', act: 'clearpics', tone: 'gray', icon: 'image' },
                { label: '中止事件', act: 'clearevent', tone: 'gray', icon: 'stop', confirm: '强制中止当前运行的事件？仅在剧情卡死时使用。' },
                { label: '解除强制移动', act: 'clearmove', tone: 'gray', icon: 'nav' },
                { label: '返回地图', act: 'tomap', tone: 'gray', icon: 'map' }
            ] }
        ];

        /* ==================== 根组件 ==================== */
        var ModApp = defineComponent({
            name: 'ModApp',
            components: {
                MIcon: MIcon, NConfigProvider: naive.NConfigProvider, NButton: naive.NButton,
                NInputNumber: naive.NInputNumber, NInput: naive.NInput,
                NDataTable: naive.NDataTable, NModal: naive.NModal
            },
            setup: function () {
                var show = ref(false);
                var tab = ref(uiPrefs.tab === 'data' ? 'data' : 'trainer');
                var dataKind = ref(KIND_LABELS[uiPrefs.dataKind] ? uiPrefs.dataKind : 'item'), dataQuery = ref('');
                var selectedKind = ref('item'), detail = ref(null), detailShow = ref(false);
                var detailValue = ref(1), levelDraft = ref(1), varDraft = ref('');
                var detailX = ref(0), detailY = ref(0);
                var goldDraft = ref(99999);
                var confirmShow = ref(false), confirmMsg = ref(''), confirmFn = null;
                var status = ref({ scene: '', battle: false, map: '', gold: '', party: 0, inGame: false });
                var viewH = ref(window.innerHeight || 600);
                // 悬浮球入口由原生 Java 实现（ModFloatingWindow，挂在 DecorView 上，拖动更跟手）；
                // 这里只负责面板开关，并在开关时通知 Java 侧藏/显球。
                var skillPickerShow = ref(false), skillQ = ref(''), skillRev = ref(0);
                var listRev = ref(0);
                // 面板没开时不重建列表（quick 操作后无需为不可见的表格花时间）
                function refreshList() { if (!show.value) return; listRev.value++; }

                var darkTheme = naive.darkTheme, zhCN = naive.zhCN;

                /* 表格高度跟随屏幕（横屏手机仅 ~360px 高，固定 430px 会在面板里出现双重滚动） */
                // 列表容器在面板里 flex 撑满剩余高度，打开/切页/尺寸变化后量出实际高度给虚拟滚动用
                var tableBox = ref(null), tableMaxH = ref(240);
                function measureTable() {
                    Vue.nextTick(function () {
                        var el = tableBox.value;
                        if (el && el.clientHeight) tableMaxH.value = Math.max(120, el.clientHeight - 38);
                    });
                }
                window.addEventListener('resize', function () { viewH.value = window.innerHeight || viewH.value; measureTable(); });
                var skillTableMaxH = computed(function () { return Math.max(140, Math.min(360, viewH.value - 260)); });

                /* ---- 实时状态 ---- */
                function refreshStatus() {
                    var s = { scene: '', battle: false, map: '', gold: '', party: 0, inGame: false };
                    try {
                        var sceneName = '';
                        if (window.SceneManager && SceneManager._scene) sceneName = SceneManager._scene.constructor.name;
                        s.battle = inBattle();
                        if (s.battle) s.scene = '战斗中';
                        else if (sceneName === 'Scene_Title') s.scene = '标题画面';
                        else if (sceneName === 'Scene_Map') s.scene = '地图';
                        else s.scene = sceneName ? sceneName.replace('Scene_', '') : '';
                    } catch (e) {}
                    s.inGame = onMap();
                    if (s.inGame && s.scene !== '标题画面') {
                        try { s.gold = String(curGold()); } catch (e) {}
                        try { if (window.$gameParty && window.$gameParty._actors) s.party = ($gameParty._actors || []).length; } catch (e) {}
                        try { if (window.$gameMap && typeof $gameMap.displayName === 'function') { var dn = $gameMap.displayName(); if (dn) s.map = dn; } } catch (e) {}
                    }
                    // 面板是单个大组件：每秒整体替换 status 会让整个面板（含开关/倍率/按钮）重渲染一次，
                    // 只有字段真的变化时才替换
                    var o = status.value;
                    if (o.scene !== s.scene || o.battle !== s.battle || o.map !== s.map || o.gold !== s.gold
                        || o.party !== s.party || o.inGame !== s.inGame) status.value = s;
                }

                /* ---- 作弊开关 / 倍率 ---- */
                var activeCount = computed(function () {
                    var n = 0; for (var i = 0; i < BOOL_KEYS.length; i++) if (state[BOOL_KEYS[i]]) n++; return n;
                });
                function groupOn(g) {
                    var on = 0; for (var i = 0; i < g.items.length; i++) if (state[g.items[i].key]) on++;
                    return on;
                }
                function cheatDesc(c) {
                    if (!c.val) return c.desc;
                    var v = Number(state[c.val]) || 0;
                    return v > 0 ? '锁定 ' + v : '锁定满值';
                }
                function rateText(r, v) {
                    if (v === undefined) v = Number(state[r.key]) || 0;
                    if (r.plus) return v ? '+' + v : '默认';
                    return '×' + v;
                }
                function rateChanged(r) { return Number(state[r.key]) !== NUM_LIMITS[r.key][2]; }
                function rateIsCustom(r) { return r.presets.indexOf(Number(state[r.key])) < 0; }
                // 锁定值：清空输入框即 0 = 锁满（占位符显示"满"）
                function setLock(k, v) { setState(k, (v == null || v === '' || isNaN(v)) ? 0 : v); }
                function toggleCheat(k) { toggleState(k); }
                // 输入框清空/输入中途会发 null：忽略，失焦后输入框自动回显当前值
                function setNum(k, v) { if (v == null || v === '' || isNaN(v)) return; setState(k, v); }
                function allOff() {
                    for (var i = 0; i < BOOL_KEYS.length; i++) setState(BOOL_KEYS[i], false);
                    toast('已关闭全部开关', 'ok');
                }
                function resetRates() {
                    for (var i = 0; i < RATES.length; i++) setState(RATES[i].key, NUM_LIMITS[RATES[i].key][2]);
                    toast('倍率已重置', 'ok');
                }
                function setTab(t) { tab.value = t; saveUiPrefs({ tab: t }); if (t === 'data') { refreshList(); measureTable(); } }
                function setKind(k) { dataKind.value = k; dataQuery.value = ''; saveUiPrefs({ dataKind: k }); refreshList(); }

                /* ---- 确认 ---- */
                function askConfirm(msg, fn) { confirmMsg.value = msg; confirmFn = fn; confirmShow.value = true; }
                function doConfirm() { var f = confirmFn; confirmFn = null; confirmShow.value = false; if (f) f(); }
                function cancelConfirm() { confirmFn = null; confirmShow.value = false; }

                /* ---- 快捷操作 ---- */
                function runQuick(act) {
                    var r;
                    if (act === 'recover') r = recoverAll();
                    else if (act === 'kill') r = killEnemies();
                    else if (act === 'escape') r = escapeBattle();
                    else if (act === 'allitems') r = giveAll('item', 99);
                    else if (act === 'allweapons') r = giveAll('weapon', 99);
                    else if (act === 'allarmors') r = giveAll('armor', 99);
                    else if (act === 'save') r = quickSave();
                    else if (act === 'load') r = quickLoad();
                    else if (act === 'newgame') r = newGame();
                    else if (act === 'title') r = repair('title');
                    else r = repair(act);
                    report(r);
                    // 切场景类操作完成后收起面板，直接看到结果
                    if (/^ok/.test(r) && (act === 'load' || act === 'newgame' || act === 'title' || act === 'tomap')) showPanel(false);
                    refreshStatus(); refreshList();
                }
                function quick(a) {
                    if (a.battle && !status.value.battle) { toast('不在战斗中', 'warn'); return; }
                    if (a.act === 'save' && hasSave()) { askConfirm('覆盖存档槽 1？', function () { runQuick('save'); }); return; }
                    if (a.confirm) { askConfirm(a.confirm, function () { runQuick(a.act); }); return; }
                    runQuick(a.act);
                }
                function goldOp(op) {
                    var v = Number(goldDraft.value);
                    if (!isFinite(v) || v < 0) { toast('请输入有效金额', 'warn'); return; }
                    report(op === 'set' ? setGold(v) : addGold(v));
                    refreshStatus();
                }

                /* ---- 数据列表 ---- */
                var allEntries = computed(function () { listRev.value; return getList(dataKind.value); });
                var filtered = computed(function () {
                    var needle = String(dataQuery.value || '').trim().toLowerCase();
                    var base = allEntries.value;
                    if (!needle) return base;
                    return base.filter(function (e) {
                        return String(e.name || '').toLowerCase().indexOf(needle) !== -1 || String(e.id) === needle;
                    });
                });
                var listCls = computed(function () {
                    if (!detail.value || selectedKind.value !== dataKind.value) return null;
                    return detail.value.id;
                });
                var detailKindIcon = computed(function () { return KIND_ICONS[selectedKind.value] || 'box'; });
                function rowIcon(row) {
                    var src = iconSrc(row.icon);
                    return src ? h('img', { src: src, class: 'rm-icon' }) : h('span', { class: 'rm-icon' });
                }

                var columns = computed(function () {
                    iconRev.value; // 图标集加载后重建，驱动行渲染重跑
                    var cols = [];
                    var kind = dataKind.value;
                    if (kind === 'item' || kind === 'weapon' || kind === 'armor') cols.push({ title: '', key: 'ic', width: 40, render: rowIcon });
                    cols.push({
                        title: '名称', key: 'name',
                        render: function (row) {
                            return h('div', { class: 'rm-cell-name' }, [
                                h('span', { class: 'rm-id' }, '#' + row.id),
                                h('span', { class: 'rm-nm' }, row.name || '(无名)')
                            ]);
                        }
                    });
                    cols.push({
                        title: kind === 'map' ? '' : '值', key: 'value', width: kind === 'map' ? 36 : 96, align: 'right',
                        render: function (row) {
                            if (kind === 'map') return h('span', { class: 'rm-chev' }, [h(MIcon, { name: 'chevron', size: 14 })]);
                            if (kind === 'switch') return h('span', { class: 'rm-pill ' + (row.value === 'ON' ? 'ok' : 'off') }, row.value);
                            if (kind === 'actor') {
                                var parts = [];
                                if (row.inParty) parts.push(h('span', { class: 'rm-pill ok' }, '在队'));
                                var lv = String(row.value || '').replace('在队', '').trim();
                                if (lv) parts.push(h('span', { class: 'rm-num' }, lv));
                                return parts.length ? h('span', { class: 'rm-cell-val' }, parts) : h('span', { class: 'rm-num dim' }, '—');
                            }
                            if (row.count != null) return h('span', { class: 'rm-num' + (row.count ? ' acc' : ' dim') }, '×' + row.count);
                            return h('span', { class: 'rm-num' }, row.value === '' ? '—' : row.value);
                        }
                    });
                    return cols;
                });

                var skills = computed(function () { listRev.value; skillRev.value; return getList('skill'); });
                var ownedSkills = computed(function () {
                    skillRev.value;
                    var e = detail.value; if (!e || selectedKind.value !== 'actor') return [];
                    var a = actorById(e.id, false);
                    return (a && a._skills) ? a._skills.slice() : [];
                });
                var filteredSkills = computed(function () {
                    var needle = String(skillQ.value || '').trim().toLowerCase();
                    var base = skills.value;
                    if (!needle) return base;
                    return base.filter(function (e) { return String(e.name || '').toLowerCase().indexOf(needle) !== -1 || String(e.id) === needle; });
                });
                var skillColumns = computed(function () {
                    iconRev.value; skillRev.value; // 依赖图标集与技能变化
                    return [
                        { title: '', key: 'ic', width: 40, render: rowIcon },
                        {
                            title: '技能', key: 'name',
                            render: function (row) {
                                var owned = ownedSkills.value.indexOf(row.id) >= 0;
                                return h('div', { class: 'rm-cell-name' }, [
                                    h('span', { class: 'rm-id' }, '#' + row.id),
                                    h('span', { class: 'rm-nm' }, row.name),
                                    owned ? h('span', { class: 'rm-pill ok' }, '已学') : null
                                ]);
                            }
                        },
                        {
                            title: '操作', key: 'v', width: 64, align: 'right',
                            render: function (row) {
                                var owned = ownedSkills.value.indexOf(row.id) >= 0;
                                return h(naive.NButton, {
                                    size: 'tiny', secondary: true,
                                    type: owned ? 'error' : 'primary',
                                    onClick: function () { toggleSkill(row.id); }
                                }, { default: function () { return owned ? '遗忘' : '学习'; } });
                            }
                        }
                    ];
                });
                function toggleSkill(sid) {
                    var e = detail.value; if (!e) return;
                    var r = ownedSkills.value.indexOf(sid) >= 0 ? skillForget(e.id, sid) : skillLearn(e.id, sid);
                    if (r.indexOf('ok') !== 0) report(r);
                    skillRev.value++;
                }

                /* ---- 选择/详情 ---- */
                // 操作后详情弹窗不关，原地刷新显示的当前值，方便连续修改
                function reloadDetail() {
                    var e = detail.value; if (!e) return;
                    var list = getList(selectedKind.value);
                    for (var i = 0; i < list.length; i++) if (list[i].id === e.id) { detail.value = list[i]; return; }
                }
                var actorInfo = computed(function () {
                    skillRev.value; listRev.value;
                    var e = detail.value; if (!e || selectedKind.value !== 'actor') return null;
                    var a = actorById(e.id, false);
                    if (!a) return null;
                    var info = { level: a._level, maxLevel: 99, hp: '', mp: '' };
                    try { info.maxLevel = a.maxLevel(); } catch (err) {}
                    try { info.hp = a.hp + '/' + a.mhp; info.mp = a.mp + '/' + a.mmp; } catch (err) {}
                    return info;
                });
                function selectRow(row) {
                    selectedKind.value = dataKind.value;
                    detail.value = row;
                    var k = dataKind.value;
                    if (k === 'variable') varDraft.value = String(row.value == null ? '' : row.value);
                    else if (k === 'actor') { var a = actorById(row.id, false); levelDraft.value = a ? a._level : 1; }
                    else if (k === 'map') {
                        // 默认填玩家当前坐标（同图传送即原地；异图常见出生点也多在附近）
                        var p = window.$gamePlayer;
                        detailX.value = p ? (p.x | 0) : 0; detailY.value = p ? (p.y | 0) : 0;
                    }
                    else detailValue.value = row.count != null ? row.count : 1;
                    detailShow.value = true;
                }
                function closeDetail() { detailShow.value = false; }
                function detailLabel() { var e = detail.value; return e ? ('#' + e.id + ' ' + e.name) : ''; }
                function afterEdit(r) { report(r); refreshStatus(); refreshList(); reloadDetail(); }
                function doSetItem(op, n) {
                    var e = detail.value; if (!e) return;
                    var k = selectedKind.value, r;
                    if (op === 'set') {
                        var qty = Number(detailValue.value);
                        if (detailValue.value == null || !isFinite(qty) || qty < 0) { toast('请输入有效数量', 'warn'); return; }
                        r = setItemCount(k, e.id, qty);
                    } else if (op === 'clear') r = setItemCount(k, e.id, 0);
                    else r = giveItem(k, e.id, n);
                    afterEdit(r);
                    detailValue.value = itemCount(k, e.id);
                }
                function doSetSwitch(v) { var e = detail.value; if (!e) return; afterEdit(setSwitch(e.id, v)); }
                function doSetVar() {
                    var e = detail.value; if (!e) return;
                    var s = String(varDraft.value == null ? '' : varDraft.value).trim();
                    // 纯数字按数值存，其它按原文本存（旧版 parseFloat("12abc") 会把文本截成 12）
                    var num = Number(s);
                    afterEdit(setVar(e.id, (s !== '' && isFinite(num)) ? num : s));
                }
                function doActorParty() {
                    var e = detail.value; if (!e) return;
                    afterEdit(e.inParty ? partyRemove(e.id) : partyAdd(e.id));
                }
                function doActorRecover() { var e = detail.value; if (!e) return; afterEdit(actorRecover(e.id)); }
                function doSetLevel() {
                    var e = detail.value; if (!e) return;
                    var lv = Number(levelDraft.value);
                    if (levelDraft.value == null || !isFinite(lv) || lv < 1) { toast('请输入有效等级', 'warn'); return; }
                    afterEdit(setActorLevel(e.id, lv));
                    var a = actorById(e.id, false); if (a) levelDraft.value = a._level;
                }
                function doTransfer() {
                    var e = detail.value; if (!e) return;
                    var r = transfer(e.id, detailX.value | 0, detailY.value | 0);
                    report(r);
                    if (r.indexOf('ok') === 0) { closeDetail(); showPanel(false); }
                }
                function openSkillPicker() {
                    var e = detail.value; if (!e) return;
                    actorById(e.id, true); // 学技能需要实例，此时才实例化
                    detailShow.value = false; skillPickerShow.value = true; skillQ.value = ''; skillRev.value++;
                }
                function closeSkillPicker() { skillPickerShow.value = false; reloadDetail(); refreshList(); detailShow.value = true; }

                function showPanel(on) {
                    on = !!on;
                    if (show.value === on) return;
                    show.value = on;
                    panelOpen = on;
                    if (on) {
                        refreshStatus(); refreshList(); measureTable();
                        /* 图标集偶发加载失败（启动竞态）时，开面板自动补一次 */
                        try { if (!iconSetImg) loadIconSet(); } catch (e) {}
                    } else {
                        detailShow.value = false; skillPickerShow.value = false; cancelConfirm();
                    }
                    // 原生悬浮球在面板打开时藏起来，避免压在面板上
                    try { if (window.MOD && window.MOD.setBallVisible) window.MOD.setBallVisible(!on); } catch (e) {}
                }
                // 供 Java 桥（exec('menu')）调用：原生球点击开/关面板
                window.__RMMOD_TOGGLE = function () { showPanel(!show.value); };
                window.__RMMOD_SHOW = showPanel;

                setInterval(function () { if (show.value) refreshStatus(); }, 1000);

                return {
                    GAME_NAME: GAME_NAME, MOD_VER: MOD_VER,
                    state: state, CHEAT_GROUPS: CHEAT_GROUPS, RATES: RATES, LOCKS: LOCKS, QUICK_GROUPS: QUICK_GROUPS, KIND_LABELS: KIND_LABELS, KIND_ORDER: KIND_ORDER, KIND_ICONS: KIND_ICONS,
                    show: show, tab: tab, dataKind: dataKind, dataQuery: dataQuery, allEntries: allEntries, filtered: filtered, columns: columns, listCls: listCls, iconSrc: iconSrc,
                    activeCount: activeCount, groupOn: groupOn, cheatDesc: cheatDesc, rateText: rateText, rateChanged: rateChanged, rateIsCustom: rateIsCustom, setLock: setLock,
                    allOff: allOff, resetRates: resetRates,
                    tableMaxH: tableMaxH, tableBox: tableBox, skillTableMaxH: skillTableMaxH,
                    detail: detail, detailShow: detailShow, selectedKind: selectedKind, detailValue: detailValue, detailKindIcon: detailKindIcon,
                    levelDraft: levelDraft, varDraft: varDraft, detailX: detailX, detailY: detailY, goldDraft: goldDraft, actorInfo: actorInfo,
                    confirmShow: confirmShow, confirmMsg: confirmMsg, doConfirm: doConfirm, cancelConfirm: cancelConfirm,
                    status: status,
                    darkTheme: darkTheme, zhCN: zhCN, themeOverrides: themeOverrides,
                    toggleCheat: toggleCheat, setNum: setNum, setTab: setTab, setKind: setKind, quick: quick, goldOp: goldOp, refreshList: refreshList,
                    selectRow: selectRow, closeDetail: closeDetail, detailLabel: detailLabel,
                    doSetItem: doSetItem, doSetSwitch: doSetSwitch, doSetVar: doSetVar,
                    doActorParty: doActorParty, doActorRecover: doActorRecover, doSetLevel: doSetLevel, doTransfer: doTransfer,
                    openSkillPicker: openSkillPicker, closeSkillPicker: closeSkillPicker, skillPickerShow: skillPickerShow, skillQ: skillQ,
                    filteredSkills: filteredSkills, skillColumns: skillColumns, ownedSkills: ownedSkills,
                    showPanel: showPanel
                };
            },
            template: `
            <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides" :locale="zhCN"
                               style="position:fixed;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:99990;transform:translate3d(0,0,0);will-change:transform;backface-visibility:hidden;">
              <!-- 悬浮球入口由原生 Java（ModFloatingWindow）实现，见 mod/java -->

              <!-- 面板 -->
              <div v-if="show" class="rm-panel">
                <!-- 头部：标识 + 标题 + 页签（分段控件）+ 关闭；页签并入头部省一整行，横屏手机高度有限 -->
                <div class="rm-head">
                  <div class="rm-logo"><MIcon name="zap" :size="16"/></div>
                  <div class="rm-title">
                    <div class="rm-t1">{{ GAME_NAME }}</div>
                    <div class="rm-t2">MOD 修改器 · {{ MOD_VER }}</div>
                  </div>
                  <div class="rm-tabs" role="tablist">
                    <div class="rm-tab" :class="{act: tab==='trainer'}" role="tab" @click="setTab('trainer')"><MIcon name="sliders" :size="13"/>修改器</div>
                    <div class="rm-tab" :class="{act: tab==='data'}" role="tab" @click="setTab('data')"><MIcon name="database" :size="13"/>数据</div>
                  </div>
                  <div class="rm-iconbtn" role="button" aria-label="关闭" @click="showPanel(false)"><MIcon name="close" :size="17"/></div>
                </div>

                <!-- 状态条 -->
                <div class="rm-strip">
                  <span v-if="status.battle" class="rm-st red"><MIcon name="sword" :size="12"/>战斗中</span>
                  <span v-else-if="status.scene==='标题画面'" class="rm-st violet"><MIcon name="home" :size="12"/>标题</span>
                  <span v-else-if="status.scene==='地图'" class="rm-st green"><MIcon name="map" :size="12"/>地图</span>
                  <span v-else-if="status.scene" class="rm-st">{{ status.scene }}</span>
                  <span v-if="status.map" class="rm-st name"><MIcon name="flag" :size="12"/>{{ status.map }}</span>
                  <span v-if="status.gold" class="rm-st amber"><MIcon name="coins" :size="12"/>{{ status.gold }}</span>
                  <span v-if="status.party" class="rm-st"><MIcon name="users" :size="12"/>{{ status.party }} 人</span>
                  <span v-if="activeCount" class="rm-badge"><i></i>{{ activeCount }} 项生效</span>
                </div>

                <!-- body -->
                <div class="rm-body">
                  <!-- ===== 修改器 ===== -->
                  <template v-if="tab==='trainer'">
                    <section class="rm-sec">
                      <div class="rm-sec-h">
                        <span class="rm-sec-t"><MIcon name="shield" :size="14"/>作弊开关</span>
                        <span v-if="activeCount" class="rm-link red" role="button" @click="allOff">全部关闭</span>
                      </div>
                      <template v-for="g in CHEAT_GROUPS" :key="g.name">
                        <div class="rm-grp">{{ g.title }}<em v-if="groupOn(g)">{{ groupOn(g) }}</em></div>
                        <div class="rm-tiles">
                          <div v-for="c in g.items" :key="c.key" class="rm-tile" :class="{on: state[c.key]}" role="switch" :aria-checked="!!state[c.key]" @click="toggleCheat(c.key)">
                            <span class="rm-tile-ic"><MIcon :name="c.icon" :size="15"/></span>
                            <span class="rm-tile-tx"><b>{{ c.label }}</b><small>{{ cheatDesc(c) }}</small></span>
                          </div>
                        </div>
                      </template>
                      <div class="rm-locks">
                        <label v-for="r in LOCKS" :key="r.key" class="rm-lock">
                          <span>{{ r.label }}</span>
                          <n-input-number size="small" :value="Number(state[r.key]) || null" :min="0" :step="r.step" :show-button="false" placeholder="满" @update:value="v => setLock(r.key, v)"/>
                        </label>
                      </div>
                      <div class="rm-hint">锁定值留空 = 锁满（不会超过上限），需打开对应的"锁 HP / MP / TP"。</div>
                    </section>

                    <section class="rm-sec">
                      <div class="rm-sec-h">
                        <span class="rm-sec-t"><MIcon name="activity" :size="14"/>倍率</span>
                        <span class="rm-link" role="button" @click="resetRates">全部重置</span>
                      </div>
                      <div v-for="r in RATES" :key="r.key" class="rm-rate">
                        <div class="rm-rate-h">
                          <span class="rm-rate-l"><MIcon :name="r.icon" :size="14"/>{{ r.label }}</span>
                          <span class="rm-rate-v" :class="{on: rateChanged(r)}">{{ rateText(r) }}</span>
                        </div>
                        <div class="rm-chips">
                          <span v-for="p in r.presets" :key="p" class="rm-chip" :class="{act: Number(state[r.key])===p}" role="button" @click="setNum(r.key, p)">{{ rateText(r, p) }}</span>
                          <n-input-number v-if="r.custom" size="tiny" class="rm-chip-in" :class="{act: rateIsCustom(r)}" :value="rateIsCustom(r) ? Number(state[r.key]) : null"
                                          :min="1" :max="100" :show-button="false" placeholder="自定义" @update:value="v => setNum(r.key, v)"/>
                        </div>
                      </div>
                    </section>

                    <section class="rm-sec">
                      <div class="rm-sec-h"><span class="rm-sec-t"><MIcon name="zap" :size="14"/>快捷操作</span></div>
                      <div class="rm-gold">
                        <span class="rm-gold-ic"><MIcon name="coins" :size="15"/></span>
                        <n-input-number v-model:value="goldDraft" :min="0" size="small" :show-button="false" placeholder="金额" style="flex:1;min-width:0;"/>
                        <n-button size="small" type="warning" secondary @click="goldOp('add')">增加</n-button>
                        <n-button size="small" secondary @click="goldOp('set')">设为</n-button>
                      </div>
                      <template v-for="g in QUICK_GROUPS" :key="g.title">
                        <div class="rm-grp">{{ g.title }}</div>
                        <div class="rm-acts">
                          <div v-for="a in g.items" :key="a.act" class="rm-act" :class="['t-' + a.tone, {dis: a.battle && !status.battle}]" role="button" @click="quick(a)">
                            <span class="rm-act-ic"><MIcon :name="a.icon" :size="15"/></span>
                            <span class="rm-act-tx">{{ a.label }}</span>
                          </div>
                        </div>
                      </template>
                    </section>
                  </template>

                  <!-- ===== 游戏数据 ===== -->
                  <template v-else>
                    <div class="rm-kinds">
                      <span v-for="k in KIND_ORDER" :key="k" class="rm-kind" :class="{act: dataKind===k}" role="tab" @click="setKind(k)">
                        <MIcon :name="KIND_ICONS[k]" :size="13"/>{{ KIND_LABELS[k] }}
                      </span>
                    </div>
                    <div class="rm-search">
                      <n-input v-model:value="dataQuery" size="small" clearable :placeholder="'搜索' + KIND_LABELS[dataKind] + '名称或 ID'" style="flex:1;min-width:0;">
                        <template #prefix><MIcon name="search" :size="14"/></template>
                        <template #suffix><span class="rm-count">{{ filtered.length }}<template v-if="dataQuery">/{{ allEntries.length }}</template></span></template>
                      </n-input>
                      <div class="rm-iconbtn sq" role="button" aria-label="刷新" @click="refreshList"><MIcon name="refresh" :size="15"/></div>
                    </div>
                    <div class="rm-table fill" ref="tableBox">
                      <n-data-table :columns="columns" :data="filtered" size="small" :bordered="false" :max-height="tableMaxH"
                                    virtual-scroll :row-key="row => row.id" :pagination="false" :row-class-name="row => row.id===listCls ? 'rm-row-selected' : ''"
                                    :row-props="row => ({ style:'cursor:pointer', onClick: () => selectRow(row) })"/>
                    </div>
                  </template>
                </div>
              </div>

              <!-- 详情 modal -->
              <n-modal :show="detailShow" @update:show="v => { if(!v) closeDetail(); }" preset="card" :mask-closable="true" class="rm-modal" style="width:400px;max-width:calc(100vw - 24px);">
                <template #header>
                  <span class="rm-mh">
                    <img v-if="detail && iconSrc(detail.icon)" :src="iconSrc(detail.icon)" class="rm-mh-img"/>
                    <span v-else class="rm-mh-ic"><MIcon :name="detailKindIcon" :size="15"/></span>
                    <span class="rm-mh-tx"><small>{{ KIND_LABELS[selectedKind] }} #{{ detail && detail.id }}</small>{{ detail && detail.name }}</span>
                  </span>
                </template>

                <template v-if="detail">
                  <!-- 物品 / 武器 / 防具 -->
                  <div v-if="selectedKind==='item'||selectedKind==='weapon'||selectedKind==='armor'" class="rm-dl">
                    <div class="rm-stats"><div><small>当前持有</small><b>{{ detail.count != null ? detail.count : detail.value }}</b></div></div>
                    <div class="rm-sub">快速增减</div>
                    <div class="rm-chips">
                      <span class="rm-chip pos" role="button" @click="doSetItem('add', 1)">+1</span>
                      <span class="rm-chip pos" role="button" @click="doSetItem('add', 10)">+10</span>
                      <span class="rm-chip pos" role="button" @click="doSetItem('add', 99)">+99</span>
                      <span class="rm-chip" role="button" @click="doSetItem('add', -1)">-1</span>
                      <span class="rm-chip neg" role="button" @click="doSetItem('clear')">清零</span>
                    </div>
                    <div class="rm-sub">设为指定数量</div>
                    <div class="rm-row">
                      <n-input-number v-model:value="detailValue" :min="0" size="small" style="flex:1;min-width:0;" :show-button="false"/>
                      <n-button size="small" type="primary" @click="doSetItem('set')">设为</n-button>
                    </div>
                  </div>

                  <!-- 角色 -->
                  <div v-else-if="selectedKind==='actor'" class="rm-dl">
                    <div class="rm-stats">
                      <div><small>状态</small><b :class="{ok: detail.inParty}">{{ detail.inParty ? '在队' : '未在队' }}</b></div>
                      <div><small>等级</small><b>{{ actorInfo ? 'Lv' + actorInfo.level : '—' }}</b></div>
                      <div v-if="actorInfo"><small>HP</small><b>{{ actorInfo.hp }}</b></div>
                      <div v-if="actorInfo"><small>MP</small><b>{{ actorInfo.mp }}</b></div>
                    </div>
                    <div class="rm-row">
                      <n-button size="small" :type="detail.inParty ? 'error':'primary'" secondary @click="doActorParty" style="flex:1;">{{ detail.inParty ? '离队':'入队' }}</n-button>
                      <n-button size="small" type="success" secondary @click="doActorRecover" style="flex:1;">全恢复</n-button>
                      <n-button size="small" secondary @click="openSkillPicker" style="flex:1;">技能管理</n-button>
                    </div>
                    <div class="rm-sub">等级{{ actorInfo ? '（上限 ' + actorInfo.maxLevel + '）' : '' }}</div>
                    <div class="rm-row">
                      <n-input-number v-model:value="levelDraft" :min="1" :max="actorInfo ? actorInfo.maxLevel : undefined" size="small" style="flex:1;min-width:0;" :show-button="false"/>
                      <n-button size="small" type="primary" @click="doSetLevel">设等级</n-button>
                    </div>
                  </div>

                  <!-- 地图 -->
                  <div v-else-if="selectedKind==='map'" class="rm-dl">
                    <div class="rm-sub">目标坐标</div>
                    <div class="rm-row">
                      <span class="rm-axis">X</span><n-input-number v-model:value="detailX" :min="0" size="small" style="flex:1;min-width:0;" :show-button="false"/>
                      <span class="rm-axis">Y</span><n-input-number v-model:value="detailY" :min="0" size="small" style="flex:1;min-width:0;" :show-button="false"/>
                    </div>
                    <n-button type="primary" block @click="doTransfer"><template #icon><MIcon name="nav" :size="14"/></template>传送到此地图</n-button>
                    <div class="rm-hint">默认填入当前坐标；目标格不可通行时可配合"穿墙"走出。</div>
                  </div>

                  <!-- 开关 -->
                  <div v-else-if="selectedKind==='switch'" class="rm-dl">
                    <div class="rm-tile wide" :class="{on: detail.value==='ON'}" role="switch" @click="doSetSwitch(detail.value!=='ON')">
                      <span class="rm-tile-ic"><MIcon name="flag" :size="15"/></span>
                      <span class="rm-tile-tx"><b>{{ detail.value==='ON' ? '已开启' : '已关闭' }}</b><small>点击切换</small></span>
                      <span class="rm-tog"></span>
                    </div>
                    <div class="rm-hint warn">开关控制剧情/事件进度，随意修改可能导致流程异常，建议先存档。</div>
                  </div>

                  <!-- 变量 -->
                  <div v-else-if="selectedKind==='variable'" class="rm-dl">
                    <div class="rm-stats"><div><small>当前值</small><b>{{ String(detail.value) }}</b></div></div>
                    <div class="rm-row">
                      <n-input v-model:value="varDraft" size="small" placeholder="数字或文本" style="flex:1;min-width:0;"/>
                      <n-button size="small" type="primary" @click="doSetVar">设置</n-button>
                    </div>
                  </div>
                </template>
              </n-modal>

              <!-- 技能 picker modal -->
              <n-modal :show="skillPickerShow" @update:show="v => { if(!v) closeSkillPicker(); }" preset="card" :mask-closable="true" class="rm-modal" style="width:400px;max-width:calc(100vw - 24px);">
                <template #header>
                  <span class="rm-mh"><span class="rm-mh-ic"><MIcon name="zap" :size="15"/></span><span class="rm-mh-tx"><small>技能管理</small>{{ detail ? detail.name : '' }}</span></span>
                </template>
                <div class="rm-dl">
                  <n-input v-model:value="skillQ" size="small" clearable placeholder="搜索技能名称或 ID">
                    <template #prefix><MIcon name="search" :size="14"/></template>
                  </n-input>
                  <div class="rm-meta">已学 {{ ownedSkills.length }} 个 · 共 {{ filteredSkills.length }} 条</div>
                  <div class="rm-table">
                    <n-data-table :columns="skillColumns" :data="filteredSkills" size="small" :bordered="false" :max-height="skillTableMaxH"
                                  virtual-scroll :row-key="row => row.id" :pagination="false"/>
                  </div>
                </div>
              </n-modal>

              <!-- 确认 modal -->
              <n-modal :show="confirmShow" @update:show="v => { if(!v) cancelConfirm(); }" preset="dialog" type="warning" title="确认操作"
                       :content="confirmMsg" positive-text="继续" negative-text="取消" @positive-click="doConfirm" @negative-click="cancelConfirm"/>
            </n-config-provider>
            `
        });

        /* ==================== 初始化 ==================== */
        function mount() {
            var host = document.createElement('div');
            host.id = 'rmmod-ui';
            // 纯挂载容器：不设置 positioning/z-index/transform，避免 Vue/Naive 重置 z-index，
            // 也避免 transform 让 fixed 后代相对容器定位。层级由面板/球自身的 fixed + 高 z-index 保证。
            host.style.cssText = 'pointer-events:none;';
            document.body.appendChild(host);
            ensureToastHost();

            // 仅剩的必要管线样式：modal 层级 + 选中行 + 动画 + 开关行
            // 注意：游戏侧（如 Graphics._modifyExistingElements 之类的代码）会把内联 zIndex>0 强制清零，
            // 因此球/面板/弹层的层级必须用样式表 !important 锁定（!important 规则优先于内联样式）。
            var s = document.createElement('style');
            s.textContent = [
                // 挂载容器里的 n-config-provider 是 fixed+z-index，被游戏清零后会形成 z=0 的堆叠上下文，
                // 整棵 UI 树（球/面板）都会被压到画布(z=3)之下，所以它本身也必须用 !important 抬高。
                '#rmmod-ui > .n-config-provider{z-index:99990!important}',
                // ---- 设计令牌 ----
                ':root{--rm-bg:#0d1016;--rm-s1:#141922;--rm-s2:#1a202b;--rm-s3:#222936;--rm-bd:#252c3a;--rm-bd2:#2f3747;' +
                '--rm-tx:#e9ecf3;--rm-tx2:#b7becd;--rm-mut:#7d8699;--rm-fnt:#566074;' +
                '--rm-acc:#5b8cff;--rm-grn:#22c55e;--rm-amb:#f59e0b;--rm-red:#ef4444;--rm-vio:#8b5cf6}',
                // ---- 面板骨架 ----
                '.rm-panel{pointer-events:auto;position:fixed;top:8px;right:8px;bottom:8px;width:420px;max-width:calc(100vw - 16px);display:flex;flex-direction:column;' +
                'background:var(--rm-bg);border:1px solid var(--rm-bd2);border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.02) inset;overflow:hidden;' +
                'z-index:2147483002!important;transform:translate3d(0,0,0);will-change:transform;backface-visibility:hidden;color:var(--rm-tx);font-size:13px;' +
                '-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;animation:rmx .2s cubic-bezier(.2,.8,.2,1)}',
                '@keyframes rmx{from{opacity:0;transform:translate3d(14px,0,0)}to{opacity:1;transform:translate3d(0,0,0)}}',
                '.rm-panel input{-webkit-user-select:text;user-select:text}',
                '.rm-head{display:flex;align-items:center;gap:10px;padding:10px 8px 10px 12px;flex:none;background:linear-gradient(160deg,#1a2233 0%,var(--rm-bg) 75%);border-bottom:1px solid var(--rm-bd)}',
                '.rm-logo{width:32px;height:32px;border-radius:10px;flex:none;display:flex;align-items:center;justify-content:center;color:#fff;' +
                'background:linear-gradient(135deg,#6e9bff,#7a5cf6);box-shadow:0 4px 14px rgba(91,140,255,.35)}',
                '.rm-title{min-width:0;flex:1}',
                '.rm-t1{font-size:14.5px;font-weight:650;color:#f4f6fb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.25}',
                '.rm-t2{font-size:11px;color:var(--rm-mut);margin-top:1px;letter-spacing:.2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
                '.rm-badge{flex:none;margin-left:auto;display:inline-flex;align-items:center;gap:5px;height:22px;font-size:11.5px;color:var(--rm-grn);background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.28);border-radius:99px;padding:0 8px;white-space:nowrap}',
                '.rm-badge i{width:6px;height:6px;border-radius:50%;background:var(--rm-grn);box-shadow:0 0 6px var(--rm-grn)}',
                '.rm-iconbtn{flex:none;width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--rm-mut);cursor:pointer;transition:background .15s,color .15s}',
                '.rm-iconbtn:active{background:var(--rm-s3);color:var(--rm-tx)}',
                '.rm-iconbtn.sq{background:var(--rm-s2);border:1px solid var(--rm-bd);width:34px;height:30px;border-radius:8px}',
                // 页签：分段控件
                '.rm-tabs{display:flex;gap:2px;padding:3px;background:var(--rm-s1);border:1px solid var(--rm-bd);border-radius:10px;flex:none}',
                '.rm-tab{display:flex;align-items:center;justify-content:center;gap:5px;height:28px;padding:0 11px;border-radius:7px;color:var(--rm-mut);font-weight:550;font-size:12.5px;cursor:pointer;white-space:nowrap;transition:all .18s}',
                '.rm-tab.act{background:var(--rm-s3);color:#f4f6fb;box-shadow:0 1px 3px rgba(0,0,0,.35)}',
                '.rm-tab.act svg{color:var(--rm-acc)}',
                // 状态条：单行，不换行
                '.rm-strip{display:flex;align-items:center;gap:6px;padding:8px 12px;flex:none;overflow:hidden;border-bottom:1px solid var(--rm-bd);background:#0f131a}',
                '.rm-strip:empty{display:none}',
                '.rm-st{flex:none;display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 8px;border-radius:7px;font-size:11.5px;color:var(--rm-tx2);background:var(--rm-s2);white-space:nowrap;font-variant-numeric:tabular-nums}',
                '.rm-st.name{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis}',
                '.rm-st.green{color:var(--rm-grn);background:rgba(34,197,94,.1)}.rm-st.red{color:var(--rm-red);background:rgba(239,68,68,.12)}',
                '.rm-st.amber{color:var(--rm-amb);background:rgba(245,158,11,.1)}.rm-st.violet{color:#a78bfa;background:rgba(139,92,246,.12)}',
                '.rm-body{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:12px;display:flex;flex-direction:column;gap:12px}',
                // ---- 分区 ----
                '.rm-sec{background:var(--rm-s1);border:1px solid var(--rm-bd);border-radius:13px;padding:12px}',
                '.rm-sec-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:2px}',
                '.rm-sec-t{display:flex;align-items:center;gap:7px;font-weight:650;font-size:13.5px;color:#f1f3f8}',
                '.rm-sec-t svg{color:var(--rm-acc)}',
                '.rm-link{font-size:12px;color:var(--rm-mut);cursor:pointer;padding:4px 2px}',
                '.rm-link.red{color:var(--rm-red)}',
                '.rm-grp{display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--rm-mut);margin:12px 0 7px;letter-spacing:.5px}',
                '.rm-grp em{font-style:normal;font-size:10.5px;color:var(--rm-grn);background:rgba(34,197,94,.12);border-radius:99px;padding:0 6px;line-height:16px}',
                '.rm-hint{font-size:11.5px;color:var(--rm-fnt);margin-top:8px;line-height:1.5}',
                '.rm-hint.warn{color:#b98a3a}',
                '.rm-sub{font-size:11.5px;color:var(--rm-mut);margin:2px 0 -2px}',
                // ---- 开关卡片 ----
                // 开关卡片不再放小开关：竖屏两列时卡片仅 ~150px，开关会把名称挤成省略号；开启态由绿色底/图标表达
                '.rm-tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:8px}',
                '.rm-tile{display:flex;align-items:center;gap:9px;min-width:0;padding:9px 10px;border-radius:11px;background:var(--rm-s2);border:1px solid var(--rm-bd);cursor:pointer;transition:background .18s,border-color .18s,transform .1s}',
                '.rm-tile:active{transform:scale(.98)}',
                '.rm-tile.on{background:linear-gradient(135deg,rgba(34,197,94,.14),rgba(34,197,94,.05));border-color:rgba(34,197,94,.45)}',
                '.rm-tile-ic{flex:none;width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:var(--rm-s3);color:var(--rm-mut);transition:all .18s}',
                '.rm-tile.on .rm-tile-ic{background:var(--rm-grn);color:#06240f}',
                '.rm-tile-tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}',
                '.rm-tile-tx b{font-weight:600;font-size:13px;color:var(--rm-tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
                '.rm-tile.on .rm-tile-tx b{color:#f4f6fb}',
                '.rm-tile-tx small{font-size:11px;color:var(--rm-fnt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
                '.rm-tile.on .rm-tile-tx small{color:#7fbf96}',
                '.rm-tog{flex:none;position:relative;width:28px;height:16px;border-radius:8px;background:#2c3444;transition:background .18s}',
                '.rm-tog::after{content:"";position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:50%;background:#8790a3;transition:transform .18s,background .18s}',
                '.rm-tile.on .rm-tog{background:var(--rm-grn)}',
                '.rm-tile.on .rm-tog::after{transform:translateX(12px);background:#fff}',
                '.rm-locks{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}',
                '.rm-lock{display:flex;align-items:center;gap:6px;min-width:0;background:var(--rm-s2);border:1px solid var(--rm-bd);border-radius:9px;padding:0 0 0 9px}',
                '.rm-lock > span{flex:none;font-size:11.5px;color:var(--rm-mut);font-weight:600}',
                '.rm-lock .n-input-number{flex:1;min-width:0}',
                '.rm-lock .n-input{--n-color:transparent!important;--n-border:none!important;--n-border-hover:none!important;--n-color-focus:transparent!important}',
                // ---- 倍率 ----
                '.rm-rate{padding:10px 0 2px;border-top:1px dashed var(--rm-bd)}',
                '.rm-sec-h + .rm-rate{border-top:none}',
                '.rm-rate-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:7px}',
                '.rm-rate-l{display:flex;align-items:center;gap:6px;color:var(--rm-tx2)}',
                '.rm-rate-l svg{color:var(--rm-mut)}',
                '.rm-rate-v{font-size:13px;font-weight:650;color:var(--rm-mut);font-variant-numeric:tabular-nums}',
                '.rm-rate-v.on{color:var(--rm-amb)}',
                '.rm-chips{display:flex;gap:6px}',
                '.rm-chip{flex:1 1 0;min-width:0;display:inline-flex;align-items:center;justify-content:center;height:28px;padding:0 2px;white-space:nowrap;border-radius:8px;background:var(--rm-s2);border:1px solid var(--rm-bd);color:var(--rm-tx2);font-size:12.5px;font-variant-numeric:tabular-nums;cursor:pointer;transition:all .15s}',
                '.rm-chip:active{transform:scale(.96)}',
                '.rm-chip.act{background:rgba(91,140,255,.16);border-color:rgba(91,140,255,.6);color:#cfdcff;font-weight:600}',
                '.rm-chip.pos{color:#7ee2a2}.rm-chip.neg{color:#f58c8c}',
                '.rm-chip-in{width:70px;flex:none}',
                '.rm-chip-in.act .n-input{--n-border:1px solid rgba(91,140,255,.6)!important}',
                // ---- 快捷操作 ----
                '.rm-gold{display:flex;align-items:center;gap:8px;margin-top:10px;padding:8px;background:var(--rm-s2);border:1px solid var(--rm-bd);border-radius:11px}',
                '.rm-gold-ic{flex:none;width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--rm-amb);background:rgba(245,158,11,.12)}',
                '.rm-acts{display:grid;grid-template-columns:repeat(auto-fill,minmax(116px,1fr));gap:8px}',
                '.rm-act{display:flex;align-items:center;gap:8px;min-width:0;padding:7px 8px;border-radius:11px;background:var(--rm-s2);border:1px solid var(--rm-bd);cursor:pointer;transition:background .15s,transform .1s,opacity .15s}',
                '.rm-act:active{transform:scale(.96);background:var(--rm-s3)}',
                '.rm-act.dis{opacity:.38}',
                '.rm-act-ic{flex:none;width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center}',
                '.rm-act-tx{min-width:0;font-size:12.5px;color:var(--rm-tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
                '.t-green .rm-act-ic{color:var(--rm-grn);background:rgba(34,197,94,.13)}',
                '.t-red .rm-act-ic{color:var(--rm-red);background:rgba(239,68,68,.13)}',
                '.t-amber .rm-act-ic{color:var(--rm-amb);background:rgba(245,158,11,.13)}',
                '.t-blue .rm-act-ic{color:var(--rm-acc);background:rgba(91,140,255,.14)}',
                '.t-violet .rm-act-ic{color:#a78bfa;background:rgba(139,92,246,.14)}',
                '.t-gray .rm-act-ic{color:var(--rm-tx2);background:var(--rm-s3)}',
                // ---- 数据页 ----
                // 分类一行横滑（不换行省高度），隐藏滚动条
                '.rm-kinds{display:flex;gap:6px;overflow-x:auto;flex:none;margin:0 -12px;padding:0 12px;scrollbar-width:none}',
                '.rm-kinds::-webkit-scrollbar{display:none}',
                '.rm-kind{flex:none;display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 10px;border-radius:99px;background:var(--rm-s1);border:1px solid var(--rm-bd);color:var(--rm-tx2);font-size:12.5px;cursor:pointer;transition:all .15s}',
                '.rm-kind svg{color:var(--rm-mut)}',
                '.rm-kind.act{background:var(--rm-acc);border-color:var(--rm-acc);color:#fff;font-weight:600}',
                '.rm-kind.act svg{color:#fff}',
                '.rm-search{display:flex;gap:8px;align-items:center}',
                '.rm-meta{display:flex;justify-content:space-between;font-size:11.5px;color:var(--rm-mut);margin:-4px 2px}',
                '.rm-meta span{color:var(--rm-fnt)}',
                '.rm-table{border:1px solid var(--rm-bd);border-radius:12px;overflow:hidden;background:var(--rm-s1);flex:none}',
                '.rm-table.fill{flex:1 1 0;min-height:120px}',
                '.rm-search,.rm-meta{flex:none}',
                '.rm-count{font-size:11.5px;color:var(--rm-fnt);font-variant-numeric:tabular-nums}',
                '.rm-table .n-data-table-th{font-size:11.5px;color:var(--rm-mut)!important;font-weight:500!important}',
                '.rm-cell-name{display:flex;align-items:baseline;gap:7px;min-width:0}',
                '.rm-id{flex:none;color:var(--rm-fnt);font-size:11.5px;font-variant-numeric:tabular-nums}',
                '.rm-nm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
                '.rm-cell-val{display:inline-flex;align-items:center;gap:6px}',
                '.rm-num{font-size:12.5px;font-variant-numeric:tabular-nums;color:var(--rm-tx2)}',
                '.rm-num.acc{color:#9db8ff;font-weight:600}.rm-num.dim{color:var(--rm-fnt)}',
                '.rm-pill{display:inline-block;font-size:10.5px;font-weight:650;line-height:18px;padding:0 7px;border-radius:99px;letter-spacing:.3px}',
                '.rm-pill.ok{color:var(--rm-grn);background:rgba(34,197,94,.13)}.rm-pill.off{color:var(--rm-mut);background:var(--rm-s3)}',
                '.rm-chev{display:inline-flex;color:var(--rm-fnt)}',
                '.rm-icon{width:24px;height:24px;border-radius:6px;background:var(--rm-s3);display:block;image-rendering:pixelated}',
                '.rm-row-selected .n-data-table-td{background:rgba(91,140,255,.14)!important}',
                // ---- 弹窗 ----
                '.rm-modal{border-radius:16px!important}',
                '.rm-mh{display:flex;align-items:center;gap:10px;min-width:0}',
                '.rm-mh-img{width:32px;height:32px;border-radius:9px;background:#222936;image-rendering:pixelated;flex:none}',
                '.rm-mh-ic{width:32px;height:32px;border-radius:9px;flex:none;display:flex;align-items:center;justify-content:center;color:#5b8cff;background:rgba(91,140,255,.14)}',
                '.rm-mh-tx{display:flex;flex-direction:column;min-width:0;font-size:15px;font-weight:650;line-height:1.3}',
                '.rm-mh-tx small{font-size:11px;font-weight:400;color:#7d8699}',
                '.rm-dl{display:flex;flex-direction:column;gap:12px}',
                '.rm-row{display:flex;gap:8px;align-items:center}',
                '.rm-axis{flex:none;color:#7d8699;font-weight:600;font-size:12px}',
                '.rm-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px}',
                '.rm-stats > div{background:#1a202b;border:1px solid #252c3a;border-radius:10px;padding:8px 10px;display:flex;flex-direction:column;gap:2px;min-width:0}',
                '.rm-stats small{font-size:11px;color:#7d8699}',
                '.rm-stats b{font-size:14px;font-weight:650;font-variant-numeric:tabular-nums;color:#e9ecf3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
                '.rm-stats b.ok{color:#22c55e}',
                '.rm-tile.wide{padding:12px}',
                // 只抬容器的 z-index（对抗游戏清零内联 z-index）；mask 绝不能一起抬——
                // mask 与卡片同为 z:auto 靠 DOM 顺序分层，mask 被抬高后会反过来盖住卡片吃掉点击
                '.n-modal-container,.n-dialog-container{z-index:100000!important}'
            ].join('\n');
            document.head.appendChild(s);

            var app = Vue.createApp(ModApp);
            app.component('MIcon', MIcon);
            app.mount(host);
            L('vue ui mounted');

            // 触摸拦截：游戏的 TouchInput 在 document 上监听 touchstart/touchmove（passive:false），
            // 只要触点在画布坐标内就 preventDefault，导致 MOD UI 内原生滚动和 click 合成全部失效。
            // 在捕获阶段把来自 MOD UI 的触摸事件拦下（stopPropagation），游戏处理器收不到就不会
            // preventDefault；同时避免点面板时游戏角色跟着走/触发确认。
            ['touchstart', 'touchmove', 'touchcancel'].forEach(function (name) {
                document.body.addEventListener(name, function (e) {
                    if (isModUiTarget(e.target)) e.stopPropagation();
                }, true);
            });
            // touchend 额外 preventDefault：彻底抑制原生 click 合成。否则 pointerup 里补丁派发的 click
            // 刚挂载弹窗，紧随其后的真实 click 会落在弹窗遮罩上把弹窗瞬间关掉。
            document.body.addEventListener('touchend', function (e) {
                if (isModUiTarget(e.target)) { e.stopPropagation(); e.preventDefault(); }
            }, true);

            // 键盘隔离：游戏 Input 在 document 上监听 keydown，会对 Backspace/方向键 preventDefault
            // （输入框里删不了字），且把 Q/W/X/Z/Esc 等映射成游戏按键（搜索时打字会让游戏开菜单/确认）。
            // 在 body 冒泡阶段截停来自 MOD UI 的键盘事件：输入框自身已处理完，游戏的 document 监听收不到。
            ['keydown', 'keyup', 'keypress'].forEach(function (name) {
                document.body.addEventListener(name, function (e) {
                    if (isModUiTarget(e.target)) e.stopPropagation();
                }, false);
            });

            // 鼠标隔离：下方触摸补丁合成的 mousedown/mouseup 会冒泡到 document，被游戏 TouchInput
            // 当成点按（点面板时人物朝面板背后的位置走、触发调查）。这里不能直接截停冒泡——Naive 的
            // 滑条拖动依赖 window 上的事件委托——改为让游戏的按下处理忽略来自 MOD UI 的事件；
            // _onLeftButtonDown/_onRelease 是被绑定监听器内部动态调用的，替换后立即生效。
            (function guardGameMouse() {
                var TI = window.TouchInput;
                if (!TI || TI.__rmGuard) return;
                var skipRelease = false;
                if (typeof TI._onLeftButtonDown === 'function') {
                    var down0 = TI._onLeftButtonDown;
                    TI._onLeftButtonDown = function (event) {
                        if (event && isModUiTarget(event.target)) { skipRelease = true; return; }
                        return down0.apply(this, arguments);
                    };
                }
                if (typeof TI._onRelease === 'function') {
                    var rel0 = TI._onRelease;
                    TI._onRelease = function () {
                        if (skipRelease) { skipRelease = false; return; }
                        return rel0.apply(this, arguments);
                    };
                }
                TI.__rmGuard = true;
            })();

            // 触摸补丁：游戏插件对触摸事件 preventDefault，导致整页真实点按都不合成 click
            // （游戏引擎只听 touch 事件所以自身无恙，但 WebView 的 UI 全部失灵）。
            // 这里在 body 上于 pointerup 时对"未移动的按点"重新派发一次 click（覆盖面板 + 各级 modal），
            // 并把随后到达的真实 click 拦截掉以防双重触发。
            // 另外合成 mousedown/mousemove/mouseup：naive 的滑条等组件靠兼容鼠标事件驱动，
            // 而这套事件已被 touchend preventDefault 抑制；只对触摸指针合成，避免鼠标双触发。
            var shimDown = null, shimLast = null; // shimDown: {x,y,t,target,decided: null|'tap'|'h'|'v'}
            function fireMouse(target, type, x, y) {
                if (!target || !target.dispatchEvent) return;
                var syn = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, view: window });
                syn.__rmShim = true;
                target.dispatchEvent(syn);
            }
            document.body.addEventListener('pointerdown', function (e) {
                // 只记录 MOD UI 上的按下：游戏画布上的拖动（每秒上百个 pointermove）随即在首个判断处返回
                shimDown = (e.pointerType === 'touch' && isModUiTarget(e.target)) ? { x: e.clientX, y: e.clientY, t: Date.now(), target: e.target, decided: null } : null;
            }, true);
            document.body.addEventListener('pointermove', function (e) {
                if (!shimDown || e.pointerType !== 'touch') return;
                if (!shimDown.decided) {
                    var dx = e.clientX - shimDown.x, dy = e.clientY - shimDown.y;
                    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 12) shimDown.decided = 'v'; // 纵向滚动，放弃鼠标合成
                    else if (Math.abs(dx) > 12) { shimDown.decided = 'h'; fireMouse(shimDown.target, 'mousedown', e.clientX, e.clientY); fireMouse(e.target, 'mousemove', e.clientX, e.clientY); }
                } else if (shimDown.decided === 'h') {
                    fireMouse(e.target, 'mousemove', e.clientX, e.clientY);
                }
            }, true);
            document.body.addEventListener('pointerup', function (e) {
                var down = shimDown;
                shimDown = null;
                if (!down || e.pointerType !== 'touch') return;
                if (!down.decided) {
                    // 静止点按：补全 mousedown/mouseup
                    fireMouse(e.target, 'mousedown', e.clientX, e.clientY);
                    fireMouse(e.target, 'mouseup', e.clientX, e.clientY);
                } else if (down.decided === 'h') {
                    fireMouse(e.target, 'mouseup', e.clientX, e.clientY);
                }
                var dx = e.clientX - down.x, dy = e.clientY - down.y;
                var still = (dx * dx + dy * dy) < 144 && (Date.now() - down.t) < 800;
                if (!still || !e.target || !e.target.closest) return;
                shimLast = { target: e.target, t: Date.now() };
                var syn = new MouseEvent('click', { bubbles: true, cancelable: true, clientX: e.clientX, clientY: e.clientY, view: window });
                syn.__rmShim = true; // 标记合成事件，避免被下方去重逻辑自己拦掉
                e.target.dispatchEvent(syn);
                var tn = e.target.tagName;
                if (tn === 'INPUT' || tn === 'TEXTAREA') { try { e.target.focus(); } catch (err) {} }
            }, true);
            // 指针被系统取消（如手势被滚动接管）时清掉按下记录，避免下一次点按误判
            // （横向拖滑条中被取消时补一个 mouseup，避免滑条停在"拖动中"状态）
            document.body.addEventListener('pointercancel', function (e) {
                var down = shimDown;
                shimDown = null;
                if (down && down.decided === 'h') fireMouse(down.target, 'mouseup', e.clientX, e.clientY);
            }, true);
            document.body.addEventListener('click', function (e) {
                if (e.__rmShim) return;
                if (shimLast && e.target === shimLast.target && Date.now() - shimLast.t < 600) {
                    e.stopPropagation(); e.preventDefault();
                }
            }, true);
        }

        try { loadIconSet(); } catch (e) {}
        mount();
    }

    /* ==================== 启动（等待游戏类就绪） ==================== */
    /* 只装作弊钩子：UI 懒加载（首次点球由 Java 桥命令触发 bootUi），
       1.7MB vendor 不拖慢游戏启动（二代带壳冷启动已 30~40s）。 */
    var ready = false;
    (function pollReady() {
        try {
            if (!ready && window.Game_Battler && window.Game_Party && window.Game_Actor && window.Game_Enemy && document.body) {
                ready = true;
                try { hookAll(); } catch (e) { L('hookAll err ' + (e && e.message)); }
            }
        } catch (e) {}
        if (!ready) setTimeout(pollReady, 500);
    })();

    L('mod ' + MOD_VER + ' ready (ui lazy)');
})();
