// -*- mode: js -*-
// 从 原版apk 的 jfm_data/qingyi + 已正确命名的 decode/assets/www 生成 digest→路径 清单。
// 用法: node gen-map.js <jfm_dir> <qingyi_dir> <decode_www> [out.json]
//   jfm_dir/qingyi_dir 是 apk 里解出来的密文目录（如 tools 里 unzip game.apk 的 assets/www/jfm_data）
//   decode_www 是 PlayAgain/decode/assets/www（已含正确命名的 js/ data/）
//   输出默认 ./resource-map.json，全为字符串路径（不含明文内容，可入库）。
// 匹配策略：内容哈希优先（抗个别文件被缓存时二次编辑），其次按 sha256(相对路径) 试；都失败→列出待人工核对。
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const [jfmDir, qingyiDir, decodeWww, out] = process.argv.slice(2);
if (!jfmDir || !qingyiDir || !decodeWww) { console.error('用法: node gen-map.js <jfm_dir> <qingyi_dir> <decode_www> [out]'); process.exit(1); }

const sha = s => crypto.createHash('sha256').update(s).digest('hex');

// 明文判定：wasm 或高可打印文本
function looksPlain(buf) {
    if (buf.length >= 4 && buf.slice(0, 4).toString('utf8') === '\0asm') return true;
    let p = 0;
    for (let i = 0; i < Math.min(buf.length, 256); i++) {
        const b = buf[i];
        if ((b >= 32 && b < 127) || b === 9 || b === 10 || b === 13) p++;
    }
    return p >= 200;
}
function decryptBytes(digest, enc) {
    if (looksPlain(enc)) return enc;               // 明文（wasm/text）
    try {
        const rawkey = Buffer.from(digest.slice(48, 64), 'utf8');
        const key = Buffer.from(rawkey.map(b => b ^ 0xb6));
        const iv = Buffer.from(digest.slice(0, 16), 'utf8');
        const d = crypto.createDecipheriv('aes-128-gcm', key, iv);
        d.setAuthTag(enc.slice(-16));
        return Buffer.concat([d.update(enc.slice(0, -16)), d.final()]);
    } catch (e) { return null; }
}

// --- 收集 apk 密文：digest -> {dir, enc} ---
const apk = new Map(); // digest -> {srcDir, enc}
function collect(dir, srcDir) {
    for (const f of fs.readdirSync(dir)) {
        const enc = fs.readFileSync(path.join(dir, f));
        apk.set(f, { srcDir, enc });
    }
}
collect(jfmDir, 'jfm');
collect(qingyiDir, 'qingyi');

// --- 内容索引: sha256(明文内容) -> digest（用于内容哈希匹配）---
const contentIndex = new Map(); // cHash -> digest
const contentOwners = new Map(); // cHash -> [digests...]
for (const [digest, { enc, srcDir }] of apk) {
    const pt = decryptBytes(digest, enc);
    if (pt) {
        const ch = sha(pt);
        if (!contentOwners.has(ch)) contentOwners.set(ch, []);
        contentOwners.get(ch).push(digest);
        if (!contentIndex.has(ch)) contentIndex.set(ch, digest);
    }
}

// --- 遍历 decode/{js,data} 已知正确路径，建立 digest→路径 ---
const map = {};
const unmatched = [];
const used = new Set(); // 已占用的 digest
function walk(dir, base) {
    for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        if (fs.statSync(full).isDirectory()) { walk(full, path.join(base, name)); continue; }
        const rel = base ? base.replace(/\\/g, '/').replace(/^.*?decode\/assets\/www\/?/, '') + name : name;
        // decodeWww 相对路径：js/... 或 data/...
        const relP = path.relative(decodeWww, full).replace(/\\/g, '/');
        if (!/^(js|data)\//.test(relP)) continue; // 只关注 js + data（其余 www 资源 apk 已是明文，直接透传）
        const buf = fs.readFileSync(full);
        const ch = sha(buf);
        const owners = contentOwners.get(ch);
        let target = null;
        if (owners) {
            // 内容哈希匹配：优先取一个未被占用的 digest
            target = owners.find(d => !used.has(d)) || null;
        }
        if (target) {
            if (used.has(target) || (map[target] && map[target] !== relP)) target = null; // 冲突则走路径
        }
        if (!target) {
            // 路径哈希试试: digest = sha256(relP)
            const ph = sha(relP);
            if (apk.has(ph)) { target = ph; }
        }
        if (target) {
            if (used.has(target) && map[target] !== relP) { unmatched.push(relP + '  (冲突: ' + target + ')'); continue; }
            map[target] = relP;
            used.add(target);
        } else {
            unmatched.push(relP + '  (未匹配到 digest)');
        }
    }
}
walk(path.join(decodeWww, 'js'), 'js');
walk(path.join(decodeWww, 'data'), 'data');

// --- 未被 decode 覆盖的 apk digest → _unknown（未被引用/多余资源，避免误判为缺失）---
let unknown = 0;
for (const d of apk.keys()) {
    if (!map[d]) { map[d] = '_unknown/' + d; unknown++; }
}

// --- 写文件（键排序，路径正斜杠）---
const outPath = out || path.join(__dirname, 'resource-map.json');
fs.writeFileSync(outPath, JSON.stringify(Object.fromEntries(Object.entries(map).sort()), null, 2));

console.log('apk 密文 digests:', apk.size);
console.log('decode 已知路径映射:', Object.keys(map).length - unknown);
console.log('未匹配到 digest 的 decode 路径:', unmatched.length);
unmatched.forEach(u => console.log('   ⚠', u));
console.log('被 _unknown 兜底的 apk digests:', unknown);
if (unmatched.length) console.log('提示: 上述未匹配路径需人工在 resource-map.json 里补 map[digest]=路径（如 jquery 按版本横幅定位 digest）。');
console.log('已写:', outPath);
