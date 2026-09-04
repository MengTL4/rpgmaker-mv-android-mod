# -*- coding: utf-8 -*-
"""PlayAgain2 剥离后零引用复查：对 decode 树套用 strip-sdk.txt，凡"存活"的 .smali
若仍引用被删包/类 则报告（KEEP -> DELETED 悬空引用 = 运行期 NoClassDefFoundError 隐患）。"""
import os
import re
import fnmatch

ROOT = "E:/project/RMToolboxM/PlayAgain2"
DEC = ROOT + "/decode"
PATCH = ROOT + "/patches"
STRIP = ROOT + "/patches/strip-sdk.txt"

DEX = re.compile(r"^smali(_classes\d+)?/")

# build.sh 会把 patches/. 覆盖到解码树上：用 overlay 映射代替逐文件拷贝
overlay = {}
for dirpath, _, files in os.walk(PATCH):
    for name in files:
        if not name.endswith(".smali"):
            continue
        full = os.path.join(dirpath, name)
        rel = os.path.relpath(full, PATCH).replace("\\", "/")
        if rel.startswith(("assets/", "res/")):
            continue
        overlay[rel] = full

with open(STRIP, encoding="utf-8") as f:
    raw = [ln.strip() for ln in f if ln.strip() and not ln.strip().startswith("#")]

# 1) 展开 strip 规则为"删除前缀"。目录行 -> 该相对路径前缀；文件/glob 行 -> 相对路径本身（glob 展开）
del_prefixes = []  # 相对路径（正斜杠），命中即删除
del_files = []     # 具体删除的文件路径（glob 展开后）
for line in raw:
    # 有 glob 字符：在 decode 里展开匹配到相对路径
    if any(c in line for c in "*?["):
        base = DEC + "/" + os.path.dirname(line)
        if os.path.isdir(base):
            for name in os.listdir(base):
                if fnmatch.fnmatch(name, os.path.basename(line)):
                    del_files.append(os.path.join(os.path.dirname(line), name).replace("\\", "/"))
        del_prefixes.append("")  # 占位（glob 命中已进 del_files）
    else:
        # 目录（在 decode 存在且为目录）或具体文件
        if os.path.isdir(DEC + "/" + line):
            del_prefixes.append(line.rstrip("/") + "/")
        else:
            del_files.append(line)

del_files = set(del_files)


def is_deleted(rel):
    if rel in del_files:
        return True
    for p in del_prefixes:
        if p and rel.startswith(p):
            return True
    return False


deleted_type_prefixes = set()
# 目录前缀 -> 类型前缀：把 `smali_classes2/com/taptap` 变成 `com/taptap/`
for p in del_prefixes:
    if p:
        m = DEX.match(p)
        if m:
            rest = p[m.end():]
            deleted_type_prefixes.add(rest)

TYPE = re.compile(r"L([A-Za-z0-9_/$\(\)-]+);")

bad = []
kept_count = 0
for dirpath, _, files in os.walk(DEC):
    for name in files:
        if not name.endswith(".smali"):
            continue
        rel = os.path.relpath(os.path.join(dirpath, name), DEC).replace("\\", "/")
        if is_deleted(rel):
            continue
        kept_count += 1
        src_path = overlay.get(rel, os.path.join(dirpath, name))
        txt = open(src_path, encoding="utf-8", errors="replace").read()
        for m in TYPE.finditer(txt):
            t = m.group(1)
            for prefix in deleted_type_prefixes:
                if t.startswith(prefix):
                    bad.append((rel, t))
                    break

print("存活 smali 文件数:", kept_count)
print("可疑引用:", len(bad))
seen = set()
for rel, t in bad:
    key = (rel, t)
    if key in seen:
        continue
    seen.add(key)
    print(f"  {rel} -> {t}")

# 仅当指向被删包根才视为"需处理"的悬空引用（指向被删具体类已由 surgery 桩化，此处不再逐条列）
fatal = [
    b for b in bad
    if any(b[1].startswith(p) for p in (
        "com/anythink/", "com/taptap/", "com/tapsdk/", "com/bykv/", "com/byted",
        "com/sigmob/", "com/kwad/", "com/qq/", "com/ss/", "com/tapadn/", "com/hjgzs/",
        "com/flyjingfish/", "com/drakeet/", "com/luck/", "com/czhj/", "com/baidu/",
        "com/kuaishou/", "com/kwai/", "com/alex/", "com/bytedance/",
        "ce/f1", "ce/n1", "razerdp/", "q0/", "e3/", "f3/", "cd/", "hjgzs/privacy",
    ))
]
print("需处理（指向被删根）:", len(fatal))
for rel, t in fatal[:60]:
    print("  !", rel, "->", t)
