.class public Lcom/hjgzs/rpgplugin/MainActivity;
.super Landroidx/appcompat/app/AppCompatActivity;
.source "SourceFile"

# interfaces
.implements Lcom/hjgzs/rpgplugin/ll$c;
.implements Lcom/hjgzs/rpgplugin/I$o;
.implements Lcom/hjgzs/rpgplugin/l$II;


# instance fields
.field public I:Landroid/app/AlertDialog;

.field public II:Lcom/hjgzs/rpgplugin/ll;

.field public Il:Lcom/hjgzs/rpgplugin/l;

.field public O:Lcom/hjgzs/rpgplugin/X5WebView;

.field public lI:Lce/ac;

.field public q:Lce/u1;

.field public r:Lcom/hjgzs/rpgplugin/I;

.field public s:Z

.field public t:Z

.field public tatuAd:Lce/f1;

.field public u:I

.field public v:Z

.field public w:I

.field public x:I

.field public y:Landroid/os/Handler;

.field public z:Ljava/lang/Runnable;

# MOD补丁：showGameView 只执行一次的标志
.field public static __modVShown:Z


# direct methods
.method public constructor <init>()V
    .locals 1

    invoke-direct {p0}, Landroidx/appcompat/app/AppCompatActivity;-><init>()V

    const/4 v0, 0x0

    iput-boolean v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->s:Z

    iput-boolean v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->t:Z

    iput v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->u:I

    iput-boolean v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->v:Z

    iput v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->w:I

    iput v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->x:I

    new-instance v0, Landroid/os/Handler;

    invoke-direct {v0}, Landroid/os/Handler;-><init>()V

    iput-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->y:Landroid/os/Handler;

    new-instance v0, Lcom/hjgzs/rpgplugin/MainActivity$o;

    invoke-direct {v0, p0}, Lcom/hjgzs/rpgplugin/MainActivity$o;-><init>(Lcom/hjgzs/rpgplugin/MainActivity;)V

    iput-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->z:Ljava/lang/Runnable;

    return-void
.end method

.method private synthetic A()V
    .locals 2

    iget-boolean v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->v:Z

    if-nez v0, :cond_0

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    if-eqz v0, :cond_0

    invoke-virtual {v0}, Landroid/view/View;->getWidth()I

    move-result v0

    if-lez v0, :cond_0

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    invoke-virtual {v0}, Landroid/view/View;->getHeight()I

    move-result v0

    if-lez v0, :cond_0

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    invoke-virtual {v0}, Landroid/view/View;->getWidth()I

    move-result v0

    iput v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->w:I

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    invoke-virtual {v0}, Landroid/view/View;->getHeight()I

    move-result v0

    iput v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->x:I

    const/4 v0, 0x1

    iput-boolean v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->v:Z

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "WebView\u5c3a\u5bf8\u5df2\u9501\u5b9a: "

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    iget v1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->w:I

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string v1, "x"

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    iget v1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->x:I

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    const-string v1, "-TK-"

    invoke-static {v1, v0}, La0/l;->Il(Ljava/lang/String;Ljava/lang/String;)V

    :cond_0
    return-void
.end method

.method private synthetic B(Landroid/content/DialogInterface;I)V
    .locals 0

    invoke-interface {p1}, Landroid/content/DialogInterface;->dismiss()V

    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->L()V

    return-void
.end method

.method public static synthetic C(Landroid/content/DialogInterface;I)V
    .locals 0

    invoke-interface {p0}, Landroid/content/DialogInterface;->dismiss()V

    return-void
.end method

.method private synthetic D(Landroid/content/DialogInterface;I)V
    .locals 0

    invoke-interface {p1}, Landroid/content/DialogInterface;->dismiss()V

    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->L()V

    return-void
.end method

.method public static synthetic E(Landroid/content/DialogInterface;I)V
    .locals 0

    invoke-interface {p0}, Landroid/content/DialogInterface;->dismiss()V

    return-void
.end method

.method private synthetic F(Landroid/content/DialogInterface;I)V
    .locals 0

    invoke-interface {p1}, Landroid/content/DialogInterface;->dismiss()V

    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->L()V

    return-void
.end method

.method public static synthetic G(Landroid/content/DialogInterface;I)V
    .locals 0

    invoke-interface {p0}, Landroid/content/DialogInterface;->dismiss()V

    return-void
.end method

.method public static synthetic II(Ljava/lang/String;)V
    .locals 0

    invoke-static {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->cb(Ljava/lang/String;)V

    return-void
.end method

.method public static synthetic Il(Lcom/hjgzs/rpgplugin/MainActivity;Landroid/content/DialogInterface;I)V
    .locals 0

    invoke-direct {p0, p1, p2}, Lcom/hjgzs/rpgplugin/MainActivity;->B(Landroid/content/DialogInterface;I)V

    return-void
.end method

.method public static synthetic a(Lcom/hjgzs/rpgplugin/MainActivity;)V
    .locals 0

    invoke-direct {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->cd()V

    return-void
.end method

.method public static synthetic b(Lcom/hjgzs/rpgplugin/MainActivity;)V
    .locals 0

    invoke-direct {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->cc()V

    return-void
.end method

.method private synthetic ba()V
    .locals 4

    const-string v0, "-TK-"

    invoke-virtual {p0}, Landroid/app/Activity;->isFinishing()Z

    move-result v1

    if-nez v1, :cond_0

    invoke-virtual {p0}, Landroid/app/Activity;->isDestroyed()Z

    move-result v1

    if-nez v1, :cond_0

    :try_start_0
    new-instance v1, Lce/f1;

    invoke-direct {v1, p0}, Lce/f1;-><init>(Lcom/hjgzs/rpgplugin/MainActivity;)V

    iput-object v1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->tatuAd:Lce/f1;

    const-string v2, "b6731b1ac11955"

    filled-new-array {v2}, [Ljava/lang/String;

    move-result-object v2

    invoke-static {p0, v2, v1}, Lcom/anythink/rewardvideo/api/ATRewardVideoAutoAd;->init(Landroid/content/Context;[Ljava/lang/String;Lcom/anythink/rewardvideo/api/ATRewardVideoAutoLoadListener;)V

    const-string v1, "\u5e7f\u544a\u5b9e\u4f8b\u521d\u59cb\u5316\u5b8c\u6210"

    invoke-static {v0, v1}, La0/l;->Il(Ljava/lang/String;Ljava/lang/String;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception v1

    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    const-string v3, "\u5e7f\u544a\u5b9e\u4f8b\u521d\u59cb\u5316\u5931\u8d25: "

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v3

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-static {v0, v2, v1}, La0/l;->ll(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    :cond_0
    :goto_0
    return-void
.end method

.method private synthetic bb()V
    .locals 4

    const-string v0, "-TK-"

    :try_start_0
    const-string v1, "\u5f00\u59cb\u5ef6\u8fdf\u540e\u53f0\u521d\u59cb\u5316\u5e7f\u544aSDK..."

    invoke-static {v0, v1}, La0/l;->Il(Ljava/lang/String;Ljava/lang/String;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_1

    :try_start_1
    const-string v1, "a6731b1a2acc62"

    const-string v2, "a3414b193331379a14ee430815a75e0de"

    invoke-static {p0, v1, v2}, Lcom/anythink/core/api/ATSDK;->init(Landroid/content/Context;Ljava/lang/String;Ljava/lang/String;)V

    invoke-static {}, Lcom/anythink/core/api/ATSDK;->start()V

    const-string v1, "ATSDK\u521d\u59cb\u5316\u5b8c\u6210"

    invoke-static {v0, v1}, La0/l;->Il(Ljava/lang/String;Ljava/lang/String;)V
    :try_end_1
    .catch Ljava/lang/UnsupportedOperationException; {:try_start_1 .. :try_end_1} :catch_0
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_1

    goto :goto_0

    :catch_0
    move-exception v1

    :try_start_2
    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    const-string v3, "\u5e7f\u544aSDK\u521d\u59cb\u5316\u5931\u8d25,\u53ef\u80fd\u4e0d\u652f\u6301\u5f53\u524d\u7cfb\u7edf\u7248\u672c: "

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v2, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    invoke-static {v0, v1}, La0/l;->a(Ljava/lang/String;Ljava/lang/String;)V

    :goto_0
    new-instance v1, Lce/bf;

    invoke-direct {v1, p0}, Lce/bf;-><init>(Lcom/hjgzs/rpgplugin/MainActivity;)V

    invoke-virtual {p0, v1}, Landroid/app/Activity;->runOnUiThread(Ljava/lang/Runnable;)V

    const-string v1, "\u540e\u53f0\u5e7f\u544aSDK\u521d\u59cb\u5316\u5b8c\u6210"

    invoke-static {v0, v1}, La0/l;->Il(Ljava/lang/String;Ljava/lang/String;)V
    :try_end_2
    .catch Ljava/lang/Exception; {:try_start_2 .. :try_end_2} :catch_1

    goto :goto_1

    :catch_1
    move-exception v1

    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    const-string v3, "\u540e\u53f0\u5e7f\u544aSDK\u521d\u59cb\u5316\u5f02\u5e38: "

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v3

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-static {v0, v2, v1}, La0/l;->ll(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    :goto_1
    return-void
.end method

.method private synthetic bc()V
    .locals 3

    new-instance v0, Ljava/lang/Thread;

    new-instance v1, Lce/ae;

    invoke-direct {v1, p0}, Lce/ae;-><init>(Lcom/hjgzs/rpgplugin/MainActivity;)V

    const-string v2, "Ad-Init-Thread"

    invoke-direct {v0, v1, v2}, Ljava/lang/Thread;-><init>(Ljava/lang/Runnable;Ljava/lang/String;)V

    invoke-virtual {v0}, Ljava/lang/Thread;->start()V

    return-void
.end method

.method private synthetic bd(ILjava/lang/String;)V
    .locals 1

    sparse-switch p1, :sswitch_data_0

    :try_start_0
    new-instance p1, Ljava/lang/StringBuilder;

    goto :goto_0

    :sswitch_0
    const-string p1, "\u7f51\u7edc\u5f02\u5e38\uff0c\u8bf7\u68c0\u67e5\u7f51\u7edc\u8fde\u63a5"

    goto :goto_1

    :sswitch_1
    const-string p1, "\u767b\u5f55\u72b6\u6001\u5931\u6548\uff0c\u8bf7\u91cd\u65b0\u767b\u5f55"

    goto :goto_1

    :sswitch_2
    const-string p1, "\u9700\u8981\u767b\u5f55\u624d\u80fd\u4f7f\u7528\u6210\u5c31\u529f\u80fd"

    goto :goto_1

    :sswitch_3
    const-string p1, "\u5f53\u524d\u533a\u57df\u4e0d\u652f\u6301\u6210\u5c31\u529f\u80fd"

    goto :goto_1

    :catch_0
    move-exception p1

    goto :goto_2

    :goto_0
    invoke-direct {p1}, Ljava/lang/StringBuilder;-><init>()V

    const-string v0, "\u6210\u5c31\u64cd\u4f5c\u5931\u8d25\uff1a"

    invoke-virtual {p1, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p1, p2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    :goto_1
    invoke-virtual {p0, p1}, Lcom/hjgzs/rpgplugin/MainActivity;->showToast(Ljava/lang/String;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_3

    :goto_2
    new-instance p2, Ljava/lang/StringBuilder;

    invoke-direct {p2}, Ljava/lang/StringBuilder;-><init>()V

    const-string v0, "\u663e\u793a\u6210\u5c31\u9519\u8bef\u63d0\u793a\u5931\u8d25: "

    invoke-virtual {p2, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p1}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {p2, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p2

    const-string v0, "-TK-"

    invoke-static {v0, p2, p1}, La0/l;->ll(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    :goto_3
    return-void

    :sswitch_data_0
    .sparse-switch
        0x13881 -> :sswitch_3
        0x13882 -> :sswitch_2
        0x1388a -> :sswitch_1
        0x1389e -> :sswitch_0
    .end sparse-switch
.end method

.method private synthetic be(Ljava/lang/String;)V
    .locals 2

    :try_start_0
    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "\ud83c\udfc6 \u6210\u5c31\u8fbe\u6210\uff1a"

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-virtual {p0, p1}, Lcom/hjgzs/rpgplugin/MainActivity;->showToast(Ljava/lang/String;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception p1

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "\u663e\u793a\u6210\u5c31\u89e3\u9501\u63d0\u793a\u5931\u8d25: "

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p1}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    const-string v1, "-TK-"

    invoke-static {v1, v0, p1}, La0/l;->ll(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    :goto_0
    return-void
.end method

.method public static synthetic bf(Ljava/lang/String;)V
    .locals 2

    if-eqz p0, :cond_0

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "JavaScript \u8fd4\u56de\u7684\u503c: "

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, p0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p0

    const-string v0, "-TK-"

    invoke-static {v0, p0}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    :cond_0
    return-void
.end method

.method public static synthetic c(Lcom/hjgzs/rpgplugin/MainActivity;Landroid/content/DialogInterface;I)V
    .locals 0

    invoke-direct {p0, p1, p2}, Lcom/hjgzs/rpgplugin/MainActivity;->D(Landroid/content/DialogInterface;I)V

    return-void
.end method

.method private synthetic ca()V
    .locals 3

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    new-instance v1, Lce/ce;

    invoke-direct {v1}, Lce/ce;-><init>()V

    const-string v2, "javascript:TK.TatuAdReward(0,-1)"

    invoke-virtual {v0, v2, v1}, Lcom/tencent/smtt/sdk/WebView;->evaluateJavascript(Ljava/lang/String;Lcom/tencent/smtt/sdk/ValueCallback;)V

    return-void
.end method

.method public static synthetic cb(Ljava/lang/String;)V
    .locals 2

    if-eqz p0, :cond_0

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "JavaScript \u8fd4\u56de\u7684\u503c: "

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, p0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p0

    const-string v0, "-TK-"

    invoke-static {v0, p0}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    :cond_0
    return-void
.end method

.method private synthetic cc()V
    .locals 3

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    new-instance v1, Lce/af;

    invoke-direct {v1}, Lce/af;-><init>()V

    const-string v2, "javascript:TK.TatuAdReward(0,-1)"

    invoke-virtual {v0, v2, v1}, Lcom/tencent/smtt/sdk/WebView;->evaluateJavascript(Ljava/lang/String;Lcom/tencent/smtt/sdk/ValueCallback;)V

    return-void
.end method

.method private synthetic cd()V
    .locals 3

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    if-eqz v0, :cond_0

    invoke-virtual {p0}, Landroid/app/Activity;->isFinishing()Z

    move-result v0

    if-nez v0, :cond_0

    invoke-virtual {p0}, Landroid/app/Activity;->isDestroyed()Z

    move-result v0

    if-nez v0, :cond_0

    :try_start_0
    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    invoke-virtual {v0}, Lcom/tencent/smtt/sdk/WebView;->onResume()V

    const/4 v0, 0x0

    iput-boolean v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->s:Z
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception v0

    new-instance v1, Ljava/lang/StringBuilder;

    invoke-direct {v1}, Ljava/lang/StringBuilder;-><init>()V

    const-string v2, "WebView onResume\u5931\u8d25: "

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    const-string v2, "-TK-"

    invoke-static {v2, v1, v0}, La0/l;->ll(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    :cond_0
    :goto_0
    return-void
.end method

.method private synthetic ce(Landroid/content/DialogInterface;I)V
    .locals 1

    invoke-interface {p1}, Landroid/content/DialogInterface;->dismiss()V

    new-instance p1, Landroid/content/Intent;

    const-string p2, "android.settings.action.MANAGE_OVERLAY_PERMISSION"

    invoke-direct {p1, p2}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    new-instance p2, Ljava/lang/StringBuilder;

    invoke-direct {p2}, Ljava/lang/StringBuilder;-><init>()V

    const-string v0, "package:"

    invoke-virtual {p2, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p0}, Landroid/content/Context;->getPackageName()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {p2, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p2

    invoke-static {p2}, Landroid/net/Uri;->parse(Ljava/lang/String;)Landroid/net/Uri;

    move-result-object p2

    invoke-virtual {p1, p2}, Landroid/content/Intent;->setData(Landroid/net/Uri;)Landroid/content/Intent;

    const/16 p2, 0x1f41

    invoke-virtual {p0, p1, p2}, Landroidx/activity/ComponentActivity;->startActivityForResult(Landroid/content/Intent;I)V

    const-string p1, "\u8bf7\u5728\u8bbe\u7f6e\u4e2d\u5141\u8bb8\u60ac\u6d6e\u7a97\u6743\u9650"

    const/4 p2, 0x1

    invoke-static {p0, p1, p2}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;

    move-result-object p1

    invoke-virtual {p1}, Landroid/widget/Toast;->show()V

    return-void
.end method

.method private synthetic cf(Landroid/content/DialogInterface;I)V
    .locals 0

    invoke-interface {p1}, Landroid/content/DialogInterface;->dismiss()V

    invoke-static {p0}, La0/o;->ll(Landroid/content/Context;)La0/o;

    move-result-object p1

    invoke-virtual {p1}, La0/o;->g()V

    return-void
.end method

.method public static synthetic d(Landroid/content/DialogInterface;I)V
    .locals 0

    invoke-static {p0, p1}, Lcom/hjgzs/rpgplugin/MainActivity;->G(Landroid/content/DialogInterface;I)V

    return-void
.end method

.method public static synthetic e(Lcom/hjgzs/rpgplugin/MainActivity;ILjava/lang/String;)V
    .locals 0

    invoke-direct {p0, p1, p2}, Lcom/hjgzs/rpgplugin/MainActivity;->bd(ILjava/lang/String;)V

    return-void
.end method

.method public static synthetic f(Landroid/content/DialogInterface;I)V
    .locals 0

    invoke-static {p0, p1}, Lcom/hjgzs/rpgplugin/MainActivity;->E(Landroid/content/DialogInterface;I)V

    return-void
.end method

.method public static synthetic g(Lcom/hjgzs/rpgplugin/MainActivity;)V
    .locals 0

    invoke-direct {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->bc()V

    return-void
.end method

.method public static getRandomString(I)Ljava/lang/String;
    .locals 5

    new-instance v0, Ljava/util/Random;

    invoke-direct {v0}, Ljava/util/Random;-><init>()V

    new-instance v1, Ljava/lang/StringBuilder;

    invoke-direct {v1}, Ljava/lang/StringBuilder;-><init>()V

    const/4 v2, 0x0

    :goto_0
    if-ge v2, p0, :cond_0

    const/16 v3, 0x3e

    invoke-virtual {v0, v3}, Ljava/util/Random;->nextInt(I)I

    move-result v3

    const-string v4, "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM0123456789"

    invoke-virtual {v4, v3}, Ljava/lang/String;->charAt(I)C

    move-result v3

    invoke-virtual {v1, v3}, Ljava/lang/StringBuilder;->append(C)Ljava/lang/StringBuilder;

    add-int/lit8 v2, v2, 0x1

    goto :goto_0

    :cond_0
    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p0

    return-object p0
.end method

.method public static synthetic h(Lcom/hjgzs/rpgplugin/MainActivity;)V
    .locals 0

    invoke-direct {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->ba()V

    return-void
.end method

.method public static synthetic j(Ljava/lang/String;)V
    .locals 0

    invoke-static {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->bf(Ljava/lang/String;)V

    return-void
.end method

.method public static synthetic k(Lcom/hjgzs/rpgplugin/MainActivity;)V
    .locals 0

    invoke-direct {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->A()V

    return-void
.end method

.method public static synthetic lI(Lcom/hjgzs/rpgplugin/MainActivity;Landroid/content/DialogInterface;I)V
    .locals 0

    invoke-direct {p0, p1, p2}, Lcom/hjgzs/rpgplugin/MainActivity;->F(Landroid/content/DialogInterface;I)V

    return-void
.end method

.method public static synthetic m(Lcom/hjgzs/rpgplugin/MainActivity;Ljava/lang/String;)V
    .locals 0

    invoke-direct {p0, p1}, Lcom/hjgzs/rpgplugin/MainActivity;->be(Ljava/lang/String;)V

    return-void
.end method

.method public static synthetic n(Landroid/content/DialogInterface;I)V
    .locals 0

    invoke-static {p0, p1}, Lcom/hjgzs/rpgplugin/MainActivity;->C(Landroid/content/DialogInterface;I)V

    return-void
.end method

.method public static synthetic p(Lcom/hjgzs/rpgplugin/MainActivity;Landroid/content/DialogInterface;I)V
    .locals 0

    invoke-direct {p0, p1, p2}, Lcom/hjgzs/rpgplugin/MainActivity;->ce(Landroid/content/DialogInterface;I)V

    return-void
.end method

.method public static synthetic q(Lcom/hjgzs/rpgplugin/MainActivity;)V
    .locals 0

    invoke-direct {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->bb()V

    return-void
.end method

.method public static synthetic r(Lcom/hjgzs/rpgplugin/MainActivity;Landroid/content/DialogInterface;I)V
    .locals 0

    invoke-direct {p0, p1, p2}, Lcom/hjgzs/rpgplugin/MainActivity;->cf(Landroid/content/DialogInterface;I)V

    return-void
.end method

.method public static synthetic s(Lcom/hjgzs/rpgplugin/MainActivity;)V
    .locals 0

    invoke-direct {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->ca()V

    return-void
.end method

.method public static synthetic t(Lcom/hjgzs/rpgplugin/MainActivity;)Lcom/hjgzs/rpgplugin/ll;
    .locals 0

    iget-object p0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->II:Lcom/hjgzs/rpgplugin/ll;

    return-object p0
.end method

.method public static synthetic u(Lcom/hjgzs/rpgplugin/MainActivity;)Landroid/os/Handler;
    .locals 0

    iget-object p0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->y:Landroid/os/Handler;

    return-object p0
.end method

.method public static synthetic v(Lcom/hjgzs/rpgplugin/MainActivity;)V
    .locals 0

    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->af()V

    return-void
.end method

.method public static synthetic w(Lcom/hjgzs/rpgplugin/MainActivity;)Landroid/app/AlertDialog;
    .locals 0

    iget-object p0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->I:Landroid/app/AlertDialog;

    return-object p0
.end method


# virtual methods
.method public final H()V
    .locals 4

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->lI:Lce/ac;

    const-string v1, "-TK-"

    if-eqz v0, :cond_0

    invoke-virtual {v0}, Lce/ac;->cd()Z

    move-result v0

    if-eqz v0, :cond_0

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    iget-object v2, p0, Lcom/hjgzs/rpgplugin/MainActivity;->lI:Lce/ac;

    invoke-virtual {v2}, Lce/ac;->cc()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v0, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string v2, "/index.html"

    invoke-virtual {v0, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    const-string v3, "\u4f7f\u7528\u672c\u5730\u670d\u52a1\u5668\u52a0\u8f7d\u6e38\u620f: "

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-static {v1, v2}, La0/l;->Il(Ljava/lang/String;Ljava/lang/String;)V

    iget-object v1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    invoke-virtual {v1, v0}, Lcom/tencent/smtt/sdk/WebView;->loadUrl(Ljava/lang/String;)V

    goto :goto_0

    :cond_0
    const-string v0, "\u672c\u5730\u670d\u52a1\u5668\u672a\u8fd0\u884c\uff0c\u4f7f\u7528file\u534f\u8bae"

    invoke-static {v1, v0}, La0/l;->Il(Ljava/lang/String;Ljava/lang/String;)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    const-string v1, "file:///android_asset/www/index.html"

    invoke-virtual {v0, v1}, Lcom/tencent/smtt/sdk/WebView;->loadUrl(Ljava/lang/String;)V

    :goto_0
    return-void
.end method

.method public final J()V
    .locals 3

    :try_start_0
    const-string v0, "msaoaidsec"

    invoke-static {v0}, Ljava/lang/System;->loadLibrary(Ljava/lang/String;)V
    :try_end_0
    .catchall {:try_start_0 .. :try_end_0} :catchall_0

    goto :goto_0

    :catchall_0
    move-exception v0

    const-string v1, "-TK-"

    const-string v2, "\u52a0\u8f7d\u672c\u5730\u5e93\u5931\u8d25"

    invoke-static {v1, v2, v0}, La0/l;->b(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    :goto_0
    return-void
.end method

.method public final K()V
    .locals 4

    const-string v0, "os.arch"

    invoke-static {v0}, Ljava/lang/System;->getProperty(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    const-string v1, "-TK-"

    if-eqz v0, :cond_0

    const-string v2, "64"

    invoke-virtual {v0, v2}, Ljava/lang/String;->contains(Ljava/lang/CharSequence;)Z

    move-result v0

    if-eqz v0, :cond_0

    const-string v0, "\u5f53\u524d\u662f 64 \u4f4d\u7cfb\u7edf"

    goto :goto_0

    :cond_0
    const-string v0, "\u5f53\u524d\u662f 32 \u4f4d\u7cfb\u7edf"

    :goto_0
    invoke-static {v1, v0}, La0/l;->i(Ljava/lang/String;Ljava/lang/String;)V

    sget-object v0, Landroid/os/Build;->SUPPORTED_ABIS:[Ljava/lang/String;

    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    const-string v3, "\u5f53\u524d\u8bbe\u5907\u652f\u6301\u7684 ABI: "

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-static {v0}, Ljava/util/Arrays;->toString([Ljava/lang/Object;)Ljava/lang/String;

    move-result-object v0

    invoke-virtual {v2, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-static {v1, v0}, La0/l;->i(Ljava/lang/String;Ljava/lang/String;)V

    return-void
.end method

.method public final L()V
    .locals 3

    :try_start_0
    new-instance v0, Landroid/content/Intent;

    const-string v1, "android.settings.APPLICATION_DETAILS_SETTINGS"

    invoke-direct {v0, v1}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    new-instance v1, Ljava/lang/StringBuilder;

    invoke-direct {v1}, Ljava/lang/StringBuilder;-><init>()V

    const-string v2, "package:"

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p0}, Landroid/content/Context;->getPackageName()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    invoke-static {v1}, Landroid/net/Uri;->parse(Ljava/lang/String;)Landroid/net/Uri;

    move-result-object v1

    invoke-virtual {v0, v1}, Landroid/content/Intent;->setData(Landroid/net/Uri;)Landroid/content/Intent;

    invoke-virtual {p0, v0}, Landroid/content/Context;->startActivity(Landroid/content/Intent;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception v0

    new-instance v1, Ljava/lang/StringBuilder;

    invoke-direct {v1}, Ljava/lang/StringBuilder;-><init>()V

    const-string v2, "\u6253\u5f00\u5e94\u7528\u8bbe\u7f6e\u5931\u8d25: "

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    const-string v2, "-TK-"

    invoke-static {v2, v1, v0}, La0/l;->ll(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    const-string v0, "\u65e0\u6cd5\u6253\u5f00\u5e94\u7528\u8bbe\u7f6e\uff0c\u8bf7\u624b\u52a8\u524d\u5f80\u8bbe\u7f6e\u9875\u9762"

    const/4 v1, 0x1

    invoke-static {p0, v0, v1}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;

    move-result-object v0

    invoke-virtual {v0}, Landroid/widget/Toast;->show()V

    :goto_0
    return-void
.end method

.method public final M()V
    .locals 4

    const-string v0, "PermissionPrefs"

    const/4 v1, 0x0

    invoke-virtual {p0, v0, v1}, Landroid/content/Context;->getSharedPreferences(Ljava/lang/String;I)Landroid/content/SharedPreferences;

    move-result-object v0

    invoke-interface {v0}, Landroid/content/SharedPreferences;->edit()Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    const-string v1, "lastDeniedTime"

    invoke-static {}, Ljava/lang/System;->currentTimeMillis()J

    move-result-wide v2

    invoke-interface {v0, v1, v2, v3}, Landroid/content/SharedPreferences$Editor;->putLong(Ljava/lang/String;J)Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    invoke-interface {v0}, Landroid/content/SharedPreferences$Editor;->apply()V

    return-void
.end method

.method public final N()V
    .locals 3

    new-instance v0, Landroid/app/AlertDialog$Builder;

    invoke-direct {v0, p0}, Landroid/app/AlertDialog$Builder;-><init>(Landroid/content/Context;)V

    const-string v1, "\u5f00\u542f\u60ac\u6d6e\u6309\u94ae"

    invoke-virtual {v0, v1}, Landroid/app/AlertDialog$Builder;->setTitle(Ljava/lang/CharSequence;)Landroid/app/AlertDialog$Builder;

    const-string v1, "TapTap\u60ac\u6d6e\u6309\u94ae\u53ef\u4ee5\u8ba9\u60a8\u5feb\u901f\u8bbf\u95ee\u597d\u53cb\u3001\u5206\u4eab\u3001\u8bc4\u8bba\u7b49\u529f\u80fd\u3002\n\n\u662f\u5426\u5141\u8bb8\u663e\u793a\u60ac\u6d6e\u6309\u94ae\uff1f"

    invoke-virtual {v0, v1}, Landroid/app/AlertDialog$Builder;->setMessage(Ljava/lang/CharSequence;)Landroid/app/AlertDialog$Builder;

    new-instance v1, Lce/ca;

    invoke-direct {v1, p0}, Lce/ca;-><init>(Lcom/hjgzs/rpgplugin/MainActivity;)V

    const-string v2, "\u5141\u8bb8"

    invoke-virtual {v0, v2, v1}, Landroid/app/AlertDialog$Builder;->setPositiveButton(Ljava/lang/CharSequence;Landroid/content/DialogInterface$OnClickListener;)Landroid/app/AlertDialog$Builder;

    new-instance v1, Lce/cb;

    invoke-direct {v1, p0}, Lce/cb;-><init>(Lcom/hjgzs/rpgplugin/MainActivity;)V

    const-string v2, "\u53d6\u6d88"

    invoke-virtual {v0, v2, v1}, Landroid/app/AlertDialog$Builder;->setNegativeButton(Ljava/lang/CharSequence;Landroid/content/DialogInterface$OnClickListener;)Landroid/app/AlertDialog$Builder;

    const/4 v1, 0x0

    invoke-virtual {v0, v1}, Landroid/app/AlertDialog$Builder;->setCancelable(Z)Landroid/app/AlertDialog$Builder;

    invoke-virtual {v0}, Landroid/app/AlertDialog$Builder;->show()Landroid/app/AlertDialog;

    return-void
.end method

.method public final P()V
    .locals 2

    invoke-static {}, Landroid/webkit/CookieManager;->getInstance()Landroid/webkit/CookieManager;

    move-result-object v0

    const/4 v1, 0x1

    invoke-virtual {v0, v1}, Landroid/webkit/CookieManager;->setAcceptCookie(Z)V

    invoke-virtual {v0}, Landroid/webkit/CookieManager;->acceptCookie()Z

    invoke-static {p0}, Landroid/webkit/CookieSyncManager;->createInstance(Landroid/content/Context;)Landroid/webkit/CookieSyncManager;

    return-void
.end method

.method public final Q()V
    .locals 2

    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v1, 0x1c

    if-lt v0, v1, :cond_0

    invoke-virtual {p0}, Landroid/content/Context;->getPackageName()Ljava/lang/String;

    move-result-object v0

    const-string v1, "com.hjgzs.zseb"

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-nez v0, :cond_0

    invoke-static {v1}, Lcom/tencent/smtt/sdk/WebView;->setDataDirectorySuffix(Ljava/lang/String;)V

    :cond_0
    return-void
.end method

.method public final R()V
    .locals 3

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    const/4 v1, 0x2

    const/4 v2, 0x0

    invoke-virtual {v0, v1, v2}, Landroid/view/View;->setLayerType(ILandroid/graphics/Paint;)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    const/high16 v1, 0x2000000

    invoke-virtual {v0, v1}, Lcom/tencent/smtt/sdk/WebView;->setScrollBarStyle(I)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    const/4 v1, 0x1

    invoke-virtual {v0, v1}, Landroid/view/View;->setHapticFeedbackEnabled(Z)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    invoke-virtual {v0, v1}, Landroid/view/View;->setHorizontalScrollBarEnabled(Z)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    invoke-virtual {v0, v1}, Landroid/view/View;->setVerticalScrollBarEnabled(Z)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    invoke-virtual {v0, v1}, Landroid/view/View;->setLongClickable(Z)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    const/4 v1, 0x0

    invoke-virtual {v0, v1}, Landroid/view/View;->setWillNotDraw(Z)V

    invoke-static {v1}, Lcom/tencent/smtt/sdk/WebView;->setWebContentsDebuggingEnabled(Z)V

    return-void
.end method

.method public final S()V
    .locals 2

    invoke-virtual {p0}, Landroid/app/Activity;->getWindow()Landroid/view/Window;

    move-result-object v0

    const/16 v1, 0x80

    invoke-virtual {v0, v1, v1}, Landroid/view/Window;->setFlags(II)V

    return-void
.end method

.method public final T()Z
    .locals 5

    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->ab()I

    move-result v0

    const/16 v1, 0x8c

    if-lt v0, v1, :cond_0

    const/4 v2, 0x1

    goto :goto_0

    :cond_0
    const/4 v2, 0x0

    :goto_0
    new-instance v3, Ljava/lang/StringBuilder;

    invoke-direct {v3}, Ljava/lang/StringBuilder;-><init>()V

    const-string v4, "\u7cfb\u7edfWebView\u7248\u672c: "

    invoke-virtual {v3, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v3, v0}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string v0, ", \u6700\u4f4e\u8981\u6c42\u7248\u672c: "

    invoke-virtual {v3, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v3, v1}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string v0, ", \u4f7f\u7528\u7cfb\u7edfWebView: "

    invoke-virtual {v3, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v3, v2}, Ljava/lang/StringBuilder;->append(Z)Ljava/lang/StringBuilder;

    invoke-virtual {v3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    const-string v1, "-TK-"

    invoke-static {v1, v0}, La0/l;->Il(Ljava/lang/String;Ljava/lang/String;)V

    return v2
.end method

.method public final U()V
    .locals 2

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->Il:Lcom/hjgzs/rpgplugin/l;

    if-eqz v0, :cond_0

    const-string v0, "-TK-"

    const-string v1, "\u663e\u793a\u60ac\u6d6e\u6309\u94ae"

    invoke-static {v0, v1}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->Il:Lcom/hjgzs/rpgplugin/l;

    invoke-virtual {v0}, Lcom/hjgzs/rpgplugin/l;->j0()V

    :cond_0
    return-void
.end method

.method public final V()V
    .locals 4

    const-string v0, "showGameView() \u88ab\u8c03\u7528"

    const-string v1, "-TK-"

    invoke-static {v1, v0}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    if-eqz v0, :cond_0

    invoke-virtual {p0}, Landroid/app/Activity;->isFinishing()Z

    move-result v0

    if-nez v0, :cond_0

    invoke-virtual {p0}, Landroid/app/Activity;->isDestroyed()Z

    move-result v0

    if-nez v0, :cond_0

    :try_start_0
    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    const/4 v2, 0x0

    invoke-virtual {v0, v2}, Landroid/view/View;->setAlpha(F)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    const/4 v2, 0x0

    invoke-virtual {v0, v2}, Lcom/tencent/smtt/sdk/WebView;->setVisibility(I)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    invoke-virtual {v0}, Landroid/view/View;->animate()Landroid/view/ViewPropertyAnimator;

    move-result-object v0

    const/high16 v2, 0x3f800000    # 1.0f

    invoke-virtual {v0, v2}, Landroid/view/ViewPropertyAnimator;->alpha(F)Landroid/view/ViewPropertyAnimator;

    move-result-object v0

    const-wide/16 v2, 0x12c

    invoke-virtual {v0, v2, v3}, Landroid/view/ViewPropertyAnimator;->setDuration(J)Landroid/view/ViewPropertyAnimator;

    move-result-object v0

    invoke-virtual {v0}, Landroid/view/ViewPropertyAnimator;->start()V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    new-instance v2, Lce/a0;

    invoke-direct {v2, p0}, Lce/a0;-><init>(Lcom/hjgzs/rpgplugin/MainActivity;)V

    invoke-virtual {v0, v2}, Landroid/view/View;->post(Ljava/lang/Runnable;)Z

    const-string v0, "\u9a8c\u8bc1\u901a\u8fc7\uff0c\u663e\u793a\u5df2\u52a0\u8f7d\u7684\u6e38\u620f\u754c\u9762"

    invoke-static {v1, v0}, La0/l;->Il(Ljava/lang/String;Ljava/lang/String;)V

    const-string v0, "\u5f00\u59cb\u521d\u59cb\u5316\u60ac\u6d6e\u6309\u94ae"

    invoke-static {v1, v0}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    invoke-virtual {p0}, Landroid/app/Activity;->isFinishing()Z

    move-result v0

    if-nez v0, :cond_1

    invoke-virtual {p0}, Landroid/app/Activity;->isDestroyed()Z

    move-result v0

    if-nez v0, :cond_1

    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->ae()V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception v0

    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    const-string v3, "\u663e\u793a\u6e38\u620f\u754c\u9762\u65f6\u53d1\u751f\u5f02\u5e38: "

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v3

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-static {v1, v2, v0}, La0/l;->ll(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    goto :goto_0

    :cond_0
    const-string v0, "x5WebView \u4e3anull\u6216Activity\u5df2\u9500\u6bc1\uff0c\u65e0\u6cd5\u663e\u793a\u6e38\u620f"

    invoke-static {v1, v0}, La0/l;->i(Ljava/lang/String;Ljava/lang/String;)V

    :cond_1
    :goto_0
    return-void
.end method

.method public final W(Ljava/lang/String;)V
    .locals 2

    new-instance v0, Landroid/app/AlertDialog$Builder;

    invoke-direct {v0, p0}, Landroid/app/AlertDialog$Builder;-><init>(Landroid/content/Context;)V

    const-string v1, "\u9700\u8981\u624b\u52a8\u5f00\u542f\u6743\u9650"

    invoke-virtual {v0, v1}, Landroid/app/AlertDialog$Builder;->setTitle(Ljava/lang/CharSequence;)Landroid/app/AlertDialog$Builder;

    invoke-virtual {v0, p1}, Landroid/app/AlertDialog$Builder;->setMessage(Ljava/lang/CharSequence;)Landroid/app/AlertDialog$Builder;

    new-instance p1, Lce/d0;

    invoke-direct {p1, p0}, Lce/d0;-><init>(Lcom/hjgzs/rpgplugin/MainActivity;)V

    const-string v1, "\u524d\u5f80\u8bbe\u7f6e"

    invoke-virtual {v0, v1, p1}, Landroid/app/AlertDialog$Builder;->setPositiveButton(Ljava/lang/CharSequence;Landroid/content/DialogInterface$OnClickListener;)Landroid/app/AlertDialog$Builder;

    new-instance p1, Lce/e0;

    invoke-direct {p1}, Lce/e0;-><init>()V

    const-string v1, "\u53d6\u6d88"

    invoke-virtual {v0, v1, p1}, Landroid/app/AlertDialog$Builder;->setNegativeButton(Ljava/lang/CharSequence;Landroid/content/DialogInterface$OnClickListener;)Landroid/app/AlertDialog$Builder;

    const/4 p1, 0x0

    invoke-virtual {v0, p1}, Landroid/app/AlertDialog$Builder;->setCancelable(Z)Landroid/app/AlertDialog$Builder;

    invoke-virtual {v0}, Landroid/app/AlertDialog$Builder;->show()Landroid/app/AlertDialog;

    return-void
.end method

.method public final X(Ljava/lang/String;)V
    .locals 2

    new-instance v0, Landroid/app/AlertDialog$Builder;

    invoke-direct {v0, p0}, Landroid/app/AlertDialog$Builder;-><init>(Landroid/content/Context;)V

    const-string v1, "\u6743\u9650\u7533\u8bf7\u53d7\u9650"

    invoke-virtual {v0, v1}, Landroid/app/AlertDialog$Builder;->setTitle(Ljava/lang/CharSequence;)Landroid/app/AlertDialog$Builder;

    invoke-virtual {v0, p1}, Landroid/app/AlertDialog$Builder;->setMessage(Ljava/lang/CharSequence;)Landroid/app/AlertDialog$Builder;

    new-instance p1, Lce/bb;

    invoke-direct {p1, p0}, Lce/bb;-><init>(Lcom/hjgzs/rpgplugin/MainActivity;)V

    const-string v1, "\u624b\u52a8\u5f00\u542f"

    invoke-virtual {v0, v1, p1}, Landroid/app/AlertDialog$Builder;->setPositiveButton(Ljava/lang/CharSequence;Landroid/content/DialogInterface$OnClickListener;)Landroid/app/AlertDialog$Builder;

    new-instance p1, Lce/bc;

    invoke-direct {p1}, Lce/bc;-><init>()V

    const-string v1, "\u7a0d\u540e\u518d\u8bd5"

    invoke-virtual {v0, v1, p1}, Landroid/app/AlertDialog$Builder;->setNegativeButton(Ljava/lang/CharSequence;Landroid/content/DialogInterface$OnClickListener;)Landroid/app/AlertDialog$Builder;

    const/4 p1, 0x0

    invoke-virtual {v0, p1}, Landroid/app/AlertDialog$Builder;->setCancelable(Z)Landroid/app/AlertDialog$Builder;

    invoke-virtual {v0}, Landroid/app/AlertDialog$Builder;->show()Landroid/app/AlertDialog;

    return-void
.end method

.method public final Y(Ljava/lang/String;)V
    .locals 2

    new-instance v0, Landroid/app/AlertDialog$Builder;

    invoke-direct {v0, p0}, Landroid/app/AlertDialog$Builder;-><init>(Landroid/content/Context;)V

    const-string v1, "\u6743\u9650\u88ab\u62d2\u7edd"

    invoke-virtual {v0, v1}, Landroid/app/AlertDialog$Builder;->setTitle(Ljava/lang/CharSequence;)Landroid/app/AlertDialog$Builder;

    invoke-virtual {v0, p1}, Landroid/app/AlertDialog$Builder;->setMessage(Ljava/lang/CharSequence;)Landroid/app/AlertDialog$Builder;

    new-instance p1, Lce/bd;

    invoke-direct {p1, p0}, Lce/bd;-><init>(Lcom/hjgzs/rpgplugin/MainActivity;)V

    const-string v1, "\u524d\u5f80\u8bbe\u7f6e"

    invoke-virtual {v0, v1, p1}, Landroid/app/AlertDialog$Builder;->setPositiveButton(Ljava/lang/CharSequence;Landroid/content/DialogInterface$OnClickListener;)Landroid/app/AlertDialog$Builder;

    new-instance p1, Lce/be;

    invoke-direct {p1}, Lce/be;-><init>()V

    const-string v1, "\u77e5\u9053\u4e86"

    invoke-virtual {v0, v1, p1}, Landroid/app/AlertDialog$Builder;->setNegativeButton(Ljava/lang/CharSequence;Landroid/content/DialogInterface$OnClickListener;)Landroid/app/AlertDialog$Builder;

    const/4 p1, 0x0

    invoke-virtual {v0, p1}, Landroid/app/AlertDialog$Builder;->setCancelable(Z)Landroid/app/AlertDialog$Builder;

    invoke-virtual {v0}, Landroid/app/AlertDialog$Builder;->show()Landroid/app/AlertDialog;

    return-void
.end method

.method public final Z(Landroid/os/Bundle;)V
    .locals 6

    const-string v0, "\u5f00\u59cb\u540e\u53f0\u52a0\u8f7d\u6e38\u620f\u5185\u5bb9..."

    const-string v1, "-TK-"

    invoke-static {v1, v0}, La0/l;->Il(Ljava/lang/String;Ljava/lang/String;)V

    if-eqz p1, :cond_0

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    invoke-virtual {v0, p1}, Lcom/tencent/smtt/sdk/WebView;->restoreState(Landroid/os/Bundle;)Lcom/tencent/smtt/sdk/WebBackForwardList;

    :cond_0
    new-instance p1, Ljava/lang/StringBuilder;

    invoke-direct {p1}, Ljava/lang/StringBuilder;-><init>()V

    const-string v0, "canLoadX5: "

    invoke-virtual {p1, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p0}, Landroid/content/Context;->getApplicationContext()Landroid/content/Context;

    move-result-object v0

    invoke-static {v0}, Lcom/tencent/smtt/sdk/QbSdk;->canLoadX5(Landroid/content/Context;)Z

    move-result v0

    invoke-virtual {p1, v0}, Ljava/lang/StringBuilder;->append(Z)Ljava/lang/StringBuilder;

    const-string v0, " | TbsVersion:"

    invoke-virtual {p1, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p0}, Landroid/content/Context;->getApplicationContext()Landroid/content/Context;

    move-result-object v0

    invoke-static {v0}, Lcom/tencent/smtt/sdk/QbSdk;->getTbsVersion(Landroid/content/Context;)I

    move-result v0

    invoke-virtual {p1, v0}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {p1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-static {v1, p1}, La0/l;->i(Ljava/lang/String;Ljava/lang/String;)V

    iget-object p1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    invoke-virtual {p1}, Lcom/tencent/smtt/sdk/WebView;->getX5WebViewExtension()Lcom/tencent/smtt/export/external/extension/interfaces/IX5WebViewExtension;

    move-result-object p1

    const/4 v0, 0x1

    const/4 v2, 0x0

    if-eqz p1, :cond_1

    const/4 p1, 0x1

    goto :goto_0

    :cond_1
    const/4 p1, 0x0

    :goto_0
    iget-object v3, p0, Lcom/hjgzs/rpgplugin/MainActivity;->q:Lce/u1;

    invoke-virtual {v3}, Lce/u1;->f()Z

    move-result v3

    new-instance v4, Ljava/lang/StringBuilder;

    invoke-direct {v4}, Ljava/lang/StringBuilder;-><init>()V

    const-string v5, "\u662f\u5426\u9700\u8981\u624b\u52a8\u5b89\u88c5X5\u5185\u6838: "

    invoke-virtual {v4, v5}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    if-eqz v3, :cond_2

    if-nez p1, :cond_2

    goto :goto_1

    :cond_2
    const/4 v0, 0x0

    :goto_1
    invoke-virtual {v4, v0}, Ljava/lang/StringBuilder;->append(Z)Ljava/lang/StringBuilder;

    invoke-virtual {v4}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-static {v1, v0}, La0/l;->i(Ljava/lang/String;Ljava/lang/String;)V

    if-eqz v3, :cond_3

    if-nez p1, :cond_3

    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->ac()V

    iget-object p1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->q:Lce/u1;

    invoke-virtual {p1, v2}, Lce/u1;->j(Z)V

    goto :goto_2

    :cond_3
    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->H()V

    :goto_2
    const-string p1, "\u6e38\u620f\u540e\u53f0\u52a0\u8f7d\u5df2\u542f\u52a8\uff0c\u7b49\u5f85\u9a8c\u8bc1\u901a\u8fc7\u540e\u663e\u793a"

    invoke-static {v1, p1}, La0/l;->Il(Ljava/lang/String;Ljava/lang/String;)V

    return-void
.end method

.method public final a0()V
    .locals 2

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->lI:Lce/ac;

    if-eqz v0, :cond_0

    invoke-virtual {v0}, Lce/ac;->cd()Z

    move-result v0

    if-eqz v0, :cond_0

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->lI:Lce/ac;

    invoke-virtual {v0}, Lce/ac;->cf()V

    const/4 v0, 0x0

    iput-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->lI:Lce/ac;

    const-string v0, "-TK-"

    const-string v1, "\u672c\u5730\u8d44\u6e90\u670d\u52a1\u5668\u5df2\u505c\u6b62"

    invoke-static {v0, v1}, La0/l;->Il(Ljava/lang/String;Ljava/lang/String;)V

    :cond_0
    return-void
.end method

.method public final aa()V
    .locals 3

    new-instance v0, Landroid/app/AlertDialog$Builder;

    invoke-direct {v0, p0}, Landroid/app/AlertDialog$Builder;-><init>(Landroid/content/Context;)V

    const-string v1, "\u94c1\u6c41\uff0c\u4f60\u771f\u5f97\u8981\u9000\u51fa\u5417\uff1f\u5efa\u8bae\u518d\u73a924\u5c0f\u65f6\uff01"

    invoke-virtual {v0, v1}, Landroid/app/AlertDialog$Builder;->setMessage(Ljava/lang/CharSequence;)Landroid/app/AlertDialog$Builder;

    const-string v1, "\u63d0\u793a"

    invoke-virtual {v0, v1}, Landroid/app/AlertDialog$Builder;->setTitle(Ljava/lang/CharSequence;)Landroid/app/AlertDialog$Builder;

    new-instance v1, Lcom/hjgzs/rpgplugin/MainActivity$I;

    invoke-direct {v1, p0}, Lcom/hjgzs/rpgplugin/MainActivity$I;-><init>(Lcom/hjgzs/rpgplugin/MainActivity;)V

    const-string v2, "\u53d6\u6d88"

    invoke-virtual {v0, v2, v1}, Landroid/app/AlertDialog$Builder;->setNegativeButton(Ljava/lang/CharSequence;Landroid/content/DialogInterface$OnClickListener;)Landroid/app/AlertDialog$Builder;

    new-instance v1, Lcom/hjgzs/rpgplugin/MainActivity$ll;

    invoke-direct {v1, p0}, Lcom/hjgzs/rpgplugin/MainActivity$ll;-><init>(Lcom/hjgzs/rpgplugin/MainActivity;)V

    const-string v2, "\u786e\u8ba4"

    invoke-virtual {v0, v2, v1}, Landroid/app/AlertDialog$Builder;->setPositiveButton(Ljava/lang/CharSequence;Landroid/content/DialogInterface$OnClickListener;)Landroid/app/AlertDialog$Builder;

    invoke-virtual {v0}, Landroid/app/AlertDialog$Builder;->create()Landroid/app/AlertDialog;

    move-result-object v0

    iput-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->I:Landroid/app/AlertDialog;

    return-void
.end method

.method public final ab()I
    .locals 4

    const-string v0, "Chrome/"

    const/4 v1, 0x0

    :try_start_0
    sget v2, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v3, 0x1a

    if-lt v2, v3, :cond_0

    invoke-static {}, Lcom/anythink/core/common/s/Il;->o()Landroid/content/pm/PackageInfo;

    move-result-object v0

    if-eqz v0, :cond_1

    iget-object v0, v0, Landroid/content/pm/PackageInfo;->versionName:Ljava/lang/String;

    if-eqz v0, :cond_1

    const-string v2, "\\."

    invoke-virtual {v0, v2}, Ljava/lang/String;->split(Ljava/lang/String;)[Ljava/lang/String;

    move-result-object v0

    array-length v2, v0

    if-lez v2, :cond_1

    aget-object v0, v0, v1

    invoke-static {v0}, Ljava/lang/Integer;->parseInt(Ljava/lang/String;)I

    move-result v0

    return v0

    :cond_0
    invoke-static {p0}, Landroid/webkit/WebSettings;->getDefaultUserAgent(Landroid/content/Context;)Ljava/lang/String;

    move-result-object v2

    if-eqz v2, :cond_1

    invoke-virtual {v2, v0}, Ljava/lang/String;->contains(Ljava/lang/CharSequence;)Z

    move-result v3

    if-eqz v3, :cond_1

    invoke-virtual {v2, v0}, Ljava/lang/String;->indexOf(Ljava/lang/String;)I

    move-result v0

    add-int/lit8 v0, v0, 0x7

    const-string v3, "."

    invoke-virtual {v2, v3, v0}, Ljava/lang/String;->indexOf(Ljava/lang/String;I)I

    move-result v3

    if-le v3, v0, :cond_1

    invoke-virtual {v2, v0, v3}, Ljava/lang/String;->substring(II)Ljava/lang/String;

    move-result-object v0

    invoke-static {v0}, Ljava/lang/Integer;->parseInt(Ljava/lang/String;)I

    move-result v0
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    return v0

    :catch_0
    move-exception v0

    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    const-string v3, "\u83b7\u53d6\u7cfb\u7edfWebView\u7248\u672c\u5931\u8d25: "

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {v2, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    const-string v2, "-TK-"

    invoke-static {v2, v0}, La0/l;->a(Ljava/lang/String;Ljava/lang/String;)V

    :cond_1
    return v1
.end method

.method public final ac()V
    .locals 3

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->q:Lce/u1;

    invoke-virtual {v0}, Lce/u1;->e()Z

    move-result v0

    if-eqz v0, :cond_0

    const-string v0, "046515_arm64v8a_x5.tbs.apk"

    goto :goto_0

    :cond_0
    const-string v0, "046514_arm32v8a_x5.tbs.apk"

    :goto_0
    new-instance v1, Ljava/lang/StringBuilder;

    invoke-direct {v1}, Ljava/lang/StringBuilder;-><init>()V

    invoke-virtual {p0}, Landroid/content/Context;->getApplicationContext()Landroid/content/Context;

    move-result-object v2

    invoke-static {v2}, Lcf/o;->I(Landroid/content/Context;)Ljava/io/File;

    move-result-object v2

    invoke-virtual {v2}, Ljava/io/File;->getPath()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string v2, "/"

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    invoke-static {v1}, Lcf/o;->i(Ljava/lang/String;)Z

    move-result v2

    if-nez v2, :cond_1

    invoke-virtual {p0}, Landroid/content/Context;->getApplicationContext()Landroid/content/Context;

    move-result-object v2

    invoke-static {v2, v0, v1}, Lcf/o;->o(Landroid/content/Context;Ljava/lang/String;Ljava/lang/String;)Z

    :cond_1
    const-string v0, "\u8bf7\u624b\u52a8\u5b89\u88c5\u672c\u5730\u5185\u6838."

    const/4 v1, 0x0

    invoke-static {p0, v0, v1}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;

    move-result-object v0

    invoke-virtual {v0}, Landroid/widget/Toast;->show()V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    const-string v1, "http://debugtbs.qq.com"

    invoke-virtual {v0, v1}, Lcom/tencent/smtt/sdk/WebView;->loadUrl(Ljava/lang/String;)V

    return-void
.end method

.method public final ad()V
    .locals 3

    new-instance v0, Lce/u1;

    invoke-direct {v0, p0}, Lce/u1;-><init>(Landroid/content/Context;)V

    iput-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->q:Lce/u1;

    invoke-virtual {v0}, Lce/u1;->b()V

    new-instance v0, Lcom/hjgzs/rpgplugin/I;

    iget-object v1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    const-string v2, "b6731b1ac11955"

    invoke-direct {v0, p0, v1, p0, v2}, Lcom/hjgzs/rpgplugin/I;-><init>(Landroid/content/Context;Lcom/hjgzs/rpgplugin/X5WebView;Lcom/hjgzs/rpgplugin/I$o;Ljava/lang/String;)V

    iput-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->r:Lcom/hjgzs/rpgplugin/I;

    iget-object v1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    const-string v2, "HWGOEA"

    invoke-virtual {v1, v0, v2}, Lcom/tencent/smtt/sdk/WebView;->addJavascriptInterface(Ljava/lang/Object;Ljava/lang/String;)V

    new-instance v0, Lcom/rmmod/ModBridge;

    invoke-direct {v0}, Lcom/rmmod/ModBridge;-><init>()V

    const-string v2, "MOD"

    invoke-virtual {v1, v0, v2}, Lcom/tencent/smtt/sdk/WebView;->addJavascriptInterface(Ljava/lang/Object;Ljava/lang/String;)V

    invoke-static {p0}, Lcom/rmmod/ModFloatingWindow;->show(Landroid/app/Activity;)V

    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->R()V

    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->P()V

    const-string v0, "-TK-"

    const-string v1, "\u6838\u5fc3\u7ec4\u4ef6\u521d\u59cb\u5316\u5b8c\u6210\uff0cJavaScript\u63a5\u53e3\u5df2\u5c31\u7eea"

    invoke-static {v0, v1}, La0/l;->Il(Ljava/lang/String;Ljava/lang/String;)V

    return-void
.end method

.method public final ae()V
    .locals 6

    const-string v0, "initFloatingMenu() \u5f00\u59cb"

    const-string v1, "-TK-"

    invoke-static {v1, v0}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->Il:Lcom/hjgzs/rpgplugin/l;

    if-nez v0, :cond_0

    const-string v0, "\u521b\u5efa FloatingActionMenu \u5b9e\u4f8b"

    invoke-static {v1, v0}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    new-instance v0, Lcom/hjgzs/rpgplugin/l;

    invoke-direct {v0, p0, p0}, Lcom/hjgzs/rpgplugin/l;-><init>(Landroid/content/Context;Lcom/hjgzs/rpgplugin/l$II;)V

    iput-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->Il:Lcom/hjgzs/rpgplugin/l;

    :cond_0
    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v2, 0x17

    if-lt v0, v2, :cond_5

    invoke-static {p0}, Lce/ad;->o(Landroid/content/Context;)Z

    move-result v0

    if-eqz v0, :cond_1

    invoke-static {p0}, La0/o;->ll(Landroid/content/Context;)La0/o;

    move-result-object v0

    invoke-virtual {v0}, La0/o;->O()V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->II:Lcom/hjgzs/rpgplugin/ll;

    if-eqz v0, :cond_6

    const/4 v1, 0x1

    invoke-virtual {v0, v1}, Lcom/hjgzs/rpgplugin/ll;->d0(Z)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->II:Lcom/hjgzs/rpgplugin/ll;

    goto :goto_1

    :cond_1
    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->II:Lcom/hjgzs/rpgplugin/ll;

    if-eqz v0, :cond_2

    const/4 v2, 0x0

    invoke-virtual {v0, v2}, Lcom/hjgzs/rpgplugin/ll;->d0(Z)V

    :cond_2
    invoke-static {p0}, La0/o;->ll(Landroid/content/Context;)La0/o;

    move-result-object v0

    invoke-virtual {v0}, La0/o;->d()Z

    move-result v2

    if-eqz v2, :cond_3

    invoke-virtual {v0}, La0/o;->b()J

    move-result-wide v2

    const-wide/32 v4, 0x36ee80

    div-long/2addr v2, v4

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v4, "\u6743\u9650\u7533\u8bf7\u5728\u51b7\u5374\u671f\u5185\uff0c\u5269\u4f59\u65f6\u95f4: "

    invoke-virtual {v0, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, v2, v3}, Ljava/lang/StringBuilder;->append(J)Ljava/lang/StringBuilder;

    const-string v2, "\u5c0f\u65f6"

    invoke-virtual {v0, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    :goto_0
    invoke-static {v1, v0}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    goto :goto_2

    :cond_3
    invoke-virtual {v0}, La0/o;->e()Z

    move-result v2

    if-eqz v2, :cond_4

    const-string v0, "\u6743\u9650\u7533\u8bf7\u6b21\u6570\u5df2\u8fbe\u4e0a\u9650"

    goto :goto_0

    :cond_4
    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    const-string v3, "\u8bf7\u6c42\u60ac\u6d6e\u7a97\u6743\u9650\uff0c\u5f53\u524d\u7533\u8bf7\u6b21\u6570: "

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, La0/o;->a()I

    move-result v0

    invoke-virtual {v2, v0}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-static {v1, v0}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->N()V

    goto :goto_2

    :cond_5
    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->II:Lcom/hjgzs/rpgplugin/ll;

    if-eqz v0, :cond_6

    :goto_1
    invoke-virtual {v0}, Lcom/hjgzs/rpgplugin/ll;->ce()V

    :cond_6
    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->U()V

    :goto_2
    return-void
.end method

.method public final af()V
    .locals 5

    invoke-virtual {p0}, Landroid/app/Activity;->isFinishing()Z

    move-result v0

    const-string v1, "-TK-"

    if-nez v0, :cond_4

    invoke-virtual {p0}, Landroid/app/Activity;->isDestroyed()Z

    move-result v0

    if-eqz v0, :cond_0

    goto/16 :goto_3

    :cond_0
    :try_start_0
    invoke-static {}, Lcom/hjgzs/rpgplugin/ll;->v()Lcom/hjgzs/rpgplugin/ll;

    move-result-object v0

    iput-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->II:Lcom/hjgzs/rpgplugin/ll;

    invoke-virtual {v0, p0}, Lcom/hjgzs/rpgplugin/ll;->c0(Landroid/app/Activity;)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->II:Lcom/hjgzs/rpgplugin/ll;

    invoke-virtual {v0, p0}, Lcom/hjgzs/rpgplugin/ll;->Z(Lcom/hjgzs/rpgplugin/ll$c;)V

    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v2, 0x17

    if-lt v0, v2, :cond_1

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->II:Lcom/hjgzs/rpgplugin/ll;

    invoke-static {p0}, Lce/ad;->o(Landroid/content/Context;)Z

    move-result v2

    invoke-virtual {v0, v2}, Lcom/hjgzs/rpgplugin/ll;->d0(Z)V

    goto :goto_0

    :cond_1
    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->II:Lcom/hjgzs/rpgplugin/ll;

    const/4 v2, 0x1

    invoke-virtual {v0, v2}, Lcom/hjgzs/rpgplugin/ll;->d0(Z)V

    :goto_0
    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->II:Lcom/hjgzs/rpgplugin/ll;
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_1

    if-eqz v0, :cond_2

    :try_start_1
    invoke-virtual {v0}, Lcom/hjgzs/rpgplugin/ll;->cf()V

    const-string v0, "TapTap SDK\u521d\u59cb\u5316\u5b8c\u6210"

    invoke-static {v1, v0}, La0/l;->Il(Ljava/lang/String;Ljava/lang/String;)V
    :try_end_1
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_0

    goto :goto_1

    :catch_0
    move-exception v0

    :try_start_2
    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    const-string v3, "TapTap SDK\u521d\u59cb\u5316\u5931\u8d25: "

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v3

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-static {v1, v2, v0}, La0/l;->ll(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    :cond_2
    :goto_1
    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->r:Lcom/hjgzs/rpgplugin/I;

    if-eqz v0, :cond_3

    iget-object v2, p0, Lcom/hjgzs/rpgplugin/MainActivity;->II:Lcom/hjgzs/rpgplugin/ll;

    if-eqz v2, :cond_3

    invoke-virtual {v0, v2}, Lcom/hjgzs/rpgplugin/I;->o(Lcom/hjgzs/rpgplugin/ll;)V

    :cond_3
    new-instance v0, Landroid/os/Handler;

    invoke-direct {v0}, Landroid/os/Handler;-><init>()V

    new-instance v2, Lce/ba;

    invoke-direct {v2, p0}, Lce/ba;-><init>(Lcom/hjgzs/rpgplugin/MainActivity;)V

    const-wide/16 v3, 0x2710

    invoke-virtual {v0, v2, v3, v4}, Landroid/os/Handler;->postDelayed(Ljava/lang/Runnable;J)Z

    const-string v0, "\u6b21\u8981\u7ba1\u7406\u5668\u521d\u59cb\u5316\u5b8c\u6210,\u5e7f\u544aSDK\u540e\u53f0\u52a0\u8f7d\u4e2d"

    invoke-static {v1, v0}, La0/l;->Il(Ljava/lang/String;Ljava/lang/String;)V
    :try_end_2
    .catch Ljava/lang/Exception; {:try_start_2 .. :try_end_2} :catch_1

    goto :goto_2

    :catch_1
    move-exception v0

    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    const-string v3, "\u521d\u59cb\u5316\u6b21\u8981\u7ba1\u7406\u5668\u65f6\u53d1\u751f\u5f02\u5e38: "

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v3

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-static {v1, v2, v0}, La0/l;->ll(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    :goto_2
    return-void

    :cond_4
    :goto_3
    const-string v0, "Activity\u6b63\u5728\u9500\u6bc1\uff0c\u8df3\u8fc7\u6b21\u8981\u7ba1\u7406\u5668\u521d\u59cb\u5316"

    invoke-static {v1, v0}, La0/l;->a(Ljava/lang/String;Ljava/lang/String;)V

    return-void
.end method

.method public copyToClipboard(Ljava/lang/String;)V
    .locals 2

    const-string v0, "clipboard"

    invoke-virtual {p0, v0}, Landroid/content/Context;->getSystemService(Ljava/lang/String;)Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Landroid/content/ClipboardManager;

    if-eqz v0, :cond_0

    const/4 v1, 0x0

    invoke-static {v1, p1}, Landroid/content/ClipData;->newPlainText(Ljava/lang/CharSequence;Ljava/lang/CharSequence;)Landroid/content/ClipData;

    move-result-object p1

    invoke-virtual {v0, p1}, Landroid/content/ClipboardManager;->setPrimaryClip(Landroid/content/ClipData;)V

    :cond_0
    return-void
.end method

.method public onAchievementClick()V
    .locals 5

    const-string v0, "\u60ac\u6d6e\u83dc\u5355\uff1a\u6210\u5c31\u529f\u80fd\u70b9\u51fb"

    const-string v1, "-TK-"

    invoke-static {v1, v0}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->II:Lcom/hjgzs/rpgplugin/ll;

    if-eqz v0, :cond_0

    :try_start_0
    invoke-virtual {v0}, Lcom/hjgzs/rpgplugin/ll;->i0()V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_1

    :catch_0
    move-exception v0

    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    const-string v3, "\u6253\u5f00\u6210\u5c31\u9875\u9762\u5931\u8d25: "

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v4

    invoke-virtual {v2, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-static {v1, v2, v0}, La0/l;->ll(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    new-instance v1, Ljava/lang/StringBuilder;

    invoke-direct {v1}, Ljava/lang/StringBuilder;-><init>()V

    invoke-virtual {v1, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {v1, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    goto :goto_0

    :cond_0
    const-string v0, "TapTap\u7ba1\u7406\u5668\u4e3anull\uff0c\u65e0\u6cd5\u6253\u5f00\u6210\u5c31\u9875\u9762"

    invoke-static {v1, v0}, La0/l;->a(Ljava/lang/String;Ljava/lang/String;)V

    const-string v0, "TapTap\u529f\u80fd\u5c1a\u672a\u521d\u59cb\u5316"

    :goto_0
    invoke-virtual {p0, v0}, Lcom/hjgzs/rpgplugin/MainActivity;->showToast(Ljava/lang/String;)V

    :goto_1
    return-void
.end method

.method public onAchievementError(Ljava/lang/String;ILjava/lang/String;)V
    .locals 2

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "\u6210\u5c31\u64cd\u4f5c\u5931\u8d25: "

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string p1, " - "

    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, p3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string p1, " (\u9519\u8bef\u7801: "

    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, p2}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string p1, ")"

    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    const-string v0, "-TK-"

    invoke-static {v0, p1}, La0/l;->i(Ljava/lang/String;Ljava/lang/String;)V

    new-instance p1, Lce/cf;

    invoke-direct {p1, p0, p2, p3}, Lce/cf;-><init>(Lcom/hjgzs/rpgplugin/MainActivity;ILjava/lang/String;)V

    invoke-virtual {p0, p1}, Landroid/app/Activity;->runOnUiThread(Ljava/lang/Runnable;)V

    return-void
.end method

.method public onAchievementUnlocked(Ljava/lang/String;Ljava/lang/String;)V
    .locals 2

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "\u6210\u5c31\u89e3\u9501\u6210\u529f: "

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string p1, " - "

    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, p2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    const-string v0, "-TK-"

    invoke-static {v0, p1}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    new-instance p1, Lce/c0;

    invoke-direct {p1, p0, p2}, Lce/c0;-><init>(Lcom/hjgzs/rpgplugin/MainActivity;Ljava/lang/String;)V

    invoke-virtual {p0, p1}, Landroid/app/Activity;->runOnUiThread(Ljava/lang/Runnable;)V

    return-void
.end method

.method public onActivityResult(IILandroid/content/Intent;)V
    .locals 4

    invoke-super {p0, p1, p2, p3}, Landroidx/fragment/app/FragmentActivity;->onActivityResult(IILandroid/content/Intent;)V

    const/16 p2, 0x1f41

    if-ne p1, p2, :cond_3

    sget p1, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 p2, 0x17

    const/4 p3, 0x1

    const-string v0, "-TK-"

    if-lt p1, p2, :cond_1

    invoke-static {p0}, Lce/ad;->o(Landroid/content/Context;)Z

    move-result p1

    if-eqz p1, :cond_1

    const-string p1, "\u60ac\u6d6e\u7a97\u6743\u9650\u5df2\u83b7\u53d6\uff0c\u6e05\u9664\u6743\u9650\u8bb0\u5f55\u5e76\u521d\u59cb\u5316\u60ac\u6d6e\u83dc\u5355"

    invoke-static {v0, p1}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    invoke-static {p0}, La0/o;->ll(Landroid/content/Context;)La0/o;

    move-result-object p1

    invoke-virtual {p1}, La0/o;->O()V

    iget-object p1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->II:Lcom/hjgzs/rpgplugin/ll;

    if-eqz p1, :cond_0

    invoke-virtual {p1, p3}, Lcom/hjgzs/rpgplugin/ll;->d0(Z)V

    iget-object p1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->II:Lcom/hjgzs/rpgplugin/ll;

    invoke-virtual {p1}, Lcom/hjgzs/rpgplugin/ll;->ce()V

    :cond_0
    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->U()V

    goto :goto_0

    :cond_1
    const-string p1, "\u60ac\u6d6e\u7a97\u6743\u9650\u88ab\u62d2\u7edd\uff0c\u8bb0\u5f55\u62d2\u7edd\u65f6\u95f4"

    invoke-static {v0, p1}, La0/l;->a(Ljava/lang/String;Ljava/lang/String;)V

    iget-object p1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->II:Lcom/hjgzs/rpgplugin/ll;

    const/4 p2, 0x0

    if-eqz p1, :cond_2

    invoke-virtual {p1, p2}, Lcom/hjgzs/rpgplugin/ll;->d0(Z)V

    :cond_2
    invoke-static {p0}, La0/o;->ll(Landroid/content/Context;)La0/o;

    move-result-object p1

    invoke-virtual {p1}, La0/o;->g()V

    invoke-virtual {p1}, La0/o;->b()J

    move-result-wide v0

    const-wide/32 v2, 0x36ee80

    div-long/2addr v0, v2

    new-array p1, p3, [Ljava/lang/Object;

    const-wide/16 v2, 0x1

    add-long/2addr v0, v2

    invoke-static {v0, v1}, Ljava/lang/Long;->valueOf(J)Ljava/lang/Long;

    move-result-object p3

    aput-object p3, p1, p2

    const-string p2, "\u60ac\u6d6e\u7a97\u6743\u9650\u88ab\u62d2\u7edd\u3002\n\n\u4e3a\u4e86\u907f\u514d\u9891\u7e41\u6253\u6270\uff0c\u7cfb\u7edf\u5c06\u5728 %d \u5c0f\u65f6\u5185\u4e0d\u518d\u4e3b\u52a8\u7533\u8bf7\u6b64\u6743\u9650\u3002\n\n\u5982\u9700\u4f7f\u7528\u60ac\u6d6e\u6309\u94ae\u529f\u80fd\uff0c\u60a8\u53ef\u4ee5\u7a0d\u540e\u624b\u52a8\u524d\u5f80\u5e94\u7528\u8bbe\u7f6e\u4e2d\u5f00\u542f\u3002"

    invoke-static {p2, p1}, Ljava/lang/String;->format(Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/String;

    move-result-object p1

    invoke-virtual {p0, p1}, Lcom/hjgzs/rpgplugin/MainActivity;->Y(Ljava/lang/String;)V

    :cond_3
    :goto_0
    return-void
.end method

.method public onAdShow(II)V
    .locals 3

    const-string v0, "b6731b1ac11955"

    :try_start_0
    invoke-static {v0}, Lcom/anythink/rewardvideo/api/ATRewardVideoAutoAd;->isAdReady(Ljava/lang/String;)Z

    move-result v1

    if-eqz v1, :cond_0

    const/4 v1, 0x1

    iput-boolean v1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->t:Z

    iget-object v2, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    invoke-virtual {v2}, Lcom/tencent/smtt/sdk/WebView;->onPause()V

    iput-boolean v1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->s:Z

    new-instance v1, Lce/n1;

    iget-object v2, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    invoke-direct {v1, p0, v2, p1, p2}, Lce/n1;-><init>(Lcom/hjgzs/rpgplugin/MainActivity;Lcom/tencent/smtt/sdk/WebView;II)V

    invoke-static {p0, v0, v1}, Lcom/anythink/rewardvideo/api/ATRewardVideoAutoAd;->show(Landroid/app/Activity;Ljava/lang/String;Lcom/anythink/rewardvideo/api/ATRewardVideoAutoEventListener;)V

    goto :goto_0

    :cond_0
    new-instance p1, Lce/cc;

    invoke-direct {p1, p0}, Lce/cc;-><init>(Lcom/hjgzs/rpgplugin/MainActivity;)V

    invoke-virtual {p0, p1}, Landroid/app/Activity;->runOnUiThread(Ljava/lang/Runnable;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception p1

    new-instance p2, Lce/cd;

    invoke-direct {p2, p0}, Lce/cd;-><init>(Lcom/hjgzs/rpgplugin/MainActivity;)V

    invoke-virtual {p0, p2}, Landroid/app/Activity;->runOnUiThread(Ljava/lang/Runnable;)V

    new-instance p2, Ljava/lang/StringBuilder;

    invoke-direct {p2}, Ljava/lang/StringBuilder;-><init>()V

    const-string v0, "\u5e7f\u544a\u64ad\u653e\u9519\u8bef: "

    invoke-virtual {p2, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p2, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/Object;)Ljava/lang/StringBuilder;

    invoke-virtual {p2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    const-string p2, "-TK-"

    invoke-static {p2, p1}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    :goto_0
    return-void
.end method

.method public onAntiAddictionTriggered(ILjava/lang/String;)V
    .locals 2

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "\u9632\u6c89\u8ff7\u89e6\u53d1: "

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string p1, " - "

    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, p2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    const-string p2, "-TK-"

    invoke-static {p2, p1}, La0/l;->a(Ljava/lang/String;Ljava/lang/String;)V

    return-void
.end method

.method public onConfigurationChanged(Landroid/content/res/Configuration;)V
    .locals 5

    invoke-super {p0, p1}, Landroidx/appcompat/app/AppCompatActivity;->onConfigurationChanged(Landroid/content/res/Configuration;)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    const-string v1, "-TK-"

    if-eqz v0, :cond_0

    iget-boolean v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->v:Z

    if-eqz v0, :cond_0

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v2, "\u914d\u7f6e\u53d8\u5316\uff0c\u4fdd\u6301WebView\u5c3a\u5bf8: "

    invoke-virtual {v0, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    iget v2, p0, Lcom/hjgzs/rpgplugin/MainActivity;->w:I

    invoke-virtual {v0, v2}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string v2, "x"

    invoke-virtual {v0, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    iget v2, p0, Lcom/hjgzs/rpgplugin/MainActivity;->x:I

    invoke-virtual {v0, v2}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-static {v1, v0}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    new-instance v2, Landroid/widget/FrameLayout$LayoutParams;

    iget v3, p0, Lcom/hjgzs/rpgplugin/MainActivity;->w:I

    iget v4, p0, Lcom/hjgzs/rpgplugin/MainActivity;->x:I

    invoke-direct {v2, v3, v4}, Landroid/widget/FrameLayout$LayoutParams;-><init>(II)V

    invoke-virtual {v0, v2}, Landroid/view/View;->setLayoutParams(Landroid/view/ViewGroup$LayoutParams;)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    invoke-virtual {v0}, Landroid/view/View;->postInvalidate()V

    :cond_0
    iget v0, p1, Landroid/content/res/Configuration;->orientation:I

    iget v2, p0, Lcom/hjgzs/rpgplugin/MainActivity;->u:I

    if-eq v0, v2, :cond_2

    iput v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->u:I

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v2, "\u5c4f\u5e55\u65b9\u5411\u53d8\u5316: "

    invoke-virtual {v0, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    iget p1, p1, Landroid/content/res/Configuration;->orientation:I

    const/4 v2, 0x2

    if-ne p1, v2, :cond_1

    const-string p1, "\u6a2a\u5c4f"

    goto :goto_0

    :cond_1
    const-string p1, "\u7ad6\u5c4f"

    :goto_0
    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-static {v1, p1}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    :cond_2
    return-void
.end method

.method public onCreate(Landroid/os/Bundle;)V
    .locals 2

    invoke-super {p0, p1}, Landroidx/fragment/app/FragmentActivity;->onCreate(Landroid/os/Bundle;)V

    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->S()V

    const v0, 0x7f0c027c

    invoke-virtual {p0, v0}, Landroidx/appcompat/app/AppCompatActivity;->setContentView(I)V

    const v0, 0x7f090896

    invoke-virtual {p0, v0}, Landroidx/appcompat/app/AppCompatActivity;->findViewById(I)Landroid/view/View;

    move-result-object v0

    check-cast v0, Lcom/hjgzs/rpgplugin/X5WebView;

    iput-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    const/4 v1, 0x4

    invoke-virtual {v0, v1}, Lcom/tencent/smtt/sdk/WebView;->setVisibility(I)V

    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->Q()V

    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->K()V

    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->J()V

    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->ad()V

    invoke-virtual {p0, p1}, Lcom/hjgzs/rpgplugin/MainActivity;->Z(Landroid/os/Bundle;)V

    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->z()V

    return-void
.end method

.method public onDestroy()V
    .locals 5

    const-string v0, "-TK-"

    invoke-super {p0}, Landroidx/appcompat/app/AppCompatActivity;->onDestroy()V

    invoke-static {}, Lcom/rmmod/ModFloatingWindow;->hide()V

    :try_start_0
    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->a0()V

    iget-object v1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->Il:Lcom/hjgzs/rpgplugin/l;
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_3

    const/4 v2, 0x0

    if-eqz v1, :cond_0

    :try_start_1
    invoke-virtual {v1}, Lcom/hjgzs/rpgplugin/l;->J()V
    :try_end_1
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_0
    .catchall {:try_start_1 .. :try_end_1} :catchall_0

    :goto_0
    :try_start_2
    iput-object v2, p0, Lcom/hjgzs/rpgplugin/MainActivity;->Il:Lcom/hjgzs/rpgplugin/l;
    :try_end_2
    .catch Ljava/lang/Exception; {:try_start_2 .. :try_end_2} :catch_3

    goto :goto_2

    :catchall_0
    move-exception v1

    goto :goto_1

    :catch_0
    move-exception v1

    :try_start_3
    new-instance v3, Ljava/lang/StringBuilder;

    invoke-direct {v3}, Ljava/lang/StringBuilder;-><init>()V

    const-string v4, "\u9500\u6bc1\u60ac\u6d6e\u83dc\u5355\u65f6\u53d1\u751f\u5f02\u5e38: "

    invoke-virtual {v3, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v4

    invoke-virtual {v3, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v3

    invoke-static {v0, v3, v1}, La0/l;->ll(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V
    :try_end_3
    .catchall {:try_start_3 .. :try_end_3} :catchall_0

    goto :goto_0

    :goto_1
    :try_start_4
    iput-object v2, p0, Lcom/hjgzs/rpgplugin/MainActivity;->Il:Lcom/hjgzs/rpgplugin/l;

    throw v1

    :cond_0
    :goto_2
    iget-object v1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->II:Lcom/hjgzs/rpgplugin/ll;
    :try_end_4
    .catch Ljava/lang/Exception; {:try_start_4 .. :try_end_4} :catch_3

    if-eqz v1, :cond_1

    :try_start_5
    invoke-virtual {v1, p0}, Lcom/hjgzs/rpgplugin/ll;->p0(Lcom/hjgzs/rpgplugin/ll$c;)V

    const-string v1, "\u5df2\u4eceTapTapManager\u6ce8\u9500MainActivity\u56de\u8c03"

    invoke-static {v0, v1}, La0/l;->Il(Ljava/lang/String;Ljava/lang/String;)V
    :try_end_5
    .catch Ljava/lang/Exception; {:try_start_5 .. :try_end_5} :catch_1

    goto :goto_3

    :catch_1
    move-exception v1

    :try_start_6
    new-instance v3, Ljava/lang/StringBuilder;

    invoke-direct {v3}, Ljava/lang/StringBuilder;-><init>()V

    const-string v4, "\u6ce8\u9500TapTap\u7ba1\u7406\u5668\u56de\u8c03\u65f6\u53d1\u751f\u5f02\u5e38: "

    invoke-virtual {v3, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v4

    invoke-virtual {v3, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v3

    invoke-static {v0, v3, v1}, La0/l;->ll(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    :cond_1
    :goto_3
    iget-object v1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->y:Landroid/os/Handler;

    if-eqz v1, :cond_2

    iget-object v3, p0, Lcom/hjgzs/rpgplugin/MainActivity;->z:Ljava/lang/Runnable;

    invoke-virtual {v1, v3}, Landroid/os/Handler;->removeCallbacks(Ljava/lang/Runnable;)V

    iput-object v2, p0, Lcom/hjgzs/rpgplugin/MainActivity;->y:Landroid/os/Handler;

    :cond_2
    iget-object v1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;
    :try_end_6
    .catch Ljava/lang/Exception; {:try_start_6 .. :try_end_6} :catch_3

    if-eqz v1, :cond_4

    :try_start_7
    invoke-virtual {v1}, Lcom/hjgzs/rpgplugin/X5WebView;->cleanup()V

    iget-object v1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    invoke-virtual {v1}, Lcom/tencent/smtt/sdk/WebView;->getSettings()Lcom/tencent/smtt/sdk/WebSettings;

    move-result-object v1

    if-eqz v1, :cond_3

    const/4 v3, 0x0

    invoke-virtual {v1, v3}, Lcom/tencent/smtt/sdk/WebSettings;->setJavaScriptEnabled(Z)V

    :cond_3
    iget-object v1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    const-string v3, "HWGOEA"

    invoke-virtual {v1, v3}, Lcom/tencent/smtt/sdk/WebView;->removeJavascriptInterface(Ljava/lang/String;)V

    iget-object v1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    invoke-virtual {v1}, Lcom/tencent/smtt/sdk/WebView;->onPause()V

    iget-object v1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    invoke-virtual {v1}, Lcom/tencent/smtt/sdk/WebView;->destroy()V
    :try_end_7
    .catch Ljava/lang/Exception; {:try_start_7 .. :try_end_7} :catch_2
    .catchall {:try_start_7 .. :try_end_7} :catchall_1

    :goto_4
    :try_start_8
    iput-object v2, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;
    :try_end_8
    .catch Ljava/lang/Exception; {:try_start_8 .. :try_end_8} :catch_3

    goto :goto_6

    :catchall_1
    move-exception v1

    goto :goto_5

    :catch_2
    move-exception v1

    :try_start_9
    new-instance v3, Ljava/lang/StringBuilder;

    invoke-direct {v3}, Ljava/lang/StringBuilder;-><init>()V

    const-string v4, "\u9500\u6bc1WebView\u65f6\u53d1\u751f\u5f02\u5e38: "

    invoke-virtual {v3, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v4

    invoke-virtual {v3, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v3

    invoke-static {v0, v3, v1}, La0/l;->ll(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V
    :try_end_9
    .catchall {:try_start_9 .. :try_end_9} :catchall_1

    goto :goto_4

    :goto_5
    :try_start_a
    iput-object v2, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    throw v1

    :cond_4
    :goto_6
    iput-object v2, p0, Lcom/hjgzs/rpgplugin/MainActivity;->r:Lcom/hjgzs/rpgplugin/I;

    iput-object v2, p0, Lcom/hjgzs/rpgplugin/MainActivity;->q:Lce/u1;

    iput-object v2, p0, Lcom/hjgzs/rpgplugin/MainActivity;->tatuAd:Lce/f1;

    iput-object v2, p0, Lcom/hjgzs/rpgplugin/MainActivity;->lI:Lce/ac;

    iput-object v2, p0, Lcom/hjgzs/rpgplugin/MainActivity;->I:Landroid/app/AlertDialog;

    const-string v1, "\u6e05\u7406\u6240\u6709\u8d44\u6e90\u5b8c\u6210"

    invoke-static {v0, v1}, La0/l;->Il(Ljava/lang/String;Ljava/lang/String;)V
    :try_end_a
    .catch Ljava/lang/Exception; {:try_start_a .. :try_end_a} :catch_3

    goto :goto_7

    :catch_3
    move-exception v1

    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    const-string v3, "onDestroy\u65f6\u53d1\u751f\u5f02\u5e38: "

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v3

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-static {v0, v2, v1}, La0/l;->ll(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    :goto_7
    return-void
.end method

.method public onForumClick()V
    .locals 2

    const-string v0, "-TK-"

    const-string v1, "\u60ac\u6d6e\u83dc\u5355\uff1a\u8bba\u575b\u529f\u80fd\u70b9\u51fb"

    invoke-static {v0, v1}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->II:Lcom/hjgzs/rpgplugin/ll;

    if-eqz v0, :cond_0

    invoke-virtual {v0}, Lcom/hjgzs/rpgplugin/ll;->R()V

    :cond_0
    return-void
.end method

.method public onFriendClick()V
    .locals 2

    const-string v0, "-TK-"

    const-string v1, "\u60ac\u6d6e\u83dc\u5355\uff1a\u597d\u53cb\u529f\u80fd\u70b9\u51fb"

    invoke-static {v0, v1}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->II:Lcom/hjgzs/rpgplugin/ll;

    if-eqz v0, :cond_0

    invoke-virtual {v0}, Lcom/hjgzs/rpgplugin/ll;->n0()V

    :cond_0
    return-void
.end method

.method public onKeyDown(ILandroid/view/KeyEvent;)Z
    .locals 0

    const/4 p2, 0x4

    if-ne p1, p2, :cond_1

    iget-object p1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->I:Landroid/app/AlertDialog;

    if-nez p1, :cond_0

    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->aa()V

    :cond_0
    iget-object p1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->I:Landroid/app/AlertDialog;

    invoke-virtual {p1}, Landroid/app/Dialog;->show()V

    const/4 p1, 0x1

    return p1

    :cond_1
    const/4 p1, 0x0

    return p1
.end method

.method public onLoginCanceled()V
    .locals 1

    invoke-virtual {p0}, Landroid/app/Activity;->finish()V

    invoke-static {}, Landroid/os/Process;->myPid()I

    move-result v0

    invoke-static {v0}, Landroid/os/Process;->killProcess(I)V

    return-void
.end method

.method public onLoginFailed(Ljava/lang/String;)V
    .locals 0

    invoke-virtual {p0}, Landroid/app/Activity;->finish()V

    invoke-static {}, Landroid/os/Process;->myPid()I

    move-result p1

    invoke-static {p1}, Landroid/os/Process;->killProcess(I)V

    return-void
.end method

.method public onLoginSuccess()V
    .locals 2

    const-string v0, "-TK-"

    const-string v1, "onLoginSuccess() \u56de\u8c03\u88ab\u89e6\u53d1\uff0c\u51c6\u5907\u663e\u793a\u6e38\u620f"

    invoke-static {v0, v1}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->V()V

    return-void
.end method

.method public onLogoutSuccess()V
    .locals 2

    const-string v0, "-TK-"

    const-string v1, "TapTap\u767b\u51fa\u6210\u529f"

    invoke-static {v0, v1}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    return-void
.end method

.method public onLowMemory()V
    .locals 4

    invoke-super {p0}, Landroidx/fragment/app/FragmentActivity;->onLowMemory()V

    const-string v0, "\u7cfb\u7edf\u5185\u5b58\u4e0d\u8db3!\u5f00\u59cb\u91ca\u653e\u7f13\u5b58..."

    const-string v1, "-TK-"

    invoke-static {v1, v0}, La0/l;->a(Ljava/lang/String;Ljava/lang/String;)V

    :try_start_0
    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    if-eqz v0, :cond_0

    const/4 v2, 0x1

    invoke-virtual {v0, v2}, Lcom/tencent/smtt/sdk/WebView;->clearCache(Z)V

    const-string v0, "\u5df2\u6e05\u7406WebView\u7f13\u5b58"

    invoke-static {v1, v0}, La0/l;->Il(Ljava/lang/String;Ljava/lang/String;)V

    :cond_0
    invoke-static {}, Ljava/lang/System;->gc()V

    const-string v0, "\u5df2\u89e6\u53d1\u5783\u573e\u56de\u6536"

    invoke-static {v1, v0}, La0/l;->Il(Ljava/lang/String;Ljava/lang/String;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception v0

    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    const-string v3, "\u5185\u5b58\u6e05\u7406\u5931\u8d25: "

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v3

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-static {v1, v2, v0}, La0/l;->ll(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    :goto_0
    return-void
.end method

.method public onMomentClosed()V
    .locals 2

    const-string v0, "-TK-"

    const-string v1, "\u52a8\u6001\u9875\u9762\u5df2\u5173\u95ed"

    invoke-static {v0, v1}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    return-void
.end method

.method public onMomentNewMessage(I)V
    .locals 3

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "\u8bba\u575b\u65b0\u6d88\u606f\u6570: "

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    const-string v1, "-TK-"

    invoke-static {v1, v0}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->Il:Lcom/hjgzs/rpgplugin/l;

    if-eqz v0, :cond_1

    invoke-virtual {p0}, Landroid/app/Activity;->isFinishing()Z

    move-result v0

    if-nez v0, :cond_1

    invoke-virtual {p0}, Landroid/app/Activity;->isDestroyed()Z

    move-result v0

    if-nez v0, :cond_1

    if-lez p1, :cond_0

    :try_start_0
    iget-object p1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->Il:Lcom/hjgzs/rpgplugin/l;

    invoke-virtual {p1}, Lcom/hjgzs/rpgplugin/l;->l0()V

    goto :goto_0

    :cond_0
    iget-object p1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->Il:Lcom/hjgzs/rpgplugin/l;

    invoke-virtual {p1}, Lcom/hjgzs/rpgplugin/l;->Q()V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception p1

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v2, "\u66f4\u65b0\u8bba\u575b\u65b0\u6d88\u606f\u7ea2\u70b9\u65f6\u53d1\u751f\u5f02\u5e38: "

    invoke-virtual {v0, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p1}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v0, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-static {v1, v0, p1}, La0/l;->ll(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    :cond_1
    :goto_0
    return-void
.end method

.method public onMomentOpened()V
    .locals 4

    const-string v0, "\u52a8\u6001\u9875\u9762\u5df2\u6253\u5f00"

    const-string v1, "-TK-"

    invoke-static {v1, v0}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->Il:Lcom/hjgzs/rpgplugin/l;

    if-eqz v0, :cond_0

    invoke-virtual {p0}, Landroid/app/Activity;->isFinishing()Z

    move-result v0

    if-nez v0, :cond_0

    invoke-virtual {p0}, Landroid/app/Activity;->isDestroyed()Z

    move-result v0

    if-nez v0, :cond_0

    :try_start_0
    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->Il:Lcom/hjgzs/rpgplugin/l;

    invoke-virtual {v0}, Lcom/hjgzs/rpgplugin/l;->Q()V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception v0

    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    const-string v3, "\u6e05\u9664\u8bba\u575b\u7ea2\u70b9\u65f6\u53d1\u751f\u5f02\u5e38: "

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v3

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-static {v1, v2, v0}, La0/l;->ll(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    :cond_0
    :goto_0
    return-void
.end method

.method public onMomentPublishFailed(Ljava/lang/String;)V
    .locals 2

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "\u52a8\u6001\u53d1\u5e03\u5931\u8d25: "

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    const-string v0, "-TK-"

    invoke-static {v0, p1}, La0/l;->i(Ljava/lang/String;Ljava/lang/String;)V

    return-void
.end method

.method public onMomentPublishSuccess()V
    .locals 2

    const-string v0, "-TK-"

    const-string v1, "\u52a8\u6001\u53d1\u5e03\u6210\u529f"

    invoke-static {v0, v1}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    return-void
.end method

.method public onNetworkError()V
    .locals 2

    const-string v0, "-TK-"

    const-string v1, "\u7f51\u7edc\u9519\u8bef"

    invoke-static {v0, v1}, La0/l;->i(Ljava/lang/String;Ljava/lang/String;)V

    const-string v0, "\u6570\u636e\u8bf7\u6c42\u5931\u8d25\uff0c\u6e38\u620f\u9700\u68c0\u67e5\u5f53\u524d\u8bbe\u7f6e\u7684\u5e94\u7528\u4fe1\u606f\u662f\u5426\u6b63\u786e\u53ca\u5224\u65ad\u5f53\u524d\u7f51\u7edc\u8fde\u63a5\u662f\u5426\u6b63\u5e38"

    const/4 v1, 0x0

    invoke-static {p0, v0, v1}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;

    move-result-object v0

    invoke-virtual {v0}, Landroid/widget/Toast;->show()V

    return-void
.end method

.method public onNewFansCountChanged(I)V
    .locals 2

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "\u65b0\u589e\u7c89\u4e1d\u6570: "

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    const-string v0, "-TK-"

    invoke-static {v0, p1}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    return-void
.end method

.method public onOpenCloudSaveUI()V
    .locals 4

    const-string v0, "JS\u8bf7\u6c42\u6253\u5f00\u4e91\u5b58\u6863\u754c\u9762"

    const-string v1, "-TK-"

    invoke-static {v1, v0}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    :try_start_0
    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    invoke-static {v0}, Lcom/hjgzs/rpgplugin/CloudSaveDialogFragment;->aa(Lcom/hjgzs/rpgplugin/X5WebView;)Lcom/hjgzs/rpgplugin/CloudSaveDialogFragment;

    move-result-object v0

    invoke-virtual {p0}, Landroidx/fragment/app/FragmentActivity;->getSupportFragmentManager()Landroidx/fragment/app/FragmentManager;

    move-result-object v2

    const-string v3, "CloudSaveDialog"

    invoke-virtual {v0, v2, v3}, Landroidx/fragment/app/DialogFragment;->show(Landroidx/fragment/app/FragmentManager;Ljava/lang/String;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception v0

    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    const-string v3, "\u6253\u5f00\u4e91\u5b58\u6863\u5bf9\u8bdd\u6846\u5931\u8d25: "

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v3

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-static {v1, v2, v0}, La0/l;->ll(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    const-string v0, "\u6253\u5f00\u4e91\u5b58\u6863\u5bf9\u8bdd\u6846\u5931\u8d25"

    invoke-virtual {p0, v0}, Lcom/hjgzs/rpgplugin/MainActivity;->showToastLong(Ljava/lang/String;)V

    :goto_0
    return-void
.end method

.method public onOpenDebug()V
    .locals 3

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->q:Lce/u1;

    if-eqz v0, :cond_0

    invoke-virtual {p0}, Landroid/app/Activity;->isFinishing()Z

    move-result v0

    if-nez v0, :cond_0

    invoke-virtual {p0}, Landroid/app/Activity;->isDestroyed()Z

    move-result v0

    if-nez v0, :cond_0

    goto :goto_0

    :cond_0
    const-string v0, "-TK-"

    const-string v1, "\u4e0d\u652f\u6301x5\u5185\u6838\uff0c\u8bf7\u91cd\u542f\u6e38\u620f"

    invoke-static {v0, v1}, La0/l;->a(Ljava/lang/String;Ljava/lang/String;)V

    invoke-virtual {p0}, Landroid/content/Context;->getApplicationContext()Landroid/content/Context;

    move-result-object v0

    const/4 v2, 0x0

    invoke-static {v0, v1, v2}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;

    move-result-object v0

    invoke-virtual {v0}, Landroid/widget/Toast;->show()V

    :goto_0
    return-void
.end method

.method public onPause()V
    .locals 4

    const-string v0, "-TK-"

    invoke-super {p0}, Landroidx/fragment/app/FragmentActivity;->onPause()V

    :try_start_0
    iget-object v1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    if-eqz v1, :cond_1

    invoke-virtual {p0}, Landroid/app/Activity;->isFinishing()Z

    move-result v1

    if-nez v1, :cond_0

    iget-boolean v1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->t:Z
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_1

    if-eqz v1, :cond_1

    :cond_0
    :try_start_1
    iget-object v1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    invoke-virtual {v1}, Lcom/tencent/smtt/sdk/WebView;->onPause()V

    const/4 v1, 0x1

    iput-boolean v1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->s:Z
    :try_end_1
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_0

    goto :goto_0

    :catch_0
    move-exception v1

    :try_start_2
    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    const-string v3, "WebView onPause\u5931\u8d25: "

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v3

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-static {v0, v2, v1}, La0/l;->ll(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    :cond_1
    :goto_0
    iget-object v1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->y:Landroid/os/Handler;

    if-eqz v1, :cond_2

    iget-object v2, p0, Lcom/hjgzs/rpgplugin/MainActivity;->z:Ljava/lang/Runnable;

    invoke-virtual {v1, v2}, Landroid/os/Handler;->removeCallbacks(Ljava/lang/Runnable;)V
    :try_end_2
    .catch Ljava/lang/Exception; {:try_start_2 .. :try_end_2} :catch_1

    goto :goto_1

    :catch_1
    move-exception v1

    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    const-string v3, "onPause\u65f6\u53d1\u751f\u5f02\u5e38: "

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v3

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-static {v0, v2, v1}, La0/l;->ll(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    :cond_2
    :goto_1
    return-void
.end method

.method public onPermissionsRequested()V
    .locals 0

    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->y()V

    return-void
.end method

.method public onRelationError(ILjava/lang/String;)V
    .locals 2

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "\u597d\u53cb\u7cfb\u7edf\u9519\u8bef: "

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string v1, " - "

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, p2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p2

    const-string v0, "-TK-"

    invoke-static {v0, p2}, La0/l;->i(Ljava/lang/String;Ljava/lang/String;)V

    const p2, 0x61a81

    if-ne p1, p2, :cond_0

    const-string p1, "\u8bf7\u5148\u767b\u5f55TapTap\u8d26\u53f7"

    const/4 p2, 0x0

    invoke-static {p0, p1, p2}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;

    move-result-object p1

    invoke-virtual {p1}, Landroid/widget/Toast;->show()V

    :cond_0
    return-void
.end method

.method public onRequestPermissionsResult(I[Ljava/lang/String;[I)V
    .locals 2
    .param p2    # [Ljava/lang/String;
        .annotation build Landroidx/annotation/NonNull;
        .end annotation
    .end param
    .param p3    # [I
        .annotation build Landroidx/annotation/NonNull;
        .end annotation
    .end param

    invoke-super {p0, p1, p2, p3}, Landroidx/fragment/app/FragmentActivity;->onRequestPermissionsResult(I[Ljava/lang/String;[I)V

    const/16 p2, 0x1f40

    if-ne p1, p2, :cond_1

    array-length p1, p3

    const/4 p2, 0x0

    :goto_0
    if-ge p2, p1, :cond_1

    aget v0, p3, p2

    const/4 v1, -0x1

    if-ne v0, v1, :cond_0

    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->M()V

    goto :goto_1

    :cond_0
    add-int/lit8 p2, p2, 0x1

    goto :goto_0

    :cond_1
    :goto_1
    return-void
.end method

.method public onResume()V
    .locals 5

    invoke-super {p0}, Landroidx/fragment/app/FragmentActivity;->onResume()V

    invoke-virtual {p0}, Landroid/app/Activity;->isFinishing()Z

    move-result v0

    const-string v1, "-TK-"

    if-nez v0, :cond_3

    invoke-virtual {p0}, Landroid/app/Activity;->isDestroyed()Z

    move-result v0

    if-eqz v0, :cond_0

    goto :goto_1

    :cond_0
    :try_start_0
    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    if-eqz v0, :cond_1

    invoke-virtual {v0}, Lcom/tencent/smtt/sdk/WebView;->resumeTimers()V

    # MOD补丁：登录失败也走 showGameView（仅一次），不再依赖 TapSDK 验证回调
    # 注：不再强制 setLayerType(SOFTWARE)——系统内核硬件层下 SOFTWARE 会导致 canvas 元素不被光栅化（DOM 上屏但游戏画面黑）
    sget-boolean v2, Lcom/hjgzs/rpgplugin/MainActivity;->__modVShown:Z

    if-nez v2, :cond_modv

    const/4 v2, 0x1

    sput-boolean v2, Lcom/hjgzs/rpgplugin/MainActivity;->__modVShown:Z

    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->V()V

    :cond_modv
    iget-boolean v2, p0, Lcom/hjgzs/rpgplugin/MainActivity;->s:Z

    if-eqz v2, :cond_1

    new-instance v2, Lce/b0;

    invoke-direct {v2, p0}, Lce/b0;-><init>(Lcom/hjgzs/rpgplugin/MainActivity;)V

    const-wide/16 v3, 0x64

    invoke-virtual {v0, v2, v3, v4}, Landroid/view/View;->postDelayed(Ljava/lang/Runnable;J)Z

    :cond_1
    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->y:Landroid/os/Handler;

    if-eqz v0, :cond_2

    iget-object v2, p0, Lcom/hjgzs/rpgplugin/MainActivity;->z:Ljava/lang/Runnable;

    invoke-virtual {v0, v2}, Landroid/os/Handler;->removeCallbacks(Ljava/lang/Runnable;)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->y:Landroid/os/Handler;

    iget-object v2, p0, Lcom/hjgzs/rpgplugin/MainActivity;->z:Ljava/lang/Runnable;

    const-wide/16 v3, 0x1388

    invoke-virtual {v0, v2, v3, v4}, Landroid/os/Handler;->postDelayed(Ljava/lang/Runnable;J)Z
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception v0

    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    const-string v3, "onResume\u65f6\u53d1\u751f\u5f02\u5e38: "

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v3

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-static {v1, v2, v0}, La0/l;->ll(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    :cond_2
    :goto_0
    return-void

    :cond_3
    :goto_1
    const-string v0, "Activity\u6b63\u5728\u9500\u6bc1\uff0c\u8df3\u8fc7onResume\u64cd\u4f5c"

    invoke-static {v1, v0}, La0/l;->a(Ljava/lang/String;Ljava/lang/String;)V

    return-void
.end method

.method public onRetryExhausted()V
    .locals 2

    const-string v0, "-TK-"

    const-string v1, "\u91cd\u8bd5\u6b21\u6570\u5df2\u8017\u5c3d"

    invoke-static {v0, v1}, La0/l;->i(Ljava/lang/String;Ljava/lang/String;)V

    return-void
.end method

.method public onReviewClick()V
    .locals 2

    const-string v0, "-TK-"

    const-string v1, "\u60ac\u6d6e\u83dc\u5355\uff1a\u8bc4\u8bba\u529f\u80fd\u70b9\u51fb"

    invoke-static {v0, v1}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->II:Lcom/hjgzs/rpgplugin/ll;

    if-eqz v0, :cond_0

    invoke-virtual {v0}, Lcom/hjgzs/rpgplugin/ll;->T()V

    :cond_0
    return-void
.end method

.method public onSaveClick()V
    .locals 4

    const-string v0, "\u60ac\u6d6e\u83dc\u5355\uff1a\u5b58\u6863\u529f\u80fd\u70b9\u51fb"

    const-string v1, "-TK-"

    invoke-static {v1, v0}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    :try_start_0
    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    invoke-static {v0}, Lcom/hjgzs/rpgplugin/CloudSaveDialogFragment;->aa(Lcom/hjgzs/rpgplugin/X5WebView;)Lcom/hjgzs/rpgplugin/CloudSaveDialogFragment;

    move-result-object v0

    invoke-virtual {p0}, Landroidx/fragment/app/FragmentActivity;->getSupportFragmentManager()Landroidx/fragment/app/FragmentManager;

    move-result-object v2

    const-string v3, "CloudSaveDialog"

    invoke-virtual {v0, v2, v3}, Landroidx/fragment/app/DialogFragment;->show(Landroidx/fragment/app/FragmentManager;Ljava/lang/String;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception v0

    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    const-string v3, "\u6253\u5f00\u4e91\u5b58\u6863\u5bf9\u8bdd\u6846\u5931\u8d25: "

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v3

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-static {v1, v2, v0}, La0/l;->ll(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    const-string v0, "\u6253\u5f00\u4e91\u5b58\u6863\u5bf9\u8bdd\u6846\u5931\u8d25"

    invoke-virtual {p0, v0}, Lcom/hjgzs/rpgplugin/MainActivity;->showToastLong(Ljava/lang/String;)V

    :goto_0
    return-void
.end method

.method public onShareClick()V
    .locals 3

    const-string v0, "-TK-"

    const-string v1, "\u60ac\u6d6e\u83dc\u5355\uff1a\u5206\u4eab\u529f\u80fd\u70b9\u51fb"

    invoke-static {v0, v1}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->II:Lcom/hjgzs/rpgplugin/ll;

    if-eqz v0, :cond_0

    const-string v1, "\u6211\u5728\u73a9\u300a\u518d\u5237\u4e00\u628a2\uff1a\u91d1\u8272\u4f20\u8bf4\u300b\uff01"

    const-string v2, "\u8fd9\u4e2a\u6e38\u620f\u592a\u6709\u8da3\u4e86\uff0c\u5feb\u6765\u4e00\u8d77\u73a9\u5427\uff01"

    invoke-virtual {v0, v1, v2}, Lcom/hjgzs/rpgplugin/ll;->f0(Ljava/lang/String;Ljava/lang/String;)V

    :cond_0
    return-void
.end method

.method public onTrimMemory(I)V
    .locals 3

    invoke-super {p0, p1}, Landroid/app/Activity;->onTrimMemory(I)V

    const/4 v0, 0x5

    const-string v1, "-TK-"

    if-eq p1, v0, :cond_4

    const/16 v0, 0xa

    if-eq p1, v0, :cond_3

    const/16 v0, 0xf

    if-eq p1, v0, :cond_2

    const/16 v0, 0x14

    if-eq p1, v0, :cond_0

    :try_start_0
    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v2, "\u5185\u5b58\u4fee\u526a\u7ea7\u522b: "

    invoke-virtual {v0, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-static {v1, p1}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    goto :goto_1

    :cond_0
    const-string p1, "UI\u5df2\u9690\u85cf,\u89e6\u53d1\u5783\u573e\u56de\u6536"

    invoke-static {v1, p1}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    :cond_1
    :goto_0
    invoke-static {}, Ljava/lang/System;->gc()V

    goto :goto_1

    :cond_2
    const-string p1, "\u5185\u5b58\u6781\u5ea6\u7d27\u5f20(RUNNING_CRITICAL)!\u5f3a\u5236\u6e05\u7406\u7f13\u5b58"

    invoke-static {v1, p1}, La0/l;->i(Ljava/lang/String;Ljava/lang/String;)V

    iget-object p1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    if-eqz p1, :cond_1

    const/4 v0, 0x1

    invoke-virtual {p1, v0}, Lcom/tencent/smtt/sdk/WebView;->clearCache(Z)V

    iget-object p1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    invoke-virtual {p1}, Lcom/tencent/smtt/sdk/WebView;->clearHistory()V

    goto :goto_0

    :cond_3
    const-string p1, "\u5185\u5b58\u7d27\u5f20(RUNNING_LOW),\u6e05\u7406\u7f13\u5b58"

    invoke-static {v1, p1}, La0/l;->a(Ljava/lang/String;Ljava/lang/String;)V

    iget-object p1, p0, Lcom/hjgzs/rpgplugin/MainActivity;->O:Lcom/hjgzs/rpgplugin/X5WebView;

    if-eqz p1, :cond_5

    const/4 v0, 0x0

    invoke-virtual {p1, v0}, Lcom/tencent/smtt/sdk/WebView;->clearCache(Z)V

    goto :goto_1

    :cond_4
    const-string p1, "\u5185\u5b58\u5f00\u59cb\u7d27\u5f20(RUNNING_MODERATE)"

    invoke-static {v1, p1}, La0/l;->Il(Ljava/lang/String;Ljava/lang/String;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception p1

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v2, "onTrimMemory\u5904\u7406\u5931\u8d25: "

    invoke-virtual {v0, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p1}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v0, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-static {v1, v0, p1}, La0/l;->ll(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    :cond_5
    :goto_1
    return-void
.end method

.method public onUnreadMessageCountChanged(I)V
    .locals 3

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "\u672a\u8bfb\u6d88\u606f\u6570: "

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    const-string v1, "-TK-"

    invoke-static {v1, v0}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->Il:Lcom/hjgzs/rpgplugin/l;

    if-eqz v0, :cond_0

    invoke-virtual {p0}, Landroid/app/Activity;->isFinishing()Z

    move-result v0

    if-nez v0, :cond_0

    invoke-virtual {p0}, Landroid/app/Activity;->isDestroyed()Z

    move-result v0

    if-nez v0, :cond_0

    :try_start_0
    iget-object v0, p0, Lcom/hjgzs/rpgplugin/MainActivity;->Il:Lcom/hjgzs/rpgplugin/l;

    invoke-virtual {v0, p1}, Lcom/hjgzs/rpgplugin/l;->f0(I)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception p1

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v2, "\u66f4\u65b0\u672a\u8bfb\u6d88\u606f\u6570\u65f6\u53d1\u751f\u5f02\u5e38: "

    invoke-virtual {v0, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p1}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v0, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-static {v1, v0, p1}, La0/l;->ll(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)V

    :cond_0
    :goto_0
    return-void
.end method

.method public openWeb(Ljava/lang/String;)V
    .locals 2

    new-instance v0, Landroid/content/Intent;

    const-string v1, "android.intent.action.VIEW"

    invoke-direct {v0, v1}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    invoke-static {p1}, Landroid/net/Uri;->parse(Ljava/lang/String;)Landroid/net/Uri;

    move-result-object p1

    invoke-virtual {v0, p1}, Landroid/content/Intent;->setData(Landroid/net/Uri;)Landroid/content/Intent;

    invoke-virtual {p0, v0}, Landroid/content/Context;->startActivity(Landroid/content/Intent;)V

    return-void
.end method

.method public showToast(Ljava/lang/String;)V
    .locals 2

    invoke-virtual {p0}, Landroid/content/Context;->getApplicationContext()Landroid/content/Context;

    move-result-object v0

    const/4 v1, 0x0

    invoke-static {v0, p1, v1}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;

    move-result-object p1

    invoke-virtual {p1}, Landroid/widget/Toast;->show()V

    return-void
.end method

.method public showToastLong(Ljava/lang/String;)V
    .locals 2

    invoke-virtual {p0}, Landroid/content/Context;->getApplicationContext()Landroid/content/Context;

    move-result-object v0

    const/4 v1, 0x1

    invoke-static {v0, p1, v1}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;

    move-result-object p1

    invoke-virtual {p1}, Landroid/widget/Toast;->show()V

    return-void
.end method

.method public final x()Z
    .locals 6

    const-string v0, "PermissionPrefs"

    const/4 v1, 0x0

    invoke-virtual {p0, v0, v1}, Landroid/content/Context;->getSharedPreferences(Ljava/lang/String;I)Landroid/content/SharedPreferences;

    move-result-object v0

    const-string v2, "lastDeniedTime"

    const-wide/16 v3, 0x0

    invoke-interface {v0, v2, v3, v4}, Landroid/content/SharedPreferences;->getLong(Ljava/lang/String;J)J

    move-result-wide v2

    invoke-static {}, Ljava/lang/System;->currentTimeMillis()J

    move-result-wide v4

    sub-long/2addr v4, v2

    const-wide/32 v2, 0xa4cb800

    cmp-long v0, v4, v2

    if-ltz v0, :cond_0

    const/4 v1, 0x1

    :cond_0
    return v1
.end method

.method public final y()V
    .locals 7

    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v1, 0x17

    if-lt v0, v1, :cond_3

    invoke-virtual {p0}, Lcom/hjgzs/rpgplugin/MainActivity;->x()Z

    move-result v0

    if-nez v0, :cond_0

    const-string v0, "\u60a8\u5df2\u62d2\u7edd\u6743\u9650\u7533\u8bf7\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002"

    invoke-virtual {p0, v0}, Lcom/hjgzs/rpgplugin/MainActivity;->showToast(Ljava/lang/String;)V

    return-void

    :cond_0
    new-instance v0, Ljava/util/ArrayList;

    invoke-direct {v0}, Ljava/util/ArrayList;-><init>()V

    sget-object v1, Lce/p;->bf:[Ljava/lang/String;

    array-length v2, v1

    const/4 v3, 0x0

    const/4 v4, 0x0

    :goto_0
    if-ge v4, v2, :cond_2

    aget-object v5, v1, v4

    invoke-virtual {p0, v5}, Landroid/app/Activity;->checkSelfPermission(Ljava/lang/String;)I

    move-result v6

    if-eqz v6, :cond_1

    invoke-interface {v0, v5}, Ljava/util/List;->add(Ljava/lang/Object;)Z

    :cond_1
    add-int/lit8 v4, v4, 0x1

    goto :goto_0

    :cond_2
    invoke-interface {v0}, Ljava/util/List;->isEmpty()Z

    move-result v1

    if-nez v1, :cond_3

    new-array v1, v3, [Ljava/lang/String;

    invoke-interface {v0, v1}, Ljava/util/List;->toArray([Ljava/lang/Object;)[Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Ljava/lang/String;

    const/16 v1, 0x1f40

    invoke-virtual {p0, v0, v1}, Landroid/app/Activity;->requestPermissions([Ljava/lang/String;I)V

    :cond_3
    return-void
.end method

.method public final z()V
    .locals 2

    sget-object v0, Lcd/a;->o:Lcd/a$o;

    invoke-virtual {v0}, Lcd/a$o;->o()Lcd/a;

    move-result-object v0

    new-instance v1, Lcom/hjgzs/rpgplugin/MainActivity$l;

    invoke-direct {v1, p0}, Lcom/hjgzs/rpgplugin/MainActivity$l;-><init>(Lcom/hjgzs/rpgplugin/MainActivity;)V

    invoke-virtual {v0, p0, v1}, Lcd/a;->o(Landroidx/appcompat/app/AppCompatActivity;Lcd/I;)V

    return-void
.end method
