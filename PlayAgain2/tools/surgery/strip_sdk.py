# -*- coding: utf-8 -*-
"""PlayAgain2 (zseb, gen2) 外围 SDK 剥离手术脚本。

对 decode/ 里的各 smali 文件做方法级改造，把结果写入 patches/（每次换新版本、重新
apktool d 后，用脚本在 decode/ 上重跑一遍即可得到相同的 patch 基线）。

覆盖：
  * MainActivity.smali : 去 implements ll$c/l$II、删字段 II/Il/tatuAd、z()→V()、
                         ab() 去 anythink、U/ae/af/ba/bb/bc/J 桩化、24 个 SDK 回调桩化、
                         onAdShow 直发奖励、onActivityResult/onDestroy 重写、删 t() 访问器、
                         MainActivity$o.run 桩化
  * I.smali            : 删 ll 字段与 o(Lll;)V 设值方法，21 个 TapTap 桥接方法桩化
                         （保 @JavascriptInterface 注解）
完全等价代码补丁（R8 横向合并残留，见 build 产物）直接以整文件覆盖写入 patches/：
  * a2/ll.smali + a2/j.smali : hashCode() 里 com/taptap/sdk/core/o->o(D)I
                               —> java.lang.Double.doubleToLongBits + xor
  * com/tencent/smtt/sdk/SystemWebViewClient$2.smali : tapsdk/anythink 的 o->o(...)
                               —> android.webkit.WebResourceError 平台方法
只在 j0/c.smali 做一行替换（anythink odopt 关流 -> ContentProviderClient.release）。
"""
import re

ROOT = "E:/project/RMToolboxM/PlayAgain2"
DEC = ROOT + "/decode"
PATCH = ROOT + "/patches"
RPG = "smali_classes2/com/hjgzs/rpgplugin"


def rd(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def wr(p, s):
    with open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(s)


def replace_method(src, sig, new_body, delete=False):
    """按 .method .. .end method 整段替换/删除。sig 是方法签名（如 'ae()V'）。"""
    esc = re.escape(sig)
    pat = re.compile(r"\.method [^\n]*" + esc + r"\n.*?\.end method", re.S)
    ms = list(pat.finditer(src))
    assert len(ms) == 1, (sig, len(ms))
    m = ms[0]
    if delete:
        return src[: m.start()] + src[m.end():]
    hdr = m.group(0).split("\n", 1)[0]
    block = hdr + "\n" + new_body.rstrip("\n") + "\n.end method\n"
    return src[: m.start()] + block + src[m.end():]


def parse_method(mtext):
    """返回 (header_line, annotations_str)。注解从方法体开头(.locals 之后)连续 .annotation..end annotation 块。"""
    lines = mtext.split("\n")
    hdr = lines[0]
    # 收集方法体内所有 4空格缩进 的 .annotation .. .end annotation 块
    anns = []
    i = 1
    while i < len(lines):
        if re.match(r"^    \.annotation ", lines[i]):
            block = [lines[i]]
            j = i + 1
            while j < len(lines) and not lines[j].startswith("    .end annotation"):
                block.append(lines[j])
                j += 1
            if j < len(lines):
                block.append(lines[j])
                j += 1
            anns.append("\n".join(block))
            i = j
        else:
            i += 1
    return hdr, ("\n".join(anns) + "\n" if anns else "")


def stub_method(orig_text, ret):
    hdr, anns = parse_method(orig_text)
    end = "\n.end method\n"
    if ret == "V":
        return hdr + "\n" + anns + "    .locals 0\n\n    # RMMOD: 外围SDK已剥离，空实现\n\n    return-void\n" + end
    if ret in ("Z", "I"):
        return hdr + "\n" + anns + "    .locals 1\n\n    # RMMOD: 外围SDK已剥离，空实现\n\n    const/4 v0, 0x0\n\n    return v0\n" + end
    if ret == "Ljava/lang/String;":
        return hdr + "\n" + anns + "    .locals 1\n\n    # RMMOD: 外围SDK已剥离，空实现\n\n    const-string v0, \"\"\n\n    return-object v0\n" + end
    raise ValueError(ret)


def drop_line(src, line):
    assert line in src, repr(line)
    return src.replace(line + "\n", "")


# ---------------------------------------------------------------- MainActivity
MP = DEC + "/" + RPG + "/MainActivity.smali"
OP = PATCH + "/" + RPG + "/MainActivity.smali"
s = rd(MP)

# 1. 类头：去两个将被删除的接口
s = drop_line(s, ".implements Lcom/hjgzs/rpgplugin/ll$c;")
s = drop_line(s, ".implements Lcom/hjgzs/rpgplugin/l$II;")

# 2. 字段：ll/l/tatuAd 类型及其承载字段删除（字段类型解析在 verifier 中会解析，必须删干净所有引用）
for line in (
    ".field public II:Lcom/hjgzs/rpgplugin/ll;",
    ".field public Il:Lcom/hjgzs/rpgplugin/l;",
    ".field public tatuAd:Lce/f1;",
):
    s = drop_line(s, line)

# 3. 整段删除：t() 访问器（返回已删字段 II）。调用者：MainActivity$l(删)、MainActivity$o(stub) → 零引用
s = replace_method(s, "t(Lcom/hjgzs/rpgplugin/MainActivity;)Lcom/hjgzs/rpgplugin/ll;", "", delete=True)

# 4. 启动链：z() 直接 V()，绕过 隐私弹窗(cd/a)->MainActivity$l->af() 合规链
z_body = """    .locals 0

    # RMMOD: 已剥离隐私/防沉迷/登录链，直接显示游戏界面（onResume 的 __modVShown 守卫仍是兜底）
    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->V()V

    return-void
"""
s = replace_method(s, "z()V", z_body)

# 5. ab() 去 anythink：统一用 WebSettings UA 解析 Chrome 主版本（原 SDK>=26 走 anythink 工具取 WebView 包信息）
ab_body = """    .locals 4

    const/4 v0, 0x0

    :try_start_0
    const-string v1, "Chrome/"

    invoke-static {p0}, Landroid/webkit/WebSettings;->getDefaultUserAgent(Landroid/content/Context;)Ljava/lang/String;

    move-result-object v2

    if-eqz v2, :cond_1

    invoke-virtual {v2, v1}, Ljava/lang/String;->contains(Ljava/lang/CharSequence;)Z

    move-result v3

    if-eqz v3, :cond_1

    invoke-virtual {v2, v1}, Ljava/lang/String;->indexOf(Ljava/lang/String;)I

    move-result v1

    add-int/lit8 v1, v1, 0x7

    const-string v3, "."

    invoke-virtual {v2, v3, v1}, Ljava/lang/String;->indexOf(Ljava/lang/String;I)I

    move-result v3

    if-le v3, v1, :cond_1

    invoke-virtual {v2, v1, v3}, Ljava/lang/String;->substring(II)Ljava/lang/String;

    move-result-object v1

    invoke-static {v1}, Ljava/lang/Integer;->parseInt(Ljava/lang/String;)I

    move-result v0
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    return v0

    :catch_0
    move-exception v1

    const-string v2, "-TK-"

    const-string v3, "\\u83b7\\u53d6\\u7cfb\\u7edfWebView\\u7248\\u672c\\u5931\\u8d25"

    invoke-static {v2, v3, v1}, La0/l;->b(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    :cond_1
    return v0
"""
s = replace_method(s, "ab()I", ab_body)

# 6. 桩化：AnyThink 广告初始化链 + 悬浮菜单/登录管理器初始化
for sig in ("ba()V", "bb()V", "bc()V", "U()V", "ae()V", "af()V", "J()V"):
    s = replace_method(s, sig, "    .locals 0\n\n    # RMMOD: SDK剥离——原逻辑随外围SDK移除，空实现\n\n    return-void\n")

# 7. 24 个 ll$c / l$II 回调桩化（游戏侧不可能再触发；防沉迷/登录/动态/悬浮菜单点击）
void_cb = [
    "onAchievementClick()V", "onForumClick()V", "onFriendClick()V", "onReviewClick()V",
    "onSaveClick()V", "onShareClick()V",
    "onLoginCanceled()V", "onLoginSuccess()V", "onLogoutSuccess()V",
    "onMomentClosed()V", "onMomentOpened()V", "onMomentPublishSuccess()V",
    "onNetworkError()V", "onPermissionsRequested()V", "onRetryExhausted()V",
    "onOpenCloudSaveUI()V",
]
for sig in void_cb:
    s = replace_method(s, sig, "    .locals 0\n\n    # RMMOD: SDK剥离——原回调随TapTap/悬浮菜单移除，空实现\n\n    return-void\n")
for sig in (
    "onAchievementError(Ljava/lang/String;ILjava/lang/String;)V",
    "onAchievementUnlocked(Ljava/lang/String;Ljava/lang/String;)V",
    "onAntiAddictionTriggered(ILjava/lang/String;)V",
    "onLoginFailed(Ljava/lang/String;)V",
    "onMomentNewMessage(I)V",
    "onMomentPublishFailed(Ljava/lang/String;)V",
    "onNewFansCountChanged(I)V",
    "onRelationError(ILjava/lang/String;)V",
    "onUnreadMessageCountChanged(I)V",
):
    s = replace_method(s, sig, "    .locals 1\n\n    # RMMOD: SDK剥离——原回调随TapTap/悬浮菜单移除，空实现\n\n    return-void\n")

# 8. onAdShow(II) 直发奖励（保留协议 javascript:TK.TatuAdReward(1,type,itemId)）
ad_body = """    .locals 5

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    if-eqz v0, :cond_0

    :try_start_0
    const-string v1, "javascript:TK.TatuAdReward(1,%d,%d)"

    const/4 v2, 0x2

    new-array v2, v2, [Ljava/lang/Object;

    const/4 v3, 0x0

    invoke-static {p1}, Ljava/lang/Integer;->valueOf(I)Ljava/lang/Integer;

    move-result-object v4

    aput-object v4, v2, v3

    const/4 v3, 0x1

    invoke-static {p2}, Ljava/lang/Integer;->valueOf(I)Ljava/lang/Integer;

    move-result-object v4

    aput-object v4, v2, v3

    invoke-static {v1, v2}, Ljava/lang/String;->format(Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/String;

    move-result-object v1

    const/4 v2, 0x0

    invoke-virtual {v0, v1, v2}, Lcom/tencent/smtt/sdk/WebView;->evaluateJavascript(Ljava/lang/String;Lcom/tencent/smtt/sdk/ValueCallback;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception v1

    const-string v2, "-TK-"

    const-string v3, "reward-js-fail"

    invoke-static {v2, v3, v1}, La0/l;->b(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    :cond_0
    :goto_0
    return-void
"""
s = replace_method(s, "onAdShow(II)V", ad_body)

# 9. onActivityResult：原仅处理悬浮窗权限回调(走 II)+U()——随 ll 移除，只留 super
ar_body = """    .locals 0

    # RMMOD: SDK剥离——原仅处理 TapTap 悬浮窗权限回调，已随 ll/l 移除
    invoke-super {p0, p1, p2, p3}, Landroidx/fragment/app/FragmentActivity;->onActivityResult(IILandroid/content/Intent;)V

    return-void
"""
s = replace_method(s, "onActivityResult(IILandroid/content/Intent;)V", ar_body)

# 10. onDestroy 重写：去 l/ll/tatuAd 清理，保留 WebView/MOD/本地服务/Handler 清理
od_body = """    .locals 3

    # RMMOD: SDK剥离——移除 悬浮菜单(l)/TapTap管理器(ll)/tatuAd 清理，保留 WebView/MOD/本地服务/Handler 清理
    invoke-super {p0}, Landroidx/appcompat/app/AppCompatActivity;->onDestroy()V

    invoke-static {}, Lcom/rmmod/ModFloatingWindow;->hide()V

    :try_start_0
    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->a0()V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->y:Landroid/os/Handler;

    if-eqz v0, :cond_0

    iget-object v1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->z:Ljava/lang/Runnable;

    invoke-virtual {v0, v1}, Landroid/os/Handler;->removeCallbacks(Ljava/lang/Runnable;)V

    const/4 v1, 0x0

    iput-object v1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->y:Landroid/os/Handler;

    :cond_0
    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    if-eqz v0, :cond_1

    invoke-virtual {v0}, Lcom/hjgzs/rpgplugin/X5WebView;->cleanup()V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    invoke-virtual {v0}, Lcom/tencent/smtt/sdk/WebView;->onPause()V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    invoke-virtual {v0}, Lcom/tencent/smtt/sdk/WebView;->destroy()V

    :cond_1
    const/4 v0, 0x0

    iput-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    iput-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->r:Lcom/hjgzs/rpgplugin/I;

    iput-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->q:Lce/u1;

    iput-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->lI:Lce/ac;

    iput-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->I:Landroid/app/AlertDialog;
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception v0

    const-string v1, "-TK-"

    const-string v2, "onDestroy exception"

    invoke-static {v1, v2, v0}, La0/l;->b(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    :goto_0
    return-void
"""
s = replace_method(s, "onDestroy()V", od_body)

wr(OP, s)

# ----------------------------------------------------- MainActivity$o.run()
MOP = DEC + "/" + RPG + "/MainActivity$o.smali"
MOOP = PATCH + "/" + RPG + "/MainActivity$o.smali"
so = rd(MOP)
# run() 原本轮询 ll->n()（登录态轮询），随 ll 移除 => 空实现
so = replace_method(so, "run()V", "    .locals 0\n\n    # RMMOD: SDK剥离——原为 TapTap 登录态轮询，已随 ll 移除\n\n    return-void\n")
wr(MOOP, so)

# ---------------------------------------------------------------- I.smali
IP = DEC + "/" + RPG + "/I.smali"
IOP = PATCH + "/" + RPG + "/I.smali"
si = rd(IP)

# 删 ll 字段与 o(Lll;)V 设值方法
si = drop_line(si, ".field public i:Lcom/hjgzs/rpgplugin/ll;")
si = replace_method(si, "o(Lcom/hjgzs/rpgplugin/ll;)V", "", delete=True)

# I.O(String)：检测游戏存档文件并上报 TapTap 云端上传的桥接器（void，仅内部调用，
# 非 @JavascriptInterface；openWeb/onOpenDebug 分发仍在，只去掉 ll 上报）。
# 策略：强制跳过整个存档上传块；再把块内两条 ll 指令中和成注释（否则 verifier 会解析悬空字段/类型）。
si = si.replace(
    "    iget-object v1, p0, Lcom/hjgzs/rpgplugin/I;->i:Lcom/hjgzs/rpgplugin/ll;\n\n    if-nez v1, :cond_0\n\n    goto/16 :goto_1\n",
    "    goto :goto_1\n",
)
si = si.replace(
    "    iget-object v3, p0, Lcom/hjgzs/rpgplugin/I;->i:Lcom/hjgzs/rpgplugin/ll;\n\n    invoke-virtual {v3, v1, v2}, Lcom/hjgzs/rpgplugin/ll;->r0(ILjava/lang/String;)V\n",
    "    # RMMOD: 云端存档上传已随 ll 移除（本地存档走游戏自身 StorageMrg，不受影响）\n",
)

tap_methods = [
    ("canTapTapReview()Z", "Z"),
    ("deleteCloudSave(Ljava/lang/String;)Ljava/lang/String;", "Ljava/lang/String;"),
    ("downloadCloudSave(Ljava/lang/String;Ljava/lang/String;I)Ljava/lang/String;", "Ljava/lang/String;"),
    ("getCloudSaveList()Ljava/lang/String;", "Ljava/lang/String;"),
    ("getLocalSaveInfo(I)Ljava/lang/String;", "Ljava/lang/String;"),
    ("getTapTapNewFansCount()I", "I"),
    ("getTapTapReviewStatus()Ljava/lang/String;", "Ljava/lang/String;"),
    ("getTapTapUnreadMessageCount()I", "I"),
    ("incrementAchievement(Ljava/lang/String;I)Ljava/lang/String;", "Ljava/lang/String;"),
    ("isLocalSaveExists(I)Z", "Z"),
    ("openCloudSaveUI()Ljava/lang/String;", "Ljava/lang/String;"),
    ("openTapTapMessenger()V", "V"),
    ("openTapTapReview()V", "V"),
    ("setAchievementToastEnabled(Z)Ljava/lang/String;", "Ljava/lang/String;"),
    ("shareScreenshotToTapTap(Ljava/lang/String;Ljava/lang/String;)V", "V"),
    ("shareToTapTap(Ljava/lang/String;Ljava/lang/String;)V", "V"),
    ("showAchievements()Ljava/lang/String;", "Ljava/lang/String;"),
    ("triggerGameAchievement(Ljava/lang/String;I)Ljava/lang/String;", "Ljava/lang/String;"),
    ("unlockAchievement(Ljava/lang/String;)Ljava/lang/String;", "Ljava/lang/String;"),
    ("unlockAchievements(Ljava/lang/String;)Ljava/lang/String;", "Ljava/lang/String;"),
    ("uploadCloudSave(ILjava/lang/String;)Ljava/lang/String;", "Ljava/lang/String;"),
]
# 逐个用 parse_method 定位原方法文本再重拼（保留 @JavascriptInterface / @Throws 注解）
for sig, ret in tap_methods:
    esc = re.escape(sig)
    pat = re.compile(r"\.method [^\n]*" + esc + r"[^\n]*\n.*?\.end method", re.S)
    ms = list(pat.finditer(si))
    assert len(ms) == 1, (sig, len(ms))
    m = ms[0]
    new_method = stub_method(m.group(0), ret)
    si = si[: m.start()] + new_method + si[m.end():]

wr(IOP, si)

# ---------------------------------------------------- 自检：KEEP 侧零引用
for path, names in [
    (OP, ["rpgplugin/ll", "rpgplugin/l;", "rpgplugin/l$", "rpgplugin/o;", "rpgplugin/o$", "MainActivity$l;",
          "MainActivity$l->", "Lce/f1", "anythink", "taptap", "tapsdk", "CloudSaveDialogFragment",
          "CloudSaveAdapter", "cd/a", "hjgzs/privacy"]),
    (MOOP, ["rpgplugin/ll", "->t("]),
    (IOP, ["rpgplugin/ll"]),
]:
    txt = rd(path)
    for n in names:
        assert n not in txt, (path, n)

print("MainActivity.smali a2 surgery OK")
print("MainActivity$o.smali OK")
print("I.smali OK")
print("zero-ref self-check PASSED")
