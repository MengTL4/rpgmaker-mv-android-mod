# -*- coding: utf-8 -*-
# 解码 javascript-obfuscator 字符串数组：自定义字母表(小写优先) base64 + URI 解码
# 用法: python deobf_strings.py <bundle-loader.js>  → 输出全部解码字符串(带索引)
import re, base64, sys, urllib.parse

src = open(sys.argv[1], 'r', encoding='utf-8', errors='replace').read()

# 提取最大的字符串数组字面量
arrays = re.findall(r"\[(?:'(?:[^'\\]|\\.)*',?\s*){10,}\]", src)
if not arrays:
    print('未找到字符串数组'); sys.exit(1)
raw = max(arrays, key=len)
arr = re.findall(r"'((?:[^'\\]|\\.)*)'", raw)
arr = [a.replace("\\'", "'").replace('\\\\', '\\') for a in arr]
print('数组长度:', len(arr))

# JS 解码器: 自定义 base64 字母表(小写在前) → 字节 → %XX → decodeURIComponent(UTF-8)
ALPHA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/='

def dec(s):
    try:
        b = bytearray()
        bits = 0; acc = 0
        for ch in s:
            if ch == '=':
                break
            i = ALPHA.index(ch)
            if i >= 64:
                return None
            acc = (acc << 6) | i
            bits += 6
            if bits >= 8:
                bits -= 8
                b.append((acc >> bits) & 0xFF)
        # JS: '%'+'00'+hex.slice(-2) 拼接后 decodeURIComponent → 等价于按 UTF-8 解
        esc = ''.join('%%%02x' % c if c > 127 or c < 32 else chr(c) for c in b)
        return urllib.parse.unquote(esc, errors='strict')
    except Exception:
        return None

def readable(s):
    if s is None or not s:
        return False
    pr = sum(1 for c in s if c.isprintable() and (c.isascii() or '\u4e00' <= c <= '\u9fff'))
    return pr >= len(s) * 0.9

# 穷举旋转量：抽样解码，正确旋转时绝大多数字符串可读
best, bestScore = 0, -1
for shift in range(len(arr)):
    rot = arr[shift:] + arr[:shift]
    sample = rot[::13]
    score = sum(1 for s in sample if readable(dec(s))) / max(1, len(sample))
    if score > bestScore:
        bestScore, best = score, shift
    if score > 0.95:
        best = shift; break

rot = arr[best:] + arr[:best]
print('旋转量: %d, 可读率(抽样): %.2f' % (best, bestScore))
out = []
for i, s in enumerate(rot):
    d = dec(s)
    out.append('[0x%03x] %s' % (i, d if d is not None else '<无法解码>'))
text = '\n'.join(out)
open(sys.argv[1] + '.strings.txt', 'w', encoding='utf-8').write(text)
print('已写出:', sys.argv[1] + '.strings.txt')
