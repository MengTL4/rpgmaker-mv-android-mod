// -*- mode: js -*-
// build.sh 调用的资源自动解码器：把原版加密布局 jfm_data/qingyi 解成明文 js/data。
// 用法: node decrypt.js <www目录> <resource-map.json>
//   www目录      = apktool 反编译产物里的 assets/www（含 jfm_data + qingyi）
//   resource-map = digest→www相对路径 清单（由 gen-map.js 生成，仅字符串路径，可入库）
// 行为：jfm_data→<map[digest]>（多为 js/*），qingyi→<map[digest]>（多为 data/*.json）；
//       未在清单中的 digest 落到 _unknown/<digest>。只解码，不删源目录（删除由 build.sh 做）。
// 只用 Node stdlib（crypto/fs），无需 npm 依赖。
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const [wwwDir, mapPath] = process.argv.slice(2);
if (!wwwDir || !mapPath) { console.error('用法: node decrypt.js <www目录> <resource-map.json>'); process.exit(1); }
let map;
try { map = JSON.parse(fs.readFileSync(mapPath, 'utf8')); }
catch (e) { console.error('无法读取 resource-map:', mapPath, e.message); process.exit(1); }

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
    if (looksPlain(enc)) return enc;                 // 明文（wasm/text），直接用
    try {
        const rawkey = Buffer.from(digest.slice(48, 64), 'utf8');
        const key = Buffer.from(rawkey.map(b => b ^ 0xb6));
        const iv = Buffer.from(digest.slice(0, 16), 'utf8');
        const d = crypto.createDecipheriv('aes-128-gcm', key, iv);
        d.setAuthTag(enc.slice(-16));
        return Buffer.concat([d.update(enc.slice(0, -16)), d.final()]);
    } catch (e) { return null; }
}

function processDir(srcDir, label) {
    if (!fs.existsSync(srcDir)) { console.log('跳过（无 ' + label + '）'); return; }
    let ok = 0, unknown = 0, fatal = 0;
    for (const f of fs.readdirSync(srcDir)) {
        const enc = fs.readFileSync(path.join(srcDir, f));
        const pt = decryptBytes(f, enc);
        const rel = map[f] || ('_unknown/' + f);
        const realPath = !rel.startsWith('_unknown/');
        if (!pt) {
            if (realPath) { console.log('  FAIL(真实路径) ' + rel + ' ← ' + f.slice(0, 16) + ' (解密失败，中止)'); fatal++; }
            else { console.log('  · _unknown(' + f.slice(0, 16) + ') 解密失败，跳过(未引用资源)'); unknown++; }
            continue;
        }
        if (rel.startsWith('_unknown/')) unknown++;
        const dest = path.join(wwwDir, rel);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, pt);
        ok++;
    }
    console.log('  ' + label + ': 解码 ' + ok + '，_unknown ' + unknown + '，真实路径失败 ' + fatal);
    return { ok, unknown, fatal };
}

console.log('资源自动解密: www=' + wwwDir);
const base = path.join(wwwDir);
let tot = { ok: 0, unknown: 0, fatal: 0 };
for (const [sub, label] of [['jfm_data', 'jfm_data'], ['qingyi', 'qingyi']]) {
    const r = processDir(path.join(base, sub), label);
    if (r) { tot.ok += r.ok; tot.unknown += r.unknown; tot.fatal += r.fatal; }
}
console.log('完成: 解码 ' + tot.ok + '，_unknown ' + tot.unknown + '，真实路径失败 ' + tot.fatal);
if (tot.fatal > 0) process.exit(1);          // 仅当真实路径(js/data)解码失败才中止构建
if (tot.unknown > 0) console.log('提示: _unknown 为清单未覆盖/未引用资源，已跳过或落 _unknown/。');
