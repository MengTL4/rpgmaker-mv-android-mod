# -*- coding: utf-8 -*-
"""PlayAgain2 等价实现补丁：R8 横向合并导致 keepteam 依赖被删除包，需等价替换。

生成四个 patches/ 整文件覆盖：
  * a2/ll.smali , a2/j.smali : kotlin ClosedFloatingPointRange.hashCode() 里的
        com/taptap/sdk/core/o->o(D)I  --> java.lang.Double.doubleToLongBits + xor（Double.hashCode 等价实现）
  * com/tencent/smtt/sdk/SystemWebViewClient$2.smali : tapsdk/anythink 的 o->o(...)
        --> android.webkit.WebResourceError 平台方法（getDescription/getErrorCode，API23+）
  * j0/c.smali : anythink odopt 的 o(ContentProviderClient) 关流 --> ContentProviderClient.release()
"""
import re
import os

DEC = "E:/project/RMToolboxM/PlayAgain2/decode"
PATCH = "E:/project/RMToolboxM/PlayAgain2/patches"


def rd(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def wr(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(s)


def rep_method(src, sig, new_body_file=None, new_body=None):
    esc = re.escape(sig)
    pat = re.compile(r"\.method [^\n]*" + esc + r"[^\n]*\n.*?\.end method", re.S)
    ms = list(pat.finditer(src))
    assert len(ms) == 1, (sig, len(ms))
    m = ms[0]
    hdr = m.group(0).split("\n", 1)[0]
    body = new_body if new_body is not None else open(new_body_file, encoding="utf-8").read()
    return src[: m.start()] + hdr + "\n" + body.rstrip("\n") + "\n.end method\n" + src[m.end():]


# ---- hashCode 内联：Double.hashCode = (int)(bits ^ (bits>>>32)), bits=doubleToLongBits ----
def double_hash_code(cls):
    return f"""    .locals 6

    invoke-virtual {{p0}}, L{cls};->isEmpty()Z

    move-result v0

    if-eqz v0, :cond_0

    const/4 v0, -0x1

    goto :goto_0

    :cond_0
    iget-wide v0, p0, L{cls};->o:D

    invoke-static {{v0, v1}}, Ljava/lang/Double;->doubleToLongBits(D)J

    move-result-wide v0

    const/16 v5, 0x20

    ushr-long v3, v0, v5

    xor-long v0, v0, v3

    long-to-int v0, v0

    mul-int/lit8 v0, v0, 0x1f

    iget-wide v1, p0, L{cls};->O:D

    invoke-static {{v1, v2}}, Ljava/lang/Double;->doubleToLongBits(D)J

    move-result-wide v1

    ushr-long v3, v1, v5

    xor-long v1, v1, v3

    long-to-int v1, v1

    add-int/2addr v0, v1

    :goto_0
    return v0
"""

for cls in ("a2/ll", "a2/j"):
    src = rd(f"{DEC}/smali_classes3/{cls}.smali")
    src = rep_method(src, "hashCode()I", new_body=double_hash_code(cls))
    wr(f"{PATCH}/smali_classes3/{cls}.smali", src)

# ---- SystemWebViewClient$2：平台方法替换 ----
s2 = rd(f"{DEC}/smali_classes3/com/tencent/smtt/sdk/SystemWebViewClient$2.smali")
s2 = s2.replace(
    "    invoke-static {v0}, Lcom/tapsdk/tapad/internal/ui/views/web/o;->o(Landroid/webkit/WebResourceError;)Ljava/lang/CharSequence;",
    "    invoke-virtual {v0}, Landroid/webkit/WebResourceError;->getDescription()Ljava/lang/CharSequence;",
)
s2 = s2.replace(
    "    invoke-static {v0}, Lcom/anythink/core/activity/component/o;->o(Landroid/webkit/WebResourceError;)I",
    "    invoke-virtual {v0}, Landroid/webkit/WebResourceError;->getErrorCode()I",
)
assert "tapsdk" not in s2 and "anythink" not in s2, "SystemWebViewClient$2 not fully patched"
wr(f"{PATCH}/smali_classes3/com/tencent/smtt/sdk/SystemWebViewClient$2.smali", s2)

# ---- j0/c：ContentProviderClient -> anythink odopt 关流改平台 release ----
jc = rd(f"{DEC}/smali_classes2/j0/c.smali")
p = "    invoke-static {v0}, Lcom/anythink/odopt/a/a/ll;->o(Landroid/content/ContentProviderClient;)V"
assert jc.count(p) == 1, jc.count(p)
jc = jc.replace(p, "    invoke-virtual {v0}, Landroid/content/ContentProviderClient;->release()Z")
assert "anythink/odopt" not in jc
wr(f"{PATCH}/smali_classes2/j0/c.smali", jc)

# ---- R8 把 SDK 内部类横向合并进 X5(tencent/smtt) 的类：等价平台方法替换 ----
# 1) SystemWebViewClient$3.didCrash()-> kwad RenderProcessGoneDetail.didCrash()
rel3 = "smali_classes3/com/tencent/smtt/sdk/SystemWebViewClient$3.smali"
src3 = rd(f"{DEC}/{rel3}")
src3 = src3.replace(
    "    invoke-static {v0}, Lcom/kwad/sdk/core/webview/a/o;->o(Landroid/webkit/RenderProcessGoneDetail;)Z",
    "    invoke-virtual {v0}, Landroid/webkit/RenderProcessGoneDetail;->didCrash()Z",
)
assert "com/kwad" not in src3
wr(f"{PATCH}/{rel3}", src3)

# 2) WebSettings.setSafeBrowsingEnabled(Z) -> 平台 setSafeBrowsingEnabled (API26+)
relw = "smali_classes3/com/tencent/smtt/sdk/WebSettings.smali"
srcw = rd(f"{DEC}/{relw}")
srcw = srcw.replace(
    "    invoke-static {v1, p1}, Lcom/anythink/core/express/web/o;->o(Landroid/webkit/WebSettings;Z)V",
    "    invoke-virtual {v1, p1}, Landroid/webkit/WebSettings;->setSafeBrowsingEnabled(Z)V",
)
assert "com/anythink" not in srcw
wr(f"{PATCH}/{relw}", srcw)

# 3) Apn.getApnType() -> 平台 getActiveNetwork (API>28 分支)
rela = "smali_classes3/com/tencent/smtt/utils/Apn.smali"
srca = rd(f"{DEC}/{rela}")
srca = srca.replace(
    "    invoke-static {p0}, Lcom/anythink/basead/exoplayer/scheduler/o;->o(Landroid/net/ConnectivityManager;)Landroid/net/Network;",
    "    invoke-virtual {p0}, Landroid/net/ConnectivityManager;->getActiveNetwork()Landroid/net/Network;",
)
assert "com/anythink" not in srca
wr(f"{PATCH}/{rela}", srca)

# 4) glide DefaultConnectivityMonitor m$ll.o() -> 平台 getActiveNetwork (API24+, 类带 @RequiresApi(24))
relg = "smali/com/bumptech/glide/manager/m$ll.smali"
srcg = rd(f"{DEC}/{relg}")
srcg = srcg.replace(
    "    invoke-static {v0}, Lcom/anythink/basead/exoplayer/scheduler/o;->o(Landroid/net/ConnectivityManager;)Landroid/net/Network;",
    "    invoke-virtual {v0}, Landroid/net/ConnectivityManager;->getActiveNetwork()Landroid/net/Network;",
)
assert "com/anythink" not in srcg
wr(f"{PATCH}/{relg}", srcg)

print("patch_eq OK: a2/ll, a2/j, SystemWebViewClient$2, SystemWebViewClient$3, WebSettings, Apn, j0/c, glide m$ll")
