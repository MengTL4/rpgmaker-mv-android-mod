/* RMToolboxM 作弊 mod —— 去壳直装版 v8 (Vue 3 + Naive UI)
 * - 作弊核心：钩子 + 命令（Java 桥），启动即生效
 * - UI：仿 RMCH，Vue 3 + Naive UI，**懒加载**：1.7MB vendor 不拖游戏启动，首次点开面板才注入
 */
(function () {
    'use strict';
    if (window.__RMMOD_LOADED) return;
    window.__RMMOD_LOADED = true;
    try { document.title = 'MOD_LOADED'; } catch (e) {}

    function L(m) { try { console.log('[RMMOD] ' + m); if (window.MOD && window.MOD.log) window.MOD.log(String(m)); } catch (e) {} }

    /* ==================== 状态 ==================== */
    // 普通对象起步（钩子立即可用）；UI 懒加载完成时包装为 reactive。
    var state = {
        invincible: false, onehit: false, noskill: false, through: false,
        noencounter: false, dash: false, lockhp: false, lockhpmax: false,
        lockmp: false, locktp: false,
        lockhpval: 0, lockmpval: 0, locktpval: 0,
        goldmult: 1, expmult: 1, dropmult: 1, movespeed: 0
    };
    // 启动时恢复上次的开关/倍率/锁定值；写回在 UI 启动后挂 watchEffect（防抖），见 initUi
    try {
        var saved = JSON.parse(localStorage.getItem('rmmod-cheats') || 'null');
        if (saved && typeof saved === 'object') {
            for (var k in saved) if (k in state) state[k] = saved[k];
        }
    } catch (e) {}

    /* ==================== 游戏对象 ==================== */
    function party() { try { return window.$gameParty; } catch (e) { return null; } }
    function pActors() { var a = window.$gameActors; return a ? a._data : null; }

    function itemCount(kind, id) {
        try {
            var p = party(); if (!p) return 0;
            var arr = kind === 'item' ? $dataItems : kind === 'weapon' ? $dataWeapons : $dataArmors;
            if (!arr || !arr[id]) return 0;
            if (typeof p.numItems === 'function') { var n = p.numItems(arr[id]); return n || 0; }
            return 0;
        } catch (e) { return 0; }
    }

    /* ==================== 作弊函数 ==================== */
    function recoverAll() {
        var d = pActors(); if (!d) return 'no-game';
        for (var i = 1; i < d.length; i++) {
            var a = d[i]; if (!a) continue;
            a._hp = a.mhp; a._mp = a.mmp;
            try { a._tp = a.maxTp(); } catch (e) { a._tp = 100; }
        }
        try { party().requestMotionRefresh(); } catch (e) {}
        return 'ok';
    }
    function setGold(v) { var p = party(); if (!p) return 'no-game'; p._gold = Math.max(0, v | 0); return 'gold=' + p._gold; }
    function addGold(v) { var p = party(); if (!p) return 'no-game'; p._gold = Math.max(0, p._gold + (v | 0)); return 'gold=' + p._gold; }
    function giveItem(kind, id, qty) {
        var arr = kind === 'item' ? $dataItems : kind === 'weapon' ? $dataWeapons : $dataArmors;
        var p = party(); if (!arr || !p) return 'no-game';
        if (!arr[id]) return 'no-item-' + id;
        p.gainItem(arr[id], qty, false); return 'ok';
    }
    function setItemCount(kind, id, count) {
        var arr = kind === 'item' ? $dataItems : kind === 'weapon' ? $dataWeapons : $dataArmors;
        var p = party(); if (!arr || !p || !arr[id]) return 'no-item';
        var cur = itemCount(kind, id);
        var delta = (count | 0) - cur;
        if (delta > 0) p.gainItem(arr[id], delta, false);
        else if (delta < 0) p.loseItem(arr[id], -delta, false);
        return 'set=' + (count | 0);
    }
    function giveAll(kind, count) {
        var arr = kind === 'item' ? $dataItems : kind === 'weapon' ? $dataWeapons : $dataArmors;
        var p = party(); if (!arr || !p) return 'no-game';
        for (var i = 1; i < arr.length; i++) if (arr[i]) p.gainItem(arr[i], count, false);
        return 'ok';
    }
    function partyAdd(id) { var p = party(); if (!p) return 'no-game'; if (p._actors.indexOf(id | 0) < 0) p.addActor(id | 0); return 'ok'; }
    function partyRemove(id) { var p = party(); if (!p) return 'no-game'; var i = p._actors.indexOf(id | 0); if (i >= 0) p.removeActor(id | 0); return 'ok'; }
    function skillLearn(actorId, skillId) { var a = $gameActors && $gameActors.actor(actorId | 0); if (!a) return 'no-actor'; a.learnSkill(skillId | 0); return 'ok'; }
    function skillForget(actorId, skillId) { var a = $gameActors && $gameActors.actor(actorId | 0); if (!a) return 'no-actor'; a.forgetSkill(skillId | 0); return 'ok'; }
    function setSwitch(id, v) { if (!$gameSwitches) return 'no-game'; $gameSwitches.setValue(id, !!v); return 'ok'; }
    function setVar(id, v) { if (!$gameVariables) return 'no-game'; $gameVariables.setValue(id, v); return 'ok'; }
    function setActor(actorId, field, v) {
        var a = $gameActors && $gameActors.actor(actorId | 0); if (!a) return 'no-actor';
        if (field === 'hp') a.setHp(v | 0); else if (field === 'mp') a.setMp(v | 0);
        else if (field === 'tp') a.setTp(v | 0); else if (field === 'level') a.changeLevel((v | 0) - a._level, false);
        return 'ok';
    }
    function transfer(mapId, x, y) { var p = window.$gamePlayer; if (!p) return 'no-game'; p.reserveTransfer(mapId | 0, x | 0, y | 0, p.direction ? p.direction() : 2, 0); return 'ok'; }
    function killEnemies() {
        if (!window.BattleManager || !BattleManager._phase) return 'not-battle';
        var n = 0; (BattleManager._enemies || []).forEach(function (e) { if (e && e.isAlive && e.isAlive()) { e.setHp(0); n++; } });
        return 'killed=' + n;
    }
    function escapeBattle() { if (!window.BattleManager || !BattleManager._phase) return 'not-battle'; try { BattleManager.processAbort(); } catch (e) {} return 'ok'; }
    function pushScene(name) {
        var map = { Item: 'Scene_Item', Skill: 'Scene_Skill', Equip: 'Scene_Equip', Status: 'Scene_Status', Menu: 'Scene_Menu', Options: 'Scene_Options' };
        var cls = window[map[name]]; if (!cls || !window.SceneManager) return 'no-scene'; SceneManager.push(cls); return 'ok';
    }
    function repair(what) {
        try {
            if (what === 'fadein') $gameScreen.startFadeIn(30);
            else if (what === 'clearpics') $gameScreen.clearPictures();
            else if (what === 'clearevent') { if ($gameMap._interpreter) $gameMap._interpreter.clear(); }
            else if (what === 'clearmove') { if ($gamePlayer) { $gamePlayer._moveRouteForcing = false; if ($gamePlayer.clearMoveRoute) $gamePlayer.clearMoveRoute(); } }
            else if (what === 'tomap') SceneManager.goto(Scene_Map);
            else if (what === 'title') SceneManager.goto(Scene_Title);
        } catch (e) { return 'err:' + e.message; }
        return 'ok';
    }
    function quickSave() { try { if (window.DataManager) { DataManager.saveGame(1); return 'saved'; } } catch (e) { return 'err:' + e.message; } return 'no-data'; }
    function quickLoad() { try { if (window.DataManager && DataManager.isThisGameFile(1)) { DataManager.loadGame(1); SceneManager.goto(Scene_Map); return 'loaded'; } } catch (e) { return 'err:' + e.message; } return 'no-save'; }
    function newGame() { try { DataManager.setupNewGame(); SceneManager.goto(Scene_Map); return 'ok'; } catch (e) { return 'err:' + e.message; } }

    /* 列表数据（UI 直接调用） */
    function getList(kind) {
        var out = [];
        try {
            var p = party();
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
                if (vn && vn.length) for (var i = 1; i < vn.length; i++) out.push({ id: i, name: vn[i] || ('变量 ' + i), icon: 0, value: (vd && vd[i] != null) ? String(vd[i]) : '0' });
            } else if (kind === 'actor') {
                var ga = window.$gameActors;
                for (var i = 1; i < $dataActors.length; i++) {
                    var d = $dataActors[i]; if (!d || !d.name) continue;
                    var value = '';
                    // 只读"已实例化"的角色：$gameActors.actor(i) 会为所有角色批量 new Game_Actor
                    // 并永久进入存档，列表浏览不该付出这个代价
                    var inst = (ga && ga._data) ? ga._data[i] : null;
                    if (inst) { var inP = p && p._actors.indexOf(i) >= 0; value = (inP ? '在队 ' : '') + 'Lv' + inst._level; }
                    out.push({ id: i, name: d.name, icon: 0, value: value });
                }
            } else {
                var src = kind === 'item' ? $dataItems : kind === 'weapon' ? $dataWeapons : kind === 'armor' ? $dataArmors : kind === 'skill' ? $dataSkills : null;
                if (src) {
                    for (var i = 1; i < src.length; i++) {
                        try {
                            var dd = src[i]; if (!dd || !dd.name) continue;
                            var value = '';
                            if (kind === 'item') value = itemCount('item', i) + ' 个';
                            else if (kind === 'weapon') value = itemCount('weapon', i) + ' 件';
                            else if (kind === 'armor') value = itemCount('armor', i) + ' 件';
                            out.push({ id: i, name: dd.name, icon: dd.iconIndex || 0, value: value });
                        } catch (e2) { break; }
                    }
                }
            }
        } catch (e) {}
        return out;
    }

    /* ==================== 钩子 ==================== */
    /* 二代魔改引擎在子类上重复实现了很多方法（如 Game_Actor/Game_Enemy 各有自己的 gainHp），
       只打基类 prototype 会被子类覆盖而失效。hookMethod 沿原型链找到方法"实际定义层"打补丁；
       对多个类调用即可覆盖所有实例路径。 */
    function hookMethod(ctor, name, wrap) {
        try {
            if (!ctor || !ctor.prototype) return false;
            var target = ctor.prototype, o = ctor.prototype;
            while (o) {
                if (Object.prototype.hasOwnProperty.call(o, name)) { target = o; break; }
                o = Object.getPrototypeOf(o);
            }
            var orig = target[name];
            if (typeof orig !== 'function') return false;
            if (orig.__rmhook) return false; // 已在其定义层打过（如 Game_CharacterBase 被多个子类走到，避免 realMoveSpeed 被多次叠加）
            var wrapped = function () { return wrap(this, arguments, orig); };
            wrapped.__rmhook = true;
            target[name] = wrapped;
            return true;
        } catch (e) { return false; }
    }

    function hookAll() {
        var ok = 0;
        /* 倍率 */
        ok += hookMethod(Game_Actor, 'gainExp', function (self, args, orig) {
            var exp = args[0];
            if (exp > 0 && state.expmult !== 1) exp = Math.round(exp * state.expmult);
            args[0] = exp;
            return orig.apply(self, args);
        }) ? 1 : 0;
        ok += hookMethod(Game_Party, 'gainGold', function (self, args, orig) {
            var amount = args[0];
            if (amount > 0 && state.goldmult !== 1) amount = Math.round(amount * state.goldmult);
            args[0] = amount;
            return orig.apply(self, args);
        }) ? 1 : 0;
        /* 战斗：一击必杀（Game_Action 上的返回值处理，无需子类覆盖检查；
           注意 subject 是方法必须调用，v7 误用 self.subject.isActor 从未生效） */
        ok += hookMethod(Game_Action, 'makeDamageValue', function (self, args, orig) {
            var v = orig.apply(self, args);
            var target = args[0];
            var su = null;
            try { su = (typeof self.subject === 'function') ? self.subject() : self.subject; } catch (e) {}
            if (state.onehit && v > 0 && su && su.isActor && su.isActor()) v = Math.max(v, (target.hp || 999999) * 10);
            return v;
        }) ? 1 : 0;
        /* 无敌 + 锁定：二代在 Game_Actor/Game_Enemy 各自实现了 gainHp/update，
           必须对三个类分别打（hookMethod 自动定位各层的实际定义点） */
        var battlers = [Game_Actor, Game_Enemy, Game_Battler];
        for (var bi = 0; bi < battlers.length; bi++) {
            (function (C) {
                ok += hookMethod(C, 'gainHp', function (self, args, orig) {
                    var value = args[0];
                    if (state.invincible && value < 0) value = 0;
                    args[0] = value;
                    return orig.apply(self, args);
                }) ? 1 : 0;
                ok += hookMethod(C, 'skillMpCost', function (self, args, orig) {
                    return state.noskill ? 0 : orig.apply(self, args);
                }) ? 1 : 0;
                ok += hookMethod(C, 'skillTpCost', function (self, args, orig) {
                    return state.noskill ? 0 : orig.apply(self, args);
                }) ? 1 : 0;
            })(battlers[bi]);
        }
        /* 锁定：二代引擎同样没有 battler update 方法（实测 A.update 不存在，v8 的 update
           钩子从未装上），改用定时回写，地图/战斗都生效 */
        setInterval(function () {
            try {
                if (!(state.lockhp || state.lockhpmax || state.lockmp || state.locktp)) return;
                var d = pActors(); if (!d) return;
                for (var i = 1; i < d.length; i++) {
                    var a = d[i]; if (!a) continue;
                    if (a.isAlive && !a.isAlive()) continue;
                    if (state.lockhp) a._hp = state.lockhpval > 0 ? state.lockhpval : a.mhp;
                    if (state.lockhpmax) a._hp = a.mhp;
                    if (state.lockmp) a._mp = state.lockmpval > 0 ? state.lockmpval : a.mmp;
                    if (state.locktp) a._tp = state.locktpval > 0 ? state.locktpval : (typeof a.maxTp === 'function' ? a.maxTp() : 100);
                }
            } catch (e) {}
        }, 300);
        /* 移动：二代引擎没有 isPlayer() 方法（实测 undefined，v8 的 isPlayer 条件从未生效），
           与一代相同改用实例身份判断；穿墙/移速可能被子类覆盖，逐层打 */
        var movers = [Game_Player, Game_Character, Game_Event, Game_CharacterBase];
        for (var mi = 0; mi < movers.length; mi++) {
            (function (C) {
                if (!C) return;
                ok += hookMethod(C, 'isMapPassable', function (self, args, orig) {
                    if (state.through && self === window.$gamePlayer) return true;
                    return orig.apply(self, args);
                }) ? 1 : 0;
                ok += hookMethod(C, 'realMoveSpeed', function (self, args, orig) {
                    var s = orig.apply(self, args);
                    if (state.movespeed && self === window.$gamePlayer) s += state.movespeed;
                    return s;
                }) ? 1 : 0;
            })(movers[mi]);
        }
        ok += hookMethod(Game_Player, 'isDashButtonPressed', function (self, args, orig) {
            return state.dash ? true : orig.apply(self, args);
        }) ? 1 : 0;
        ok += hookMethod(Game_Player, 'makeEncounterCount', function (self, args, orig) {
            return state.noencounter ? 0 : orig.apply(self, args);
        }) ? 1 : 0;
        /* 掉落 */
        ok += hookMethod(Game_Enemy, 'makeDropItems', function (self, args, orig) {
            var items = orig.apply(self, args);
            if (state.dropmult > 1) { var out = []; for (var i = 0; i < items.length; i++) for (var j = 0; j < state.dropmult; j++) out.push(items[i]); return out; }
            return items;
        }) ? 1 : 0;
        L('cheat hooks installed (x' + ok + ')');
    }

    /* ==================== Java 桥命令 ==================== */
    function exec(cmd) {
        if (!cmd) return;
        L('cmd ' + cmd);
        var r = 'ok';
        try {
            var c = cmd.split(':');
            switch (c[0]) {
                case 'menu': togglePanel(); break;
                case 'menushow': uiShow(true); break;
                case 'menuhide': uiShow(false); break;
                case 'invincible': state.invincible = !state.invincible; break;
                case 'onehit': state.onehit = !state.onehit; break;
                case 'noskill': state.noskill = !state.noskill; break;
                case 'through': state.through = !state.through; break;
                case 'noencounter': state.noencounter = !state.noencounter; break;
                case 'dash': state.dash = !state.dash; break;
                case 'lockhp': state.lockhp = !state.lockhp; break;
                case 'lockhpmax': state.lockhpmax = !state.lockhpmax; break;
                case 'lockmp': state.lockmp = !state.lockmp; break;
                case 'locktp': state.locktp = !state.locktp; break;
                case 'goldmult': state.goldmult = parseFloat(c[1]) || 1; break;
                case 'expmult': state.expmult = parseFloat(c[1]) || 1; break;
                case 'dropmult': state.dropmult = parseFloat(c[1]) || 1; break;
                case 'movespeed': state.movespeed = parseFloat(c[1]) || 0; break;
                case 'lockhpval': state.lockhpval = parseInt(c[1], 10) || 0; break;
                case 'lockmpval': state.lockmpval = parseInt(c[1], 10) || 0; break;
                case 'locktpval': state.locktpval = parseInt(c[1], 10) || 0; break;
                case 'recover': r = recoverAll(); break;
                case 'gold': r = setGold(parseInt(c[1], 10) || 0); break;
                case 'goldadd': r = addGold(parseInt(c[1], 10) || 0); break;
                case 'item': r = giveItem('item', parseInt(c[1], 10), parseInt(c[2], 10) || 1); break;
                case 'weapon': r = giveItem('weapon', parseInt(c[1], 10), parseInt(c[2], 10) || 1); break;
                case 'armor': r = giveItem('armor', parseInt(c[1], 10), parseInt(c[2], 10) || 1); break;
                case 'itemset': r = setItemCount('item', parseInt(c[1], 10), parseInt(c[2], 10) || 0); break;
                case 'weaponset': r = setItemCount('weapon', parseInt(c[1], 10), parseInt(c[2], 10) || 0); break;
                case 'armorset': r = setItemCount('armor', parseInt(c[1], 10), parseInt(c[2], 10) || 0); break;
                case 'allitems': r = giveAll('item', parseInt(c[1], 10) || 1); break;
                case 'allweapons': r = giveAll('weapon', parseInt(c[1], 10) || 1); break;
                case 'allarmors': r = giveAll('armor', parseInt(c[1], 10) || 1); break;
                case 'partyadd': r = partyAdd(c[1]); break;
                case 'partyremove': r = partyRemove(c[1]); break;
                case 'skilllearn': r = skillLearn(parseInt(c[1], 10), parseInt(c[2], 10)); break;
                case 'skillforget': r = skillForget(parseInt(c[1], 10), parseInt(c[2], 10)); break;
                case 'sw': r = setSwitch(parseInt(c[1], 10), c[2] === '1'); break;
                case 'var': r = setVar(parseInt(c[1], 10), parseFloat(c[2])); break;
                case 'actor': r = setActor(parseInt(c[1], 10), c[2], parseInt(c[3], 10) || 0); break;
                case 'map': r = transfer(parseInt(c[1], 10), parseInt(c[2], 10) || 0, parseInt(c[3], 10) || 0); break;
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
    setInterval(function () {
        try { if (window.MOD && window.MOD.takeCommand) { var c = window.MOD.takeCommand(); if (c) exec(c); } } catch (e) {}
    }, 300);

    /* ==================== Toast（零依赖 DOM 消息，UI 未加载也能用） ==================== */
    var toastHost = null;
    function ensureToastHost() {
        if (toastHost || !document.body) return;
        var s = document.createElement('style');
        s.textContent = [
            '.rm-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);padding:8px 14px;border-radius:10px;background:rgba(27,31,42,.96);border:1px solid #272c39;color:#eaecf3;font-size:13px;box-shadow:0 6px 22px rgba(0,0,0,.5);z-index:100010;opacity:0;transition:opacity .18s,transform .18s;max-width:80vw;pointer-events:none}',
            '.rm-toast.ok{border-color:rgba(34,197,94,.5);color:#22c55e}',
            '.rm-toast.err{border-color:rgba(239,68,68,.5);color:#ef4444}',
            '.rm-toast.warn{border-color:rgba(245,158,11,.5);color:#f59e0b}',
            '.rm-toast.out{opacity:0;transform:translateX(-50%) translateY(8px)}'
        ].join('\n');
        document.head.appendChild(s);
        toastHost = document.createElement('div');
        toastHost.id = 'rm-toasts';
        document.body.appendChild(toastHost);
    }
    function toast(msg, type) {
        ensureToastHost();
        if (!toastHost) return;
        var t = document.createElement('div');
        t.className = 'rm-toast' + (type ? ' ' + type : '');
        t.textContent = (type === 'ok' ? '✓ ' : type === 'err' ? '✕ ' : type === 'warn' ? '⚠ ' : '') + msg;
        toastHost.appendChild(t);
        setTimeout(function () { t.classList.add('out'); }, 1600);
        setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2100);
    }

    /* ==================== UI 懒加载 ====================
     * vue/naive 共约 1.7MB，不再随游戏启动解析；首次点球/开面板时才注入 <script>。
     * 作弊钩子与 Java 命令通道不依赖 UI，游戏启动即生效。 */
    var uiReady = false, uiBooting = false, uiWantOpen = false;
    function loadScript(src, ok) {
        var el = document.createElement('script');
        el.src = src;
        el.onload = ok;
        el.onerror = function () { uiBooting = false; toast('UI 组件加载失败', 'err'); };
        document.head.appendChild(el);
    }
    function bootUi() {
        if (uiReady || uiBooting) return;
        uiBooting = true;
        loadScript('mod/vendor/vue.global.prod.js', function () {
            loadScript('mod/vendor/naive-ui.prod.js', function () {
                try { initUi(); uiReady = true; } catch (e) { L('ui init err ' + (e && e.message)); toast('UI 初始化失败', 'err'); }
                uiBooting = false;
                if (uiReady && uiWantOpen) { uiWantOpen = false; try { window.__RMMOD_TOGGLE(); } catch (e) {} }
            });
        });
    }
    function togglePanel() {
        if (uiReady) { try { window.__RMMOD_TOGGLE(); } catch (e) {} return; }
        uiWantOpen = true;
        toast('面板加载中…', 'warn');
        bootUi();
    }
    function uiShow(on) {
        if (uiReady) { try { window.__RMMOD_SHOW(on); } catch (e) {} return; }
        if (on) { uiWantOpen = true; bootUi(); }
    }

    /* ==================== UI（首次打开面板时才执行；依赖 vendor） ==================== */
    function initUi() {
        var Vue = window.Vue, naive = window.naive;
        if (!Vue || !naive) throw new Error('vendor missing');
        var h = Vue.h;
        var ref = Vue.ref, computed = Vue.computed;
        var defineComponent = Vue.defineComponent;

        /* 状态包装为响应式 + 持久化写回（防抖 300ms：拖滑条不再每帧同步写 localStorage） */
        state = Vue.reactive(state);
        var persistT = null;
        try {
            Vue.watchEffect(function () {
                var snap;
                try { snap = JSON.stringify(state); } catch (e) { return; }
                if (persistT) clearTimeout(persistT);
                persistT = setTimeout(function () { try { localStorage.setItem('rmmod-cheats', snap); } catch (e) {} }, 300);
            });
        } catch (e) {}

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
        var iconSetImg = null, iconCache = {}, iconRev = ref(0);
        function loadIconSet(cb) {
            /* 二代优先走游戏运行时管线：img/ 目录整体加密进 pak，XHR 拿不到文件；
               ImageManager.loadSystem('IconSet') 经游戏解密管线返回 Bitmap，
               就绪后取 _canvas/_image 作为裁剪源。失败再退回一代的 rpgmvp XHR。 */
            try {
                var im = window.ImageManager || (window.TK && TK.$ && TK.$.ImageMrg);
                if (im && typeof im.loadSystem === 'function') {
                    var bmp = null;
                    try { bmp = im.loadSystem('IconSet'); } catch (e) { }
                    if (bmp) {
                        var waits = 0;
                        var timer = setInterval(function () {
                            waits++;
                            var ready = false, src = null;
                            try {
                                ready = bmp.isReady ? bmp.isReady() : false;
                                src = bmp._canvas || bmp._image || null;
                            } catch (e) { }
                            if (ready && src && src.width > 0) {
                                clearInterval(timer);
                                iconSetImg = src;
                                iconRev.value++;
                                L('icon set via game pipeline ' + src.width + 'x' + src.height);
                                if (cb) cb();
                            } else if (waits > 150) { /* 30s 超时 */
                                clearInterval(timer);
                                L('icon bitmap timeout, fallback xhr');
                                loadIconSetXhr(cb);
                            }
                        }, 200);
                        return;
                    }
                }
            } catch (e) { L('icon pipeline err ' + e); }
            loadIconSetXhr(cb);
        }
        function loadIconSetXhr(cb) {
            try {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', 'img/system/IconSet.rpgmvp', true);
                xhr.responseType = 'arraybuffer';
                xhr.onload = function () {
                    try {
                        var data = new Uint8Array(xhr.response);
                        var hex = 'a7f1bbc90496ca91cfd4c4fd6a33d161';
                        var body = new Uint8Array(data.buffer, 16);
                        for (var j = 0; j < 16; j++) body[j] ^= parseInt(hex.substr(j * 2, 2), 16);
                        var blob = new Blob([body], { type: 'image/png' });
                        var img = new Image();
                        img.onload = function () { iconSetImg = img; iconRev.value++; if (cb) cb(); };
                        img.src = URL.createObjectURL(blob);
                    } catch (e) { L('icon err ' + e); }
                };
                xhr.onerror = function () { L('icon xhr err'); };
                xhr.send();
            } catch (e) { L('icon err ' + e); }
        }
        function iconDataUrl(index) {
            if (!iconSetImg || index <= 0) return null;
            if (iconCache[index]) return iconCache[index];
            var c = document.createElement('canvas');
            c.width = c.height = 32;
            var ctx = c.getContext('2d');
            var x = (index % 16) * 32, y = Math.floor(index / 16) * 32;
            if (x >= iconSetImg.width || y >= iconSetImg.height) return null;
            ctx.drawImage(iconSetImg, x, y, 32, 32, 0, 0, 32, 32);
            var url = c.toDataURL();
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
            { name: 'lock', title: '锁定', items: [['lockhp', '锁 HP'], ['lockhpmax', '锁 HP 上限'], ['lockmp', '锁 MP'], ['locktp', '锁 TP']] }
        ];
        // 倍率：滑条 + 数字；锁定值：步进数字
        var RATES = [
            { key: 'expmult', label: '经验倍率', max: 100, suf: 'x' },
            { key: 'goldmult', label: '金钱倍率', max: 100, suf: 'x' },
            { key: 'dropmult', label: '掉落倍率', max: 100, suf: 'x' },
            { key: 'movespeed', label: '移速加成', max: 10, suf: '+' }
        ];
        var LOCKS = [
            { key: 'lockhpval', label: '锁 HP 值', step: 100 },
            { key: 'lockmpval', label: '锁 MP 值', step: 100 },
            { key: 'locktpval', label: '锁 TP 值', step: 10 }
        ];
        var QUICK = [
            { label: '全队回满', act: 'recover', type: 'success', icon: 'heart' },
            { label: '全灭敌人', act: 'kill', type: 'error', icon: 'sword' },
            { label: '逃离战斗', act: 'escape', type: 'default', icon: 'activity' },
            { label: '金币 +99999', act: 'goldadd', type: 'primary', icon: 'coins' },
            { label: '全物品 ×99', act: 'allitems', type: 'default', icon: 'box' },
            { label: '全武器 ×99', act: 'allweapons', type: 'default', icon: 'box' },
            { label: '全防具 ×99', act: 'allarmors', type: 'default', icon: 'box' },
            { label: '快速存档', act: 'save', type: 'default', icon: 'save' },
            { label: '读档(槽1)', act: 'load', type: 'default', icon: 'archive' },
            { label: '新游戏', act: 'newgame', type: 'warning', icon: 'power', confirm: true },
            { label: '转标题', act: 'title', type: 'default', icon: 'refresh' },
            { label: '淡入屏幕', act: 'fadein', type: 'default', icon: 'activity' }
        ];

        /* ==================== 根组件 ==================== */
        var ModApp = defineComponent({
            name: 'ModApp',
            components: {
                MIcon: MIcon, NConfigProvider: naive.NConfigProvider, NGlobalStyle: naive.NGlobalStyle,
                NCard: naive.NCard, NButton: naive.NButton, NButtonGroup: naive.NButtonGroup,
                NSwitch: naive.NSwitch, NInputNumber: naive.NInputNumber, NInput: naive.NInput,
                NSlider: naive.NSlider, NCollapse: naive.NCollapse, NCollapseItem: naive.NCollapseItem,
                NInputGroup: naive.NInputGroup, NDataTable: naive.NDataTable, NTag: naive.NTag,
                NFlex: NFlex, NText: naive.NText, NEmpty: naive.NEmpty, NModal: naive.NModal,
                NDescriptions: naive.NDescriptions, NDescriptionsItem: naive.NDescriptionsItem,
                NGrid: naive.NGrid, NGridItem: naive.NGridItem
            },
            setup: function () {
                var show = ref(false), tab = ref('trainer');
                var dataKind = ref('item'), dataQuery = ref('');
                var selectedKind = ref('item'), detail = ref(null), detailShow = ref(false);
                var detailValue = ref(1), levelDraft = ref(1), varDraft = ref('');
                var detailX = ref(0), detailY = ref(0);
                var confirmShow = ref(false), confirmMsg = ref(''), confirmAct = ref(null);
                var status = ref({ scene: '', battle: false, map: '', gold: '', party: 0 });
                // 悬浮球入口已改由原生 Java 实现（ModFloatingWindow，挂在 DecorView 上，拖动更跟手）；
                // 这里只负责面板开关，并在开关时通知 Java 侧藏/显球。
                var skillPickerShow = ref(false), skillQ = ref(''), skillRev = ref(0);
                var listRev = ref(0);
                // 面板没开时不重建列表（quick 操作后无需为不可见的表格花时间）
                function refreshList() { if (!show.value) return; listRev.value++; }

                var darkTheme = naive.darkTheme, zhCN = naive.zhCN;

                /* ---- 实时状态 ---- */
                function refreshStatus() {
                    var s = { scene: '', battle: false, map: '', gold: '', party: 0 };
                    try {
                        var sceneName = '';
                        if (window.SceneManager && SceneManager._scene) sceneName = SceneManager._scene.constructor.name;
                        s.battle = !!(window.$gameParty && $gameParty.inBattle && $gameParty.inBattle());
                        if (s.battle) s.scene = '战斗中';
                        else if (sceneName === 'Scene_Title') s.scene = '标题画面';
                        else if (sceneName === 'Scene_Map') s.scene = '地图';
                        else s.scene = sceneName ? sceneName.replace('Scene_', '') : '';
                    } catch (e) {}
                    try { if (window.$gameParty && typeof $gameParty.gold === 'function') s.gold = String($gameParty.gold()); } catch (e) {}
                    try { if (window.$gameParty && window.$gameParty._actors) s.party = ($gameParty._actors || []).length; } catch (e) {}
                    try { if (window.$gameMap && typeof $gameMap.displayName === 'function') { var dn = $gameMap.displayName(); if (dn) s.map = dn; } } catch (e) {}
                    status.value = s;
                }

                /* ---- 作弊开关 / 倍率 ---- */
                function toggleCheat(k) { state[k] = !state[k]; }
                function setNum(k, v) { state[k] = (v == null || v === '' || isNaN(v)) ? 0 : Number(v); }
                function setTab(t) { L('setTab ' + t); tab.value = t; }

                /* ---- 快捷操作 ---- */
                function quick(act) {
                    var info = '';
                    if (act === 'recover') info = recoverAll();
                    else if (act === 'kill') info = killEnemies();
                    else if (act === 'escape') info = escapeBattle();
                    else if (act === 'goldadd') { addGold(99999); info = 'ok'; }
                    else if (act === 'allitems') info = giveAll('item', 99);
                    else if (act === 'allweapons') info = giveAll('weapon', 99);
                    else if (act === 'allarmors') info = giveAll('armor', 99);
                    else if (act === 'save') info = quickSave();
                    else if (act === 'load') { info = quickLoad(); refreshStatus(); }
                    else if (act === 'title') info = repair('title');
                    else if (act === 'fadein') info = repair('fadein');
                    else if (act === 'newgame') { info = newGame(); refreshStatus(); }
                    refreshStatus(); refreshList();
                    if (info === 'ok') toast('已执行', 'ok');
                    else if (info === 'saved') toast('已存档', 'ok');
                    else if (info === 'loaded') toast('已读档', 'ok');
                    else if (info && info.indexOf('err') === 0) toast(info, 'err');
                    else if (act === 'kill') toast('已全灭敌人', 'ok');
                }
                function confirmThen(act) {
                    if (act === 'newgame') { confirmMsg.value = '开始新游戏？未保存的进度会丢失。'; confirmAct.value = 'newgame'; confirmShow.value = true; }
                    else quick(act);
                }
                function doConfirm() { var a = confirmAct.value; confirmShow.value = false; if (a) quick(a); }

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
                    return { item: 'box', weapon: 'box', armor: 'box', actor: 'users', map: 'map', switch: 'flag', variable: 'hash' }[selectedKind.value] || 'box';
                });

                var columns = computed(function () {
                    iconRev.value; // 图标集加载后重建，驱动行渲染重跑
                    return [
                        {
                            title: '', key: 'ic', width: 36,
                            render: function (row) {
                                var src = iconSrc(row.icon);
                                if (!src) return h('span');
                                return h('img', { src: src, style: 'width:22px;height:22px;border-radius:4px;background:#1b1f2a;display:block' });
                            }
                        },
                        {
                            title: '名称', key: 'name',
                            render: function (row) {
                                return h('div', { style: 'display:flex;align-items:baseline;gap:6px;min-width:0' }, [
                                    h('span', { style: 'color:#5f6779;font-size:12px;font-variant-numeric:tabular-nums;flex:none' }, '#' + row.id),
                                    h('span', { style: 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap' }, row.name || '(无名)')
                                ]);
                            }
                        },
                        {
                            title: '值', key: 'value', width: 80, align: 'right',
                            render: function (row) {
                                var st = { fontSize: '12.5px', fontVariantNumeric: 'tabular-nums' };
                                if (dataKind.value === 'switch') st.color = row.value === 'ON' ? '#22c55e' : '#7c8496';
                                else if (dataKind.value === 'actor' && String(row.value).indexOf('在队') === 0) st.color = '#22c55e';
                                return h('span', { style: st }, row.value || '—');
                            }
                        }
                    ];
                });

                var skills = computed(function () { listRev.value; skillRev.value; return getList('skill'); });
                var ownedSkills = computed(function () {
                    skillRev.value;
                    var e = detail.value; if (!e) return [];
                    var a = $gameActors && $gameActors.actor(e.id);
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
                    function rowIcon(row) {
                        var src = iconSrc(row.icon);
                        return src ? h('img', { src: src, style: 'width:22px;height:22px;border-radius:4px;background:#1b1f2a;display:block' }) : h('span');
                    }
                    return [
                        { title: '', key: 'ic', width: 36, render: rowIcon },
                        {
                            title: '技能', key: 'name',
                            render: function (row) {
                                var owned = ownedSkills.value.indexOf(row.id) >= 0;
                                return h('div', { style: 'display:flex;align-items:center;gap:6px;min-width:0' }, [
                                    h('span', { style: 'color:#22c55e;flex:none' }, owned ? '✓' : ''),
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
                    if (ownedSkills.value.indexOf(sid) >= 0) skillForget(e.id, sid); else skillLearn(e.id, sid);
                    skillRev.value++;
                }

                /* ---- 选择/详情 ---- */
                function selectRow(row) {
                    selectedKind.value = dataKind.value;
                    detail.value = row;
                    detailShow.value = true;
                    if (dataKind.value === 'variable') varDraft.value = String(row.value || '');
                    else if (dataKind.value === 'actor') levelDraft.value = 1;
                    else if (dataKind.value === 'map') { detailX.value = 0; detailY.value = 0; }
                    else detailValue.value = 1;
                }
                function closeDetail() { detailShow.value = false; }
                function detailLabel() { var e = detail.value; return e ? ('#' + e.id + ' ' + e.name) : ''; }
                function doSetItem(op) {
                    var e = detail.value; if (!e) return;
                    var k = selectedKind.value; var qty = parseInt(detailValue.value, 10) || 1;
                    if (op === 'set') setItemCount(k, e.id, qty); else giveItem(k, e.id, qty);
                    refreshStatus(); refreshList(); closeDetail(); toast('已执行', 'ok');
                }
                function doSetSwitch(v) {
                    var e = detail.value; if (!e) return;
                    setSwitch(e.id, v); refreshStatus(); refreshList(); closeDetail(); toast('开关已置为 ' + (v ? 'ON' : 'OFF'), 'ok');
                }
                function doSetVar() {
                    var e = detail.value; if (!e) return;
                    var v = parseFloat(varDraft.value); if (isNaN(v)) v = varDraft.value;
                    setVar(e.id, v); refreshStatus(); refreshList(); closeDetail(); toast('已设置', 'ok');
                }
                function doActorParty() {
                    var e = detail.value; if (!e) return;
                    var inP = String(e.value || '').indexOf('在队') === 0;
                    if (inP) partyRemove(e.id); else partyAdd(e.id);
                    refreshStatus(); refreshList(); closeDetail(); toast('已更新队伍', 'ok');
                }
                function doActorRecover() {
                    var e = detail.value; if (!e) return;
                    setActor(e.id, 'hp', 999999); setActor(e.id, 'mp', 999999); setActor(e.id, 'tp', 100);
                    refreshStatus(); toast('已全恢复', 'ok');
                }
                function doSetLevel() {
                    var e = detail.value; if (!e) return;
                    setActor(e.id, 'level', parseInt(levelDraft.value, 10) || 1);
                    refreshStatus(); refreshList(); closeDetail(); toast('已设置等级', 'ok');
                }
                function doTransfer() {
                    var e = detail.value; if (!e) return;
                    transfer(e.id, detailX.value | 0, detailY.value | 0);
                    refreshStatus(); closeDetail(); toast('已传送', 'ok');
                }
                function openSkillPicker() { detailShow.value = false; skillPickerShow.value = true; skillQ.value = ''; }

                function showPanel(on) {
                    show.value = on;
                    if (on) {
                        refreshStatus(); refreshList();
                        /* 图标集偶发加载失败（启动竞态）时，开面板自动补一次 */
                        try { if (!iconSetImg) loadIconSet(); } catch (e) {}
                    }
                    // 原生悬浮球在面板打开时藏起来，避免压在面板上
                    try { if (window.MOD && window.MOD.setBallVisible) window.MOD.setBallVisible(!on); } catch (e) {}
                }
                // 供 Java 桥（exec('menu')）调用：原生球点击开/关面板
                window.__RMMOD_TOGGLE = function () { showPanel(!show.value); };
                window.__RMMOD_SHOW = showPanel;

                setInterval(function () { if (show.value) refreshStatus(); }, 1000);

                return {
                    state: state, CHEAT_GROUPS: CHEAT_GROUPS, RATES: RATES, LOCKS: LOCKS, QUICK: QUICK, KIND_LABELS: KIND_LABELS, KIND_ORDER: KIND_ORDER,
                    show: show, tab: tab, dataKind: dataKind, dataQuery: dataQuery, allEntries: allEntries, filtered: filtered, columns: columns, listCls: listCls, iconSrc: iconSrc,
                    detail: detail, detailShow: detailShow, selectedKind: selectedKind, detailValue: detailValue, detailKindIcon: detailKindIcon,
                    levelDraft: levelDraft, varDraft: varDraft, detailX: detailX, detailY: detailY,
                    confirmShow: confirmShow, confirmMsg: confirmMsg, confirmThen: confirmThen, doConfirm: doConfirm,
                    status: status,
                    darkTheme: darkTheme, zhCN: zhCN, themeOverrides: themeOverrides,
                    toggleCheat: toggleCheat, setNum: setNum, setTab: setTab, quick: quick,
                    selectRow: selectRow, closeDetail: closeDetail, detailLabel: detailLabel,
                    doSetItem: doSetItem, doSetSwitch: doSetSwitch, doSetVar: doSetVar,
                    doActorParty: doActorParty, doActorRecover: doActorRecover, doSetLevel: doSetLevel, doTransfer: doTransfer,
                    openSkillPicker: openSkillPicker, skillPickerShow: skillPickerShow, skillQ: skillQ,
                    filteredSkills: filteredSkills, skillColumns: skillColumns, ownedSkills: ownedSkills, toggleSkill: toggleSkill,
                    showPanel: showPanel, refreshStatus: refreshStatus
                };
            },
            template: `
            <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides" :locale="zhCN"
                               style="position:fixed;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:99990;transform:translate3d(0,0,0);will-change:transform;backface-visibility:hidden;">
              <!-- 悬浮球入口已由原生 Java（ModFloatingWindow）实现，见 mod/java -->

              <!-- 面板 -->
              <div v-if="show" class="rm-panel" style="pointer-events:auto;position:fixed;top:12px;right:12px;width:440px;max-width:92vw;height:90vh;display:flex;flex-direction:column;background:#0e1016;border:1px solid #2b3143;border-radius:14px;box-shadow:0 18px 48px rgba(0,0,0,.62),0 2px 10px rgba(0,0,0,.45);overflow:hidden;z-index:2147483002;transform:translate3d(0,0,0);will-change:transform;backface-visibility:hidden;">
                <!-- header -->
                <div style="display:flex;align-items:center;gap:9px;padding:11px 14px;background:linear-gradient(135deg,#1c2434 0%,#161a23 60%);border-bottom:1px solid #272c39;">
                  <span style="width:8px;height:8px;border-radius:50%;background:#5b8cff;box-shadow:0 0 10px rgba(91,140,255,.9);flex:none;"></span>
                  <span style="font-weight:600;color:#f2f4f9;font-size:14px;">再刷一把2 MOD</span>
                  <span style="font-size:10.5px;color:#8b93a7;background:rgba(91,140,255,.12);border:1px solid rgba(91,140,255,.35);border-radius:6px;padding:1px 7px;flex:none;">v8</span>
                  <span style="flex:1;"></span>
                  <n-button-group size="small">
                    <n-button :type="tab==='trainer'?'primary':'default'" :tertiary="tab!=='trainer'" @click="setTab('trainer')">修改器</n-button>
                    <n-button :type="tab==='data'?'primary':'default'" :tertiary="tab!=='data'" @click="setTab('data')">数据</n-button>
                  </n-button-group>
                  <n-button text size="small" @click="showPanel(false)" style="flex:none;"><MIcon name="close" :size="18"/></n-button>
                </div>

                <!-- 状态条 -->
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 12px;background:#11141b;border-bottom:1px solid #272c39;">
                  <n-tag v-if="status.battle" size="small" :bordered="false" type="error"><template #icon><MIcon name="sword" :size="12"/></template> 战斗中</n-tag>
                  <n-tag v-else-if="status.scene==='标题画面'" size="small" :bordered="false" type="info"><template #icon><MIcon name="power" :size="12"/></template> 标题</n-tag>
                  <n-tag v-else-if="status.scene==='地图'" size="small" :bordered="false" type="success"><template #icon><MIcon name="map" :size="12"/></template> 地图</n-tag>
                  <n-tag v-else-if="status.scene" size="small" :bordered="false">{{ status.scene }}</n-tag>
                  <n-tag v-if="status.map" size="small" :bordered="false"><template #icon><MIcon name="map" :size="12"/></template> {{ status.map }}</n-tag>
                  <n-tag v-if="status.gold" size="small" :bordered="false" type="warning"><template #icon><MIcon name="coins" :size="12"/></template> {{ status.gold }}</n-tag>
                  <n-tag v-if="status.party" size="small" :bordered="false"><template #icon><MIcon name="users" :size="12"/></template> {{ status.party }}人</n-tag>
                </div>

                <!-- body -->
                <div style="flex:1;overflow-y:auto;padding:12px;">
                  <!-- ===== 修改器 tab ===== -->
                  <n-flex v-if="tab==='trainer'" vertical :size="12">
                    <n-card size="small">
                      <template #header><span style="display:flex;align-items:center;gap:7px;"><MIcon name="sliders" :size="14" style="color:#5b8cff;"/>作弊开关</span></template>
                      <n-collapse :default-expanded-names="['battle','move','lock']" display-directive="show">
                        <n-collapse-item v-for="g in CHEAT_GROUPS" :key="g.name" :title="g.title" :name="g.name">
                          <n-grid :cols="2" :x-gap="10" :y-gap="4">
                            <n-grid-item v-for="[k,label] in g.items" :key="k">
                              <div class="rm-cheat-row" @click="toggleCheat(k)" style="display:flex;align-items:center;justify-content:space-between;gap:8px;min-width:0;cursor:pointer;padding:4px 6px;margin:-4px -6px;border-radius:6px;">
                                <span style="display:flex;align-items:center;gap:7px;min-width:0;color:#c9cedb;">
                                  <span :style="'flex:none;width:6px;height:6px;border-radius:50%;transition:all .2s;background:'+(state[k]?'#22c55e':'#39404f')+';box-shadow:'+(state[k]?'0 0 7px rgba(34,197,94,.85)':'none')"></span>
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
                      <n-flex vertical :size="10">
                        <div v-for="r in RATES" :key="r.key" style="display:flex;align-items:center;gap:10px;">
                          <span style="color:#c9cedb;flex:none;width:60px;">{{ r.label }}</span>
                          <n-slider style="flex:1;" :value="Number(state[r.key]) || 0" :min="0" :max="r.max" :step="1"
                                    :format-tooltip="v => v + r.suf" @update:value="v => setNum(r.key, v)"/>
                          <n-input-number size="small" :value="Number(state[r.key]) || 0" :show-button="false" style="width:64px;" @update:value="v => setNum(r.key, v)"/>
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
                        <n-text depth="3" style="font-size:12px;">0 = 锁满值（HP/MP 锁上限，TP 锁 100）</n-text>
                      </n-flex>
                    </n-card>

                    <n-card size="small">
                      <template #header><span style="display:flex;align-items:center;gap:7px;"><MIcon name="zap" :size="14" style="color:#8b5cf6;"/>快捷操作</span></template>
                      <n-flex :size="8" wrap>
                        <n-button v-for="a in QUICK" :key="a.act+a.label" size="small" :type="a.type" :secondary="a.type!=='default'" @click="confirmThen(a.act)">
                          <template #icon><MIcon :name="a.icon" :size="14"/></template>{{ a.label }}
                        </n-button>
                      </n-flex>
                    </n-card>
                  </n-flex>

                  <!-- ===== 数据 tab ===== -->
                  <n-flex v-else vertical :size="8">
                    <n-flex :size="6" wrap>
                      <n-button v-for="k in KIND_ORDER" :key="k" size="tiny" :type="dataKind===k?'primary':'default'"
                                :secondary="dataKind!==k" @click="dataKind=k; dataQuery='';">{{ KIND_LABELS[k] }}</n-button>
                    </n-flex>
                    <n-input v-model:value="dataQuery" size="small" clearable placeholder="搜索名称或 ID">
                      <template #prefix><MIcon name="search" :size="14"/></template>
                    </n-input>
                    <n-text depth="3" style="font-size:12px;">{{ filtered.length }} / {{ allEntries.length }} 条</n-text>
                    <n-data-table :columns="columns" :data="filtered" size="small" :bordered="false" :max-height="430"
                                  virtual-scroll :row-key="row => row.id" :pagination="false" :row-class-name="row => row.id===listCls ? 'rm-row-selected' : ''"
                                  :row-props="row => ({ style:'cursor:pointer', onClick: () => selectRow(row) })"/>
                  </n-flex>
                </div>
              </div>

              <!-- 详情 modal -->
              <n-modal :show="detailShow" @update:show="v => { if(!v) closeDetail(); }" preset="card" title="详情" :mask-closable="true" style="width:420px;max-width:92vw;">
                <template #header>
                  <span style="display:flex;align-items:center;gap:8px;min-width:0;">
                    <img v-if="detail && iconSrc(detail.icon)" :src="iconSrc(detail.icon)" style="width:22px;height:22px;border-radius:4px;background:#1b1f2a;"/>
                    <span v-else style="color:#5b8cff;display:flex;"><MIcon :name="detailKindIcon" :size="15"/></span>
                    <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ detailLabel() }}</span>
                  </span>
                </template>

                <n-flex v-if="selectedKind==='item'||selectedKind==='weapon'||selectedKind==='armor'" vertical :size="12">
                  <n-descriptions :column="2" size="small" bordered label-placement="top">
                    <n-descriptions-item label="ID">{{ detail.id }}</n-descriptions-item>
                    <n-descriptions-item label="持有">{{ detail.value }}</n-descriptions-item>
                  </n-descriptions>
                  <div>
                    <n-text depth="3" style="font-size:12px;">数量</n-text>
                    <div style="margin-top:8px;display:flex;gap:8px;align-items:center;">
                      <n-input-number v-model:value="detailValue" :min="0" size="small" style="width:110px;" :show-button="false"/>
                      <n-button size="small" type="primary" @click="doSetItem('set')">设置</n-button>
                      <n-button size="small" type="success" @click="doSetItem('add')">增加</n-button>
                    </div>
                  </div>
                </n-flex>

                <n-flex v-else-if="selectedKind==='actor'" vertical :size="12">
                  <n-descriptions :column="2" size="small" bordered label-placement="top">
                    <n-descriptions-item label="ID">{{ detail.id }}</n-descriptions-item>
                    <n-descriptions-item label="状态">{{ detail.value || '未在队' }}</n-descriptions-item>
                  </n-descriptions>
                  <n-flex :size="8" wrap>
                    <n-button size="small" :type="String(detail.value).indexOf('在队')===0 ? 'error':'primary'" @click="doActorParty">
                      {{ String(detail.value).indexOf('在队')===0 ? '离队':'入队' }}
                    </n-button>
                    <n-button size="small" type="success" @click="doActorRecover">全恢复</n-button>
                    <n-button size="small" @click="openSkillPicker">技能</n-button>
                  </n-flex>
                  <div style="display:flex;gap:8px;align-items:center;margin-top:4px;">
                    <span style="color:#c9cedb;">等级</span>
                    <n-input-number v-model:value="levelDraft" :min="1" size="small" style="width:90px;" :show-button="false"/>
                    <n-button size="small" type="primary" @click="doSetLevel">设等级</n-button>
                  </div>
                </n-flex>

                <n-flex v-else-if="selectedKind==='map'" vertical :size="12">
                  <n-descriptions :column="2" size="small" bordered label-placement="top">
                    <n-descriptions-item label="ID">{{ detail.id }}</n-descriptions-item>
                    <n-descriptions-item label="地图">{{ detail.name }}</n-descriptions-item>
                  </n-descriptions>
                  <div style="display:flex;gap:10px;align-items:center;">
                    <div style="display:flex;align-items:center;gap:6px;"><span style="color:#c9cedb;">X</span><n-input-number v-model:value="detailX" size="small" style="width:76px;" :show-button="false"/></div>
                    <div style="display:flex;align-items:center;gap:6px;"><span style="color:#c9cedb;">Y</span><n-input-number v-model:value="detailY" size="small" style="width:76px;" :show-button="false"/></div>
                    <n-button size="small" type="primary" @click="doTransfer">传送</n-button>
                  </div>
                </n-flex>

                <n-flex v-else-if="selectedKind==='switch'" vertical :size="10">
                  <div style="display:flex;align-items:center;justify-content:space-between;">
                    <span style="color:#c9cedb;">当前: {{ detail.value }}</span>
                    <n-switch size="small" :value="detail.value==='ON'" @update:value="v => doSetSwitch(v)"/>
                  </div>
                  <n-text depth="3" style="font-size:12px;">状态：ON 为开，OFF 为关</n-text>
                </n-flex>

                <n-flex v-else-if="selectedKind==='variable'" vertical :size="10">
                  <n-descriptions :column="2" size="small" bordered label-placement="top">
                    <n-descriptions-item label="当前值">{{ String(detail.value) }}</n-descriptions-item>
                  </n-descriptions>
                  <n-input-group style="margin-top:8px;">
                    <n-input v-model:value="varDraft" size="small" placeholder="数字或文本"/>
                    <n-button size="small" type="primary" @click="doSetVar">设置</n-button>
                  </n-input-group>
                </n-flex>
              </n-modal>

              <!-- 技能 picker modal -->
              <n-modal :show="skillPickerShow" @update:show="v => { if(!v) skillPickerShow=false; }" preset="card" title="技能" :mask-closable="true" style="width:420px;max-width:92vw;">
                <n-flex vertical :size="8">
                  <n-input v-model:value="skillQ" size="small" clearable placeholder="搜索技能">
                    <template #prefix><MIcon name="search" :size="14"/></template>
                  </n-input>
                  <n-text depth="3" style="font-size:12px;">已学 {{ ownedSkills.length }} / {{ filteredSkills.length }}</n-text>
                  <n-data-table :columns="skillColumns" :data="filteredSkills" size="small" :bordered="false" :max-height="360"
                                virtual-scroll :row-key="row => row.id" :pagination="false"/>
                </n-flex>
              </n-modal>

              <!-- 确认 modal -->
              <n-modal :show="confirmShow" @update:show="v => { if(!v) confirmShow=false; }" preset="dialog" type="warning" title="确认"
                       :content="confirmMsg" positive-text="继续" negative-text="取消" @positive-click="doConfirm" @negative-click="confirmShow=false"/>
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

            // 仅剩的必要管线样式：modal 层级 + toast + 选中行 + 动画
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
                '.rm-cheat-row:hover{background:rgba(91,140,255,.08)}',
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
            function isModUiTarget(t) {
                return !!(t && t.closest && (t.closest('#rmmod-ui') || t.closest('.n-modal-container') || t.closest('#rm-toasts')));
            }
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
                shimDown = (e.pointerType === 'touch') ? { x: e.clientX, y: e.clientY, t: Date.now(), target: e.target, decided: null } : null;
            }, true);
            document.body.addEventListener('pointermove', function (e) {
                if (!shimDown || e.pointerType !== 'touch' || !isModUiTarget(e.target)) return;
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
                if (!down || e.pointerType !== 'touch' || !isModUiTarget(e.target)) return;
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
       二代带壳冷启动已 30~40s，不能再让 1.7MB vendor 解析雪上加霜。 */
    var ready = false;
    (function pollReady() {
        try {
            if (!ready && window.Game_Battler && window.Game_Party && window.Game_Actor && window.Game_Enemy && document.body) {
                ready = true;
                try { hookAll(); L('cheat hooks installed'); } catch (e) { L('hookAll err ' + (e && e.message)); }
            }
        } catch (e) {}
        if (!ready) setTimeout(pollReady, 500);
    })();

    L('mod v8 ready (ui lazy)');
})();
