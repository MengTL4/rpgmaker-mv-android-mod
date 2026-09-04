.class public final Lcom/bumptech/glide/manager/m$ll;
.super Ljava/lang/Object;
.source "SourceFile"

# interfaces
.implements Lcom/bumptech/glide/manager/m$I;


# annotations
.annotation build Landroidx/annotation/RequiresApi;
    value = 0x18
.end annotation

.annotation system Ldalvik/annotation/EnclosingClass;
    value = Lcom/bumptech/glide/manager/m;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x19
    name = "ll"
.end annotation


# instance fields
.field public final I:Landroid/net/ConnectivityManager$NetworkCallback;

.field public final O:Lcom/bumptech/glide/manager/l$o;

.field public final l:Lab/II$l;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "Lab/II$l<",
            "Landroid/net/ConnectivityManager;",
            ">;"
        }
    .end annotation
.end field

.field public o:Z


# direct methods
.method public constructor <init>(Lab/II$l;Lcom/bumptech/glide/manager/l$o;)V
    .locals 1
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Lab/II$l<",
            "Landroid/net/ConnectivityManager;",
            ">;",
            "Lcom/bumptech/glide/manager/l$o;",
            ")V"
        }
    .end annotation

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Lcom/bumptech/glide/manager/m$ll$o;

    invoke-direct {v0, p0}, Lcom/bumptech/glide/manager/m$ll$o;-><init>(Lcom/bumptech/glide/manager/m$ll;)V

    iput-object v0, p0, Lcom/bumptech/glide/manager/m$ll;->I:Landroid/net/ConnectivityManager$NetworkCallback;

    iput-object p1, p0, Lcom/bumptech/glide/manager/m$ll;->l:Lab/II$l;

    iput-object p2, p0, Lcom/bumptech/glide/manager/m$ll;->O:Lcom/bumptech/glide/manager/l$o;

    return-void
.end method


# virtual methods
.method public O()V
    .locals 2

    iget-object v0, p0, Lcom/bumptech/glide/manager/m$ll;->l:Lab/II$l;

    invoke-interface {v0}, Lab/II$l;->get()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Landroid/net/ConnectivityManager;

    iget-object v1, p0, Lcom/bumptech/glide/manager/m$ll;->I:Landroid/net/ConnectivityManager$NetworkCallback;

    invoke-virtual {v0, v1}, Landroid/net/ConnectivityManager;->unregisterNetworkCallback(Landroid/net/ConnectivityManager$NetworkCallback;)V

    return-void
.end method

.method public o()Z
    .locals 4
    .annotation build Landroid/annotation/SuppressLint;
        value = {
            "MissingPermission"
        }
    .end annotation

    iget-object v0, p0, Lcom/bumptech/glide/manager/m$ll;->l:Lab/II$l;

    invoke-interface {v0}, Lab/II$l;->get()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Landroid/net/ConnectivityManager;

    invoke-virtual {v0}, Landroid/net/ConnectivityManager;->getActiveNetwork()Landroid/net/Network;

    move-result-object v0

    const/4 v1, 0x1

    const/4 v2, 0x0

    if-eqz v0, :cond_0

    const/4 v0, 0x1

    goto :goto_0

    :cond_0
    const/4 v0, 0x0

    :goto_0
    iput-boolean v0, p0, Lcom/bumptech/glide/manager/m$ll;->o:Z

    :try_start_0
    iget-object v0, p0, Lcom/bumptech/glide/manager/m$ll;->l:Lab/II$l;

    invoke-interface {v0}, Lab/II$l;->get()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Landroid/net/ConnectivityManager;

    iget-object v3, p0, Lcom/bumptech/glide/manager/m$ll;->I:Landroid/net/ConnectivityManager$NetworkCallback;

    invoke-static {v0, v3}, Lcom/bumptech/glide/manager/n;->o(Landroid/net/ConnectivityManager;Landroid/net/ConnectivityManager$NetworkCallback;)V
    :try_end_0
    .catch Ljava/lang/RuntimeException; {:try_start_0 .. :try_end_0} :catch_0

    return v1

    :catch_0
    const-string v0, "ConnectivityMonitor"

    const/4 v1, 0x5

    invoke-static {v0, v1}, Landroid/util/Log;->isLoggable(Ljava/lang/String;I)Z

    return v2
.end method
