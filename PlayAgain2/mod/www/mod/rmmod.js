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

    var GAME_NAME = '再刷一把2';
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

        var uiPrefs = { tab: 'trainer', dataKind: 'item', expanded: ['battle', 'move', 'lock'] };
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
                bodyColor: '#0e1016', cardColor: '#161a23', modalColor: '#1b1f2a', popoverColor: '#1b1f2a',
                tableColor: '#161a23', tableColorHover: 'rgba(91,140,255,0.09)', tableHeaderColor: '#1b1f2a',
                inputColor: '#11141b', inputColorDisabled: '#141821', actionColor: '#1b1f2a',
                hoverColor: 'rgba(91,140,255,0.11)', borderColor: '#272c39', dividerColor: '#242936',
                textColorBase: '#eaecf3', textColor1: '#f2f4f9', textColor2: '#c9cedb', textColor3: '#7c8496',
                placeholderColor: '#5f6779', closeIconColor: '#7c8496',
                boxShadow2: '0 6px 22px rgba(0,0,0,0.5)', boxShadow3: '0 10px 34px rgba(0,0,0,0.58)'
            },
            Card: { paddingSmall: '12px 14px', titleFontSizeSmall: '14px', titleFontWeight: '600', borderColor: '#272c39' },
            DataTable: { thPaddingSmall: '7px 10px', tdPaddingSmall: '5px 10px', thFontWeight: '600', borderRadius: '8px' },
            Tag: { borderRadius: '6px' }, Button: { fontWeight: '500' }
        };

        /* ==================== 数据定义 ==================== */
        var KIND_LABELS = { item: '物品', weapon: '武器', armor: '防具', actor: '角色', map: '地图', switch: '开关', variable: '变量' };
        var KIND_ORDER = ['item', 'weapon', 'armor', 'actor', 'map', 'switch', 'variable'];
        // 作弊开关分组（可折叠）
        var CHEAT_GROUPS = [
            { name: 'battle', title: '战斗', items: [['invincible', '无敌'], ['onehit', '一击必杀'], ['noskill', '免技能消耗']] },
            { name: 'move', title: '移动', items: [['through', '穿墙'], ['noencounter', '无遇敌'], ['dash', '常时奔跑']] },
            { name: 'lock', title: '锁定', items: [['lockhp', '锁 HP'], ['lockhpmax', '锁满 HP'], ['lockmp', '锁 MP'], ['locktp', '锁 TP']] }
        ];
        // 倍率：滑条 + 数字（倍率最低 1，旧版能拖到 0 导致收益归零）
        var RATES = [
            { key: 'expmult', label: '经验', min: 1, max: 100, step: 1, suf: '×' },
            { key: 'goldmult', label: '金钱', min: 1, max: 100, step: 1, suf: '×' },
            { key: 'dropmult', label: '掉落', min: 1, max: 100, step: 1, suf: '×' },
            { key: 'movespeed', label: '移速', min: 0, max: 3, step: 0.5, suf: '+' }
        ];
        var LOCKS = [
            { key: 'lockhpval', label: 'HP 锁定值', step: 100 },
            { key: 'lockmpval', label: 'MP 锁定值', step: 100 },
            { key: 'locktpval', label: 'TP 锁定值', step: 10 }
        ];
        // 快捷操作分组；battle: 仅战斗中可用；confirm: 执行前二次确认
        var QUICK_GROUPS = [
            { title: '战斗', items: [
                { label: '全队回满', act: 'recover', type: 'success', icon: 'heart' },
                { label: '全灭敌人', act: 'kill', type: 'error', icon: 'sword', battle: true },
                { label: '逃离战斗', act: 'escape', type: 'warning', icon: 'logout', battle: true }
            ] },
            { title: '物资', items: [
                { label: '全物品 ×99', act: 'allitems', type: 'default', icon: 'box' },
                { label: '全武器 ×99', act: 'allweapons', type: 'default', icon: 'sword' },
                { label: '全防具 ×99', act: 'allarmors', type: 'default', icon: 'shield' }
            ] },
            { title: '存档', items: [
                { label: '存档(槽1)', act: 'save', type: 'primary', icon: 'save' },
                { label: '读档(槽1)', act: 'load', type: 'default', icon: 'archive', confirm: '读取槽 1 存档？当前未保存的进度会丢失。' },
                { label: '新游戏', act: 'newgame', type: 'warning', icon: 'power', confirm: '开始新游戏？当前未保存的进度会丢失。' },
                { label: '回标题', act: 'title', type: 'default', icon: 'refresh', confirm: '返回标题画面？当前未保存的进度会丢失。' }
            ] },
            { title: '卡死修复', items: [
                { label: '恢复画面', act: 'fadein', type: 'default', icon: 'activity' },
                { label: '清除图片', act: 'clearpics', type: 'default', icon: 'layers' },
                { label: '中止事件', act: 'clearevent', type: 'default', icon: 'close', confirm: '强制中止当前运行的事件？仅在剧情卡死时使用。' },
                { label: '解除强制移动', act: 'clearmove', type: 'default', icon: 'tool' },
                { label: '返回地图', act: 'tomap', type: 'default', icon: 'map' }
            ] }
        ];

        /* ==================== 根组件 ==================== */
        var ModApp = defineComponent({
            name: 'ModApp',
            components: {
                MIcon: MIcon, NConfigProvider: naive.NConfigProvider,
                NCard: naive.NCard, NButton: naive.NButton, NButtonGroup: naive.NButtonGroup,
                NSwitch: naive.NSwitch, NInputNumber: naive.NInputNumber, NInput: naive.NInput,
                NSlider: naive.NSlider, NCollapse: naive.NCollapse, NCollapseItem: naive.NCollapseItem,
                NInputGroup: naive.NInputGroup, NDataTable: naive.NDataTable, NTag: naive.NTag,
                NFlex: NFlex, NText: naive.NText, NModal: naive.NModal,
                NDescriptions: naive.NDescriptions, NDescriptionsItem: naive.NDescriptionsItem,
                NGrid: naive.NGrid, NGridItem: naive.NGridItem
            },
            setup: function () {
                var show = ref(false);
                var tab = ref(uiPrefs.tab === 'data' ? 'data' : 'trainer');
                var dataKind = ref(KIND_LABELS[uiPrefs.dataKind] ? uiPrefs.dataKind : 'item'), dataQuery = ref('');
                var expanded = ref(Array.isArray(uiPrefs.expanded) ? uiPrefs.expanded : ['battle', 'move', 'lock']);
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
                window.addEventListener('resize', function () { viewH.value = window.innerHeight || viewH.value; });
                var tableMaxH = computed(function () { return Math.max(140, viewH.value - 290); });
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
                function groupTitle(g) {
                    var on = 0; for (var i = 0; i < g.items.length; i++) if (state[g.items[i][0]]) on++;
                    return g.title + (on ? '（已开 ' + on + '）' : '');
                }
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
                function setTab(t) { tab.value = t; saveUiPrefs({ tab: t }); if (t === 'data') refreshList(); }
                function setKind(k) { dataKind.value = k; dataQuery.value = ''; saveUiPrefs({ dataKind: k }); refreshList(); }
                function onExpand(names) { expanded.value = names; saveUiPrefs({ expanded: names }); }

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
                var detailKindIcon = computed(function () {
                    return { item: 'box', weapon: 'sword', armor: 'shield', actor: 'users', map: 'map', switch: 'flag', variable: 'hash' }[selectedKind.value] || 'box';
                });
                function rowIcon(row) {
                    var src = iconSrc(row.icon);
                    return src ? h('img', { src: src, style: 'width:22px;height:22px;border-radius:4px;background:#1b1f2a;display:block' }) : h('span');
                }

                var columns = computed(function () {
                    iconRev.value; // 图标集加载后重建，驱动行渲染重跑
                    var cols = [];
                    var kind = dataKind.value;
                    if (kind === 'item' || kind === 'weapon' || kind === 'armor') cols.push({ title: '', key: 'ic', width: 36, render: rowIcon });
                    cols.push({
                        title: '名称', key: 'name',
                        render: function (row) {
                            return h('div', { style: 'display:flex;align-items:baseline;gap:6px;min-width:0' }, [
                                h('span', { style: 'color:#5f6779;font-size:12px;font-variant-numeric:tabular-nums;flex:none' }, '#' + row.id),
                                h('span', { style: 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap' }, row.name || '(无名)')
                            ]);
                        }
                    });
                    if (kind !== 'map') cols.push({
                        title: '值', key: 'value', width: 86, align: 'right',
                        render: function (row) {
                            var st = { fontSize: '12.5px', fontVariantNumeric: 'tabular-nums' };
                            if (kind === 'switch') st.color = row.value === 'ON' ? '#22c55e' : '#7c8496';
                            else if (kind === 'actor' && row.inParty) st.color = '#22c55e';
                            else if (row.count === 0) st.color = '#5f6779';
                            return h('span', { style: st }, row.value || '—');
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
                        { title: '', key: 'ic', width: 36, render: rowIcon },
                        {
                            title: '技能', key: 'name',
                            render: function (row) {
                                var owned = ownedSkills.value.indexOf(row.id) >= 0;
                                return h('div', { style: 'display:flex;align-items:center;gap:6px;min-width:0' }, [
                                    h('span', { style: 'color:#22c55e;flex:none;width:10px' }, owned ? '✓' : ''),
                                    h('span', { style: 'color:#5f6779;font-size:12px;flex:none' }, '#' + row.id),
                                    h('span', { style: 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap' }, row.name)
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
                    try { info.hp = a.hp + ' / ' + a.mhp; info.mp = a.mp + ' / ' + a.mmp; } catch (err) {}
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
                        refreshStatus(); refreshList();
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
                    state: state, CHEAT_GROUPS: CHEAT_GROUPS, RATES: RATES, LOCKS: LOCKS, QUICK_GROUPS: QUICK_GROUPS, KIND_LABELS: KIND_LABELS, KIND_ORDER: KIND_ORDER,
                    show: show, tab: tab, dataKind: dataKind, dataQuery: dataQuery, allEntries: allEntries, filtered: filtered, columns: columns, listCls: listCls, iconSrc: iconSrc,
                    expanded: expanded, onExpand: onExpand, activeCount: activeCount, groupTitle: groupTitle, allOff: allOff, resetRates: resetRates,
                    tableMaxH: tableMaxH, skillTableMaxH: skillTableMaxH,
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
              <div v-if="show" class="rm-panel" style="pointer-events:auto;position:fixed;top:8px;right:8px;bottom:8px;width:440px;max-width:calc(100vw - 16px);display:flex;flex-direction:column;background:#0e1016;border:1px solid #2b3143;border-radius:14px;box-shadow:0 18px 48px rgba(0,0,0,.62),0 2px 10px rgba(0,0,0,.45);overflow:hidden;z-index:2147483002;transform:translate3d(0,0,0);will-change:transform;backface-visibility:hidden;">
                <!-- header -->
                <div style="display:flex;align-items:center;gap:9px;padding:10px 12px 10px 14px;background:linear-gradient(135deg,#1c2434 0%,#161a23 60%);border-bottom:1px solid #272c39;flex:none;">
                  <span style="width:8px;height:8px;border-radius:50%;background:#5b8cff;box-shadow:0 0 10px rgba(91,140,255,.9);flex:none;"></span>
                  <span style="font-weight:600;color:#f2f4f9;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;">{{ GAME_NAME }} MOD</span>
                  <span style="font-size:10.5px;color:#8b93a7;background:rgba(91,140,255,.12);border:1px solid rgba(91,140,255,.35);border-radius:6px;padding:1px 7px;flex:none;">{{ MOD_VER }}</span>
                  <span style="flex:1;"></span>
                  <n-button-group size="small" style="flex:none;">
                    <n-button :type="tab==='trainer'?'primary':'default'" :tertiary="tab!=='trainer'" @click="setTab('trainer')">修改器</n-button>
                    <n-button :type="tab==='data'?'primary':'default'" :tertiary="tab!=='data'" @click="setTab('data')">数据</n-button>
                  </n-button-group>
                  <n-button quaternary circle size="small" @click="showPanel(false)" style="flex:none;"><MIcon name="close" :size="18"/></n-button>
                </div>

                <!-- 状态条 -->
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:7px 12px;background:#11141b;border-bottom:1px solid #272c39;flex:none;">
                  <n-tag v-if="status.battle" size="small" :bordered="false" type="error"><template #icon><MIcon name="sword" :size="12"/></template> 战斗中</n-tag>
                  <n-tag v-else-if="status.scene==='标题画面'" size="small" :bordered="false" type="info"><template #icon><MIcon name="power" :size="12"/></template> 标题</n-tag>
                  <n-tag v-else-if="status.scene==='地图'" size="small" :bordered="false" type="success"><template #icon><MIcon name="map" :size="12"/></template> 地图</n-tag>
                  <n-tag v-else-if="status.scene" size="small" :bordered="false">{{ status.scene }}</n-tag>
                  <n-tag v-if="status.map" size="small" :bordered="false"><template #icon><MIcon name="map" :size="12"/></template> {{ status.map }}</n-tag>
                  <n-tag v-if="status.gold" size="small" :bordered="false" type="warning"><template #icon><MIcon name="coins" :size="12"/></template> {{ status.gold }}</n-tag>
                  <n-tag v-if="status.party" size="small" :bordered="false"><template #icon><MIcon name="users" :size="12"/></template> {{ status.party }}人</n-tag>
                  <span style="flex:1;"></span>
                  <n-tag v-if="activeCount" size="small" :bordered="false" type="success"><template #icon><MIcon name="zap" :size="12"/></template> 已开 {{ activeCount }} 项</n-tag>
                </div>

                <!-- body -->
                <div class="rm-body" style="flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px;">
                  <!-- ===== 修改器 tab ===== -->
                  <n-flex v-if="tab==='trainer'" vertical :size="12">
                    <n-card size="small">
                      <template #header><span style="display:flex;align-items:center;gap:7px;"><MIcon name="sliders" :size="14" style="color:#5b8cff;"/>作弊开关</span></template>
                      <template #header-extra><n-button v-if="activeCount" text size="tiny" type="error" @click="allOff">全部关闭</n-button></template>
                      <n-collapse :expanded-names="expanded" @update:expanded-names="onExpand" display-directive="show">
                        <n-collapse-item v-for="g in CHEAT_GROUPS" :key="g.name" :title="groupTitle(g)" :name="g.name">
                          <n-grid :cols="2" :x-gap="10" :y-gap="4">
                            <n-grid-item v-for="[k,label] in g.items" :key="k">
                              <div class="rm-cheat-row" :class="{on: state[k]}" @click="toggleCheat(k)">
                                <span style="display:flex;align-items:center;gap:7px;min-width:0;">
                                  <span class="rm-dot"></span>
                                  <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ label }}</span>
                                </span>
                                <n-switch size="small" :value="!!state[k]" @update:value="v => toggleCheat(k)" @click.stop/>
                              </div>
                            </n-grid-item>
                          </n-grid>
                        </n-collapse-item>
                      </n-collapse>
                    </n-card>

                    <n-card size="small">
                      <template #header><span style="display:flex;align-items:center;gap:7px;"><MIcon name="activity" :size="14" style="color:#f59e0b;"/>倍率与移速</span></template>
                      <template #header-extra><n-button text size="tiny" @click="resetRates">重置</n-button></template>
                      <n-flex vertical :size="10">
                        <div v-for="r in RATES" :key="r.key" style="display:flex;align-items:center;gap:10px;">
                          <span style="flex:none;width:34px;" :style="{color: Number(state[r.key]) !== r.min ? '#f59e0b' : '#c9cedb'}">{{ r.label }}</span>
                          <n-slider style="flex:1;min-width:60px;" :value="Number(state[r.key]) || 0" :min="r.min" :max="r.max" :step="r.step"
                                    :format-tooltip="v => (r.suf==='×' ? '×' : '+') + v" @update:value="v => setNum(r.key, v)"/>
                          <n-input-number size="small" :value="Number(state[r.key])" :min="r.min" :max="r.max" :step="r.step" :show-button="false" style="width:62px;flex:none;" @update:value="v => setNum(r.key, v)"/>
                        </div>
                      </n-flex>
                    </n-card>

                    <n-card size="small">
                      <template #header><span style="display:flex;align-items:center;gap:7px;"><MIcon name="lock" :size="14" style="color:#22c55e;"/>锁定值</span></template>
                      <n-flex vertical :size="6">
                        <div v-for="r in LOCKS" :key="r.key" style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
                          <span style="color:#c9cedb;">{{ r.label }}</span>
                          <n-input-number size="small" :value="Number(state[r.key]) || 0" :min="0" :step="r.step" style="width:150px;" placeholder="0" @update:value="v => setNum(r.key, v)"/>
                        </div>
                        <n-text depth="3" style="font-size:12px;">需同时打开上方"锁 HP / 锁 MP / 锁 TP"开关；填 0 = 锁满（不会超过上限）。"锁满 HP"忽略锁定值。</n-text>
                      </n-flex>
                    </n-card>

                    <n-card size="small">
                      <template #header><span style="display:flex;align-items:center;gap:7px;"><MIcon name="zap" :size="14" style="color:#8b5cf6;"/>快捷操作</span></template>
                      <n-flex vertical :size="10">
                        <div>
                          <div class="rm-sub">金币</div>
                          <div style="display:flex;gap:8px;align-items:center;">
                            <n-input-number v-model:value="goldDraft" :min="0" size="small" :show-button="false" style="flex:1;min-width:0;"/>
                            <n-button size="small" type="primary" secondary @click="goldOp('add')"><template #icon><MIcon name="coins" :size="14"/></template>增加</n-button>
                            <n-button size="small" @click="goldOp('set')">设为</n-button>
                          </div>
                        </div>
                        <div v-for="g in QUICK_GROUPS" :key="g.title">
                          <div class="rm-sub">{{ g.title }}</div>
                          <n-flex :size="8" wrap>
                            <n-button v-for="a in g.items" :key="a.act" size="small" :type="a.type" :secondary="a.type!=='default'"
                                      :disabled="a.battle && !status.battle" @click="quick(a)">
                              <template #icon><MIcon :name="a.icon" :size="14"/></template>{{ a.label }}
                            </n-button>
                          </n-flex>
                        </div>
                      </n-flex>
                    </n-card>
                  </n-flex>

                  <!-- ===== 数据 tab ===== -->
                  <n-flex v-else vertical :size="8">
                    <n-flex :size="6" wrap>
                      <n-button v-for="k in KIND_ORDER" :key="k" size="tiny" :type="dataKind===k?'primary':'default'"
                                :secondary="dataKind!==k" @click="setKind(k)">{{ KIND_LABELS[k] }}</n-button>
                    </n-flex>
                    <div style="display:flex;gap:8px;align-items:center;">
                      <n-input v-model:value="dataQuery" size="small" clearable placeholder="搜索名称或 ID" style="flex:1;min-width:0;">
                        <template #prefix><MIcon name="search" :size="14"/></template>
                      </n-input>
                      <n-button size="small" secondary @click="refreshList" style="flex:none;"><template #icon><MIcon name="refresh" :size="14"/></template></n-button>
                    </div>
                    <n-text depth="3" style="font-size:12px;">{{ filtered.length }} / {{ allEntries.length }} 条 · 点击条目修改</n-text>
                    <n-data-table :columns="columns" :data="filtered" size="small" :bordered="false" :max-height="tableMaxH"
                                  virtual-scroll :row-key="row => row.id" :pagination="false" :row-class-name="row => row.id===listCls ? 'rm-row-selected' : ''"
                                  :row-props="row => ({ style:'cursor:pointer', onClick: () => selectRow(row) })"/>
                  </n-flex>
                </div>
              </div>

              <!-- 详情 modal -->
              <n-modal :show="detailShow" @update:show="v => { if(!v) closeDetail(); }" preset="card" title="详情" :mask-closable="true" style="width:420px;max-width:calc(100vw - 24px);">
                <template #header>
                  <span style="display:flex;align-items:center;gap:8px;min-width:0;">
                    <img v-if="detail && iconSrc(detail.icon)" :src="iconSrc(detail.icon)" style="width:22px;height:22px;border-radius:4px;background:#1b1f2a;"/>
                    <span v-else style="color:#5b8cff;display:flex;"><MIcon :name="detailKindIcon" :size="15"/></span>
                    <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ detailLabel() }}</span>
                  </span>
                </template>

                <template v-if="detail">
                <n-flex v-if="selectedKind==='item'||selectedKind==='weapon'||selectedKind==='armor'" vertical :size="12">
                  <n-descriptions :column="2" size="small" bordered label-placement="top">
                    <n-descriptions-item label="ID">{{ detail.id }}</n-descriptions-item>
                    <n-descriptions-item label="持有">{{ detail.value }}</n-descriptions-item>
                  </n-descriptions>
                  <div>
                    <div class="rm-sub">设置数量</div>
                    <div style="display:flex;gap:8px;align-items:center;">
                      <n-input-number v-model:value="detailValue" :min="0" size="small" style="flex:1;min-width:0;" :show-button="false"/>
                      <n-button size="small" type="primary" @click="doSetItem('set')">设为</n-button>
                    </div>
                  </div>
                  <div>
                    <div class="rm-sub">快速增减</div>
                    <n-flex :size="8" wrap>
                      <n-button size="small" secondary type="success" @click="doSetItem('add', 1)">+1</n-button>
                      <n-button size="small" secondary type="success" @click="doSetItem('add', 10)">+10</n-button>
                      <n-button size="small" secondary type="success" @click="doSetItem('add', 99)">+99</n-button>
                      <n-button size="small" secondary @click="doSetItem('add', -1)">-1</n-button>
                      <n-button size="small" secondary type="error" @click="doSetItem('clear')">清零</n-button>
                    </n-flex>
                  </div>
                </n-flex>

                <n-flex v-else-if="selectedKind==='actor'" vertical :size="12">
                  <n-descriptions :column="2" size="small" bordered label-placement="top">
                    <n-descriptions-item label="状态">{{ detail.inParty ? '在队' : '未在队' }}</n-descriptions-item>
                    <n-descriptions-item label="等级">{{ actorInfo ? ('Lv' + actorInfo.level) : '—' }}</n-descriptions-item>
                    <n-descriptions-item v-if="actorInfo" label="HP">{{ actorInfo.hp }}</n-descriptions-item>
                    <n-descriptions-item v-if="actorInfo" label="MP">{{ actorInfo.mp }}</n-descriptions-item>
                  </n-descriptions>
                  <n-flex :size="8" wrap>
                    <n-button size="small" :type="detail.inParty ? 'error':'primary'" secondary @click="doActorParty">
                      {{ detail.inParty ? '离队':'入队' }}
                    </n-button>
                    <n-button size="small" type="success" secondary @click="doActorRecover">全恢复</n-button>
                    <n-button size="small" @click="openSkillPicker">技能管理</n-button>
                  </n-flex>
                  <div>
                    <div class="rm-sub">等级{{ actorInfo ? '（上限 ' + actorInfo.maxLevel + '）' : '' }}</div>
                    <div style="display:flex;gap:8px;align-items:center;">
                      <n-input-number v-model:value="levelDraft" :min="1" :max="actorInfo ? actorInfo.maxLevel : undefined" size="small" style="flex:1;min-width:0;" :show-button="false"/>
                      <n-button size="small" type="primary" @click="doSetLevel">设等级</n-button>
                    </div>
                  </div>
                </n-flex>

                <n-flex v-else-if="selectedKind==='map'" vertical :size="12">
                  <n-descriptions :column="2" size="small" bordered label-placement="top">
                    <n-descriptions-item label="ID">{{ detail.id }}</n-descriptions-item>
                    <n-descriptions-item label="地图">{{ detail.name }}</n-descriptions-item>
                  </n-descriptions>
                  <div style="display:flex;gap:10px;align-items:center;">
                    <div style="display:flex;align-items:center;gap:6px;flex:1;min-width:0;"><span style="color:#c9cedb;">X</span><n-input-number v-model:value="detailX" :min="0" size="small" style="flex:1;min-width:0;" :show-button="false"/></div>
                    <div style="display:flex;align-items:center;gap:6px;flex:1;min-width:0;"><span style="color:#c9cedb;">Y</span><n-input-number v-model:value="detailY" :min="0" size="small" style="flex:1;min-width:0;" :show-button="false"/></div>
                    <n-button size="small" type="primary" @click="doTransfer">传送</n-button>
                  </div>
                  <n-text depth="3" style="font-size:12px;">默认填入当前坐标；目标格不可通行时可配合"穿墙"走出。</n-text>
                </n-flex>

                <n-flex v-else-if="selectedKind==='switch'" vertical :size="10">
                  <div class="rm-cheat-row" :class="{on: detail.value==='ON'}" @click="doSetSwitch(detail.value!=='ON')">
                    <span style="display:flex;align-items:center;gap:7px;"><span class="rm-dot"></span>当前：{{ detail.value }}</span>
                    <n-switch size="small" :value="detail.value==='ON'" @update:value="v => doSetSwitch(v)" @click.stop/>
                  </div>
                  <n-text depth="3" style="font-size:12px;">开关控制剧情/事件进度，随意修改可能导致流程异常，建议先存档。</n-text>
                </n-flex>

                <n-flex v-else-if="selectedKind==='variable'" vertical :size="10">
                  <n-descriptions :column="1" size="small" bordered label-placement="top">
                    <n-descriptions-item label="当前值">{{ String(detail.value) }}</n-descriptions-item>
                  </n-descriptions>
                  <n-input-group>
                    <n-input v-model:value="varDraft" size="small" placeholder="数字或文本"/>
                    <n-button size="small" type="primary" @click="doSetVar">设置</n-button>
                  </n-input-group>
                </n-flex>
                </template>
              </n-modal>

              <!-- 技能 picker modal -->
              <n-modal :show="skillPickerShow" @update:show="v => { if(!v) closeSkillPicker(); }" preset="card" :title="'技能 · ' + (detail ? detail.name : '')" :mask-closable="true" style="width:420px;max-width:calc(100vw - 24px);">
                <n-flex vertical :size="8">
                  <n-input v-model:value="skillQ" size="small" clearable placeholder="搜索技能名称或 ID">
                    <template #prefix><MIcon name="search" :size="14"/></template>
                  </n-input>
                  <n-text depth="3" style="font-size:12px;">已学 {{ ownedSkills.length }} 个 · 共 {{ filteredSkills.length }} 条</n-text>
                  <n-data-table :columns="skillColumns" :data="filteredSkills" size="small" :bordered="false" :max-height="skillTableMaxH"
                                virtual-scroll :row-key="row => row.id" :pagination="false"/>
                </n-flex>
              </n-modal>

              <!-- 确认 modal -->
              <n-modal :show="confirmShow" @update:show="v => { if(!v) cancelConfirm(); }" preset="dialog" type="warning" title="确认"
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
                '.rm-panel{z-index:2147483002!important}',
                '.rm-panel{animation:rmx .18s ease-out}',
                '@keyframes rmx{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}',
                '.rm-body{overscroll-behavior:contain}',
                '.rm-cheat-row{display:flex;align-items:center;justify-content:space-between;gap:8px;min-width:0;cursor:pointer;padding:5px 7px;margin:-3px -7px;border-radius:7px;color:#c9cedb;transition:background .15s,color .15s}',
                '.rm-cheat-row:active{background:rgba(91,140,255,.14)}',
                '.rm-cheat-row.on{color:#f2f4f9;background:rgba(34,197,94,.07)}',
                '.rm-dot{flex:none;width:6px;height:6px;border-radius:50%;background:#39404f;transition:all .2s}',
                '.rm-cheat-row.on .rm-dot{background:#22c55e;box-shadow:0 0 7px rgba(34,197,94,.85)}',
                '.rm-sub{font-size:12px;color:#7c8496;margin-bottom:6px}',
                '.rm-row-selected .n-data-table-td{background:rgba(91,140,255,.16)!important}',
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
