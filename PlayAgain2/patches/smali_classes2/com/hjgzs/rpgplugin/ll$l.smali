.class public Lcom/hjgzs/rpgplugin/ll$l;
.super Ljava/lang/Object;
.source "SourceFile"

# interfaces
.implements Lcom/taptap/sdk/kit/internal/callback/TapTapCallback;


# annotations
.annotation system Ldalvik/annotation/EnclosingMethod;
    value = Lcom/hjgzs/rpgplugin/ll;->m0(Lcom/hjgzs/rpgplugin/ll$b;)V
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x1
    name = null
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Object;",
        "Lcom/taptap/sdk/kit/internal/callback/TapTapCallback<",
        "Lcom/taptap/sdk/login/TapTapAccount;",
        ">;"
    }
.end annotation


# instance fields
.field public final synthetic O:Lcom/hjgzs/rpgplugin/ll;

.field public final synthetic o:Lcom/hjgzs/rpgplugin/ll$b;


# direct methods
.method public constructor <init>(Lcom/hjgzs/rpgplugin/ll;Lcom/hjgzs/rpgplugin/ll$b;)V
    .locals 0
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()V"
        }
    .end annotation

    iput-object p1, p0, Lcom/hjgzs/rpgplugin/ll$l;->O:Lcom/hjgzs/rpgplugin/ll;

    iput-object p2, p0, Lcom/hjgzs/rpgplugin/ll$l;->o:Lcom/hjgzs/rpgplugin/ll$b;

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method

.method public static synthetic O(Ljava/lang/String;Lcom/hjgzs/rpgplugin/ll$c;)V
    .locals 0

    invoke-interface {p1, p0}, Lcom/hjgzs/rpgplugin/ll$c;->onLoginFailed(Ljava/lang/String;)V

    return-void
.end method

.method public static synthetic o(Ljava/lang/String;Lcom/hjgzs/rpgplugin/ll$c;)V
    .locals 0

    invoke-static {p0, p1}, Lcom/hjgzs/rpgplugin/ll$l;->O(Ljava/lang/String;Lcom/hjgzs/rpgplugin/ll$c;)V

    return-void
.end method


# virtual methods
.method public l(Lcom/taptap/sdk/login/TapTapAccount;)V
    .locals 2

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "TapTap\u767b\u5f55\u6210\u529f: "

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p1}, Lcom/taptap/sdk/login/TapTapAccount;->getOpenId()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    const-string v1, "-TK-"

    invoke-static {v1, v0}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/ll$l;->O:Lcom/hjgzs/rpgplugin/ll;

    invoke-static {v0}, Lcom/hjgzs/rpgplugin/ll;->a(Lcom/hjgzs/rpgplugin/ll;)Ljava/util/concurrent/atomic/AtomicInteger;

    move-result-object v0

    const/4 v1, 0x0

    invoke-virtual {v0, v1}, Ljava/util/concurrent/atomic/AtomicInteger;->set(I)V

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/ll$l;->O:Lcom/hjgzs/rpgplugin/ll;

    invoke-static {v0}, Lcom/hjgzs/rpgplugin/ll;->b(Lcom/hjgzs/rpgplugin/ll;)Landroid/app/Activity;

    move-result-object v0

    if-eqz v0, :cond_0

    invoke-virtual {p1}, Lcom/taptap/sdk/login/TapTapAccount;->getOpenId()Ljava/lang/String;

    move-result-object p1

    invoke-static {v0, p1}, Lcom/taptap/sdk/compliance/TapTapCompliance;->startup(Landroid/app/Activity;Ljava/lang/String;)V

    :cond_0
    iget-object p1, p0, Lcom/hjgzs/rpgplugin/ll$l;->O:Lcom/hjgzs/rpgplugin/ll;

    new-instance v0, Lce/s0;

    invoke-direct {v0}, Lce/s0;-><init>()V

    invoke-virtual {p1, v0}, Lcom/hjgzs/rpgplugin/ll;->Q(Lcom/hjgzs/rpgplugin/ll$II;)V

    return-void
.end method

.method public onCancel()V
    .locals 2

    const-string v0, "-TK-"

    const-string v1, "TapTap\u767b\u5f55\u53d6\u6d88"

    invoke-static {v0, v1}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    # MOD补丁：登录取消不退出
    return-void

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/ll$l;->O:Lcom/hjgzs/rpgplugin/ll;

    new-instance v1, Lce/p0;

    invoke-direct {v1}, Lce/p0;-><init>()V

    invoke-virtual {v0, v1}, Lcom/hjgzs/rpgplugin/ll;->Q(Lcom/hjgzs/rpgplugin/ll$II;)V

    return-void
.end method

.method public onFail(Lcom/taptap/sdk/kit/internal/exception/TapTapException;)V
    .locals 2
    .param p1    # Lcom/taptap/sdk/kit/internal/exception/TapTapException;
        .annotation build Landroidx/annotation/NonNull;
        .end annotation
    .end param

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "TapTap\u767b\u5f55\u5931\u8d25: "

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p1}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    const-string v1, "-TK-"

    invoke-static {v1, v0}, La0/l;->i(Ljava/lang/String;Ljava/lang/String;)V

    # MOD补丁：登录失败不重试不退出，webview 已加载、hook.js 会自动启动游戏
    return-void

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/ll$l;->O:Lcom/hjgzs/rpgplugin/ll;

    invoke-static {v0}, Lcom/hjgzs/rpgplugin/ll;->c(Lcom/hjgzs/rpgplugin/ll;)Z

    move-result v0

    if-eqz v0, :cond_0

    new-instance p1, Ljava/lang/StringBuilder;

    invoke-direct {p1}, Ljava/lang/StringBuilder;-><init>()V

    const-string v0, "\u767b\u5f55\u5931\u8d25\uff0c\u5c1d\u8bd5\u91cd\u8bd5: "

    invoke-virtual {p1, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/ll$l;->O:Lcom/hjgzs/rpgplugin/ll;

    invoke-static {v0}, Lcom/hjgzs/rpgplugin/ll;->a(Lcom/hjgzs/rpgplugin/ll;)Ljava/util/concurrent/atomic/AtomicInteger;

    move-result-object v0

    invoke-virtual {v0}, Ljava/util/concurrent/atomic/AtomicInteger;->get()I

    move-result v0

    invoke-virtual {p1, v0}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {p1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-static {v1, p1}, La0/l;->O(Ljava/lang/String;Ljava/lang/String;)V

    iget-object p1, p0, Lcom/hjgzs/rpgplugin/ll$l;->O:Lcom/hjgzs/rpgplugin/ll;

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/ll$l;->o:Lcom/hjgzs/rpgplugin/ll$b;

    invoke-virtual {p1, v0}, Lcom/hjgzs/rpgplugin/ll;->m0(Lcom/hjgzs/rpgplugin/ll$b;)V

    goto :goto_0

    :cond_0
    invoke-virtual {p1}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object p1

    iget-object v0, p0, Lcom/hjgzs/rpgplugin/ll$l;->O:Lcom/hjgzs/rpgplugin/ll;

    new-instance v1, Lce/q0;

    invoke-direct {v1, p1}, Lce/q0;-><init>(Ljava/lang/String;)V

    invoke-virtual {v0, v1}, Lcom/hjgzs/rpgplugin/ll;->Q(Lcom/hjgzs/rpgplugin/ll$II;)V

    iget-object p1, p0, Lcom/hjgzs/rpgplugin/ll$l;->O:Lcom/hjgzs/rpgplugin/ll;

    new-instance v0, Lce/r0;

    invoke-direct {v0}, Lce/r0;-><init>()V

    invoke-virtual {p1, v0}, Lcom/hjgzs/rpgplugin/ll;->Q(Lcom/hjgzs/rpgplugin/ll$II;)V

    :goto_0
    return-void
.end method

.method public bridge synthetic onSuccess(Ljava/lang/Object;)V
    .locals 0

    check-cast p1, Lcom/taptap/sdk/login/TapTapAccount;

    invoke-virtual {p0, p1}, Lcom/hjgzs/rpgplugin/ll$l;->l(Lcom/taptap/sdk/login/TapTapAccount;)V

    return-void
.end method
