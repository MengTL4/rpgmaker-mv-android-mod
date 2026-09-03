.class public final Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;
.super Ljava/lang/Object;
.source "SourceFile"


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Lcom/taptap/sdk/initializer/repository/GatekeeperRepository$Companion;
    }
.end annotation

.annotation runtime Lkotlin/Metadata;
    d1 = {
        "\u0000X\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\u0008\u0003\n\u0002\u0010\u000b\n\u0000\n\u0002\u0018\u0002\n\u0002\u0008\u0002\n\u0002\u0018\u0002\n\u0002\u0008\u0002\n\u0002\u0018\u0002\n\u0002\u0008\u0002\n\u0002\u0018\u0002\n\u0002\u0008\u0004\n\u0002\u0018\u0002\n\u0002\u0008\u0002\n\u0002\u0018\u0002\n\u0002\u0008\u000c\u0018\u0000 *2\u00020\u0001:\u0001*B\u001f\u0012\u0006\u0010\u000f\u001a\u00020\u000e\u0012\u0006\u0010\u0012\u001a\u00020\u0011\u0012\u0006\u0010\u0015\u001a\u00020\u0014\u00a2\u0006\u0004\u0008(\u0010)J\n\u0010\u0003\u001a\u0004\u0018\u00010\u0002H\u0002J\u0010\u0010\u0007\u001a\u00020\u00062\u0006\u0010\u0005\u001a\u00020\u0004H\u0002J\u0006\u0010\t\u001a\u00020\u0008J\u0006\u0010\n\u001a\u00020\u0002J\u0006\u0010\u000b\u001a\u00020\u0006J\u0006\u0010\r\u001a\u00020\u000cR\u0014\u0010\u000f\u001a\u00020\u000e8\u0002X\u0082\u0004\u00a2\u0006\u0006\n\u0004\u0008\u000f\u0010\u0010R\u0014\u0010\u0012\u001a\u00020\u00118\u0002X\u0082\u0004\u00a2\u0006\u0006\n\u0004\u0008\u0012\u0010\u0013R\u0014\u0010\u0015\u001a\u00020\u00148\u0002X\u0082\u0004\u00a2\u0006\u0006\n\u0004\u0008\u0015\u0010\u0016R\u0014\u0010\u0018\u001a\u00020\u00178\u0002X\u0082\u0004\u00a2\u0006\u0006\n\u0004\u0008\u0018\u0010\u0019R\u0014\u0010\u001a\u001a\u00020\u00028\u0002X\u0082\u0004\u00a2\u0006\u0006\n\u0004\u0008\u001a\u0010\u001bR\u001a\u0010\u001d\u001a\u0008\u0012\u0004\u0012\u00020\u00020\u001c8\u0002X\u0082\u0004\u00a2\u0006\u0006\n\u0004\u0008\u001d\u0010\u001eR\u001d\u0010 \u001a\u0008\u0012\u0004\u0012\u00020\u00020\u001f8\u0006\u00a2\u0006\u000c\n\u0004\u0008 \u0010!\u001a\u0004\u0008\"\u0010#R\u0016\u0010$\u001a\u00020\u000c8\u0002@\u0002X\u0082\u000e\u00a2\u0006\u0006\n\u0004\u0008$\u0010%R\u0018\u0010&\u001a\u0004\u0018\u00010\u00048\u0002@\u0002X\u0082\u000e\u00a2\u0006\u0006\n\u0004\u0008&\u0010\'\u00a8\u0006+"
    }
    d2 = {
        "Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;",
        "",
        "Lcom/taptap/sdk/initializer/data/response/GateKeeper;",
        "getGateKeeperFromDisk",
        "Lcom/taptap/sdk/common/network/throwable/TapNetworkException;",
        "tapNetworkException",
        "Lt0/w1;",
        "showErrorToast",
        "Lkotlinx/coroutines/r1;",
        "initialize",
        "getCurrentGateKeeper",
        "showGatekeeperError",
        "",
        "isGatekeeperLoadedSuccessfully",
        "Landroid/content/Context;",
        "context",
        "Landroid/content/Context;",
        "Lcom/taptap/sdk/initializer/repository/remote/GatekeeperApiService;",
        "apiService",
        "Lcom/taptap/sdk/initializer/repository/remote/GatekeeperApiService;",
        "Lcom/taptap/sdk/initializer/repository/local/GatekeeperStorage;",
        "storage",
        "Lcom/taptap/sdk/initializer/repository/local/GatekeeperStorage;",
        "Lkotlinx/coroutines/ce;",
        "scope",
        "Lkotlinx/coroutines/ce;",
        "memoryData",
        "Lcom/taptap/sdk/initializer/data/response/GateKeeper;",
        "Lkotlinx/coroutines/flow/z;",
        "_gateKeeperFlow",
        "Lkotlinx/coroutines/flow/z;",
        "Lkotlinx/coroutines/flow/b;",
        "gateKeeperFlow",
        "Lkotlinx/coroutines/flow/b;",
        "getGateKeeperFlow",
        "()Lkotlinx/coroutines/flow/b;",
        "loadGatekeeperSuccess",
        "Z",
        "gatekeeperError",
        "Lcom/taptap/sdk/common/network/throwable/TapNetworkException;",
        "<init>",
        "(Landroid/content/Context;Lcom/taptap/sdk/initializer/repository/remote/GatekeeperApiService;Lcom/taptap/sdk/initializer/repository/local/GatekeeperStorage;)V",
        "Companion",
        "tap-initializer_release"
    }
    k = 0x1
    mv = {
        0x1,
        0x5,
        0x1
    }
.end annotation


# static fields
.field public static final Companion:Lcom/taptap/sdk/initializer/repository/GatekeeperRepository$Companion;
    .annotation build Ld3/ll;
    .end annotation
.end field

.field private static final DEFAULT_GATEKEEPER_ERROR_TOAST:Ljava/lang/String; = "\u5f53\u524d\u5e94\u7528\u521d\u59cb\u5316\u4fe1\u606f\u9519\u8bef, \u8bf7\u5728 TapTap \u5f00\u53d1\u8005\u4e2d\u5fc3\u68c0\u67e5[\u5f53\u524d\u5e94\u7528\u5305\u540d]\u4e0e[\u8c03\u7528\u521d\u59cb\u5316\u63a5\u53e3\u8bbe\u7f6e\u7684 clientId \u3001clientToken]\u662f\u5426\u5339\u914d"
    .annotation build Ld3/ll;
    .end annotation
.end field


# instance fields
.field private final _gateKeeperFlow:Lkotlinx/coroutines/flow/z;
    .annotation build Ld3/ll;
    .end annotation

    .annotation system Ldalvik/annotation/Signature;
        value = {
            "Lkotlinx/coroutines/flow/z<",
            "Lcom/taptap/sdk/initializer/data/response/GateKeeper;",
            ">;"
        }
    .end annotation
.end field

.field private final apiService:Lcom/taptap/sdk/initializer/repository/remote/GatekeeperApiService;
    .annotation build Ld3/ll;
    .end annotation
.end field

.field private final context:Landroid/content/Context;
    .annotation build Ld3/ll;
    .end annotation
.end field

.field private final gateKeeperFlow:Lkotlinx/coroutines/flow/b;
    .annotation build Ld3/ll;
    .end annotation

    .annotation system Ldalvik/annotation/Signature;
        value = {
            "Lkotlinx/coroutines/flow/b<",
            "Lcom/taptap/sdk/initializer/data/response/GateKeeper;",
            ">;"
        }
    .end annotation
.end field

.field private gatekeeperError:Lcom/taptap/sdk/common/network/throwable/TapNetworkException;
    .annotation build Ld3/lI;
    .end annotation
.end field

.field private loadGatekeeperSuccess:Z

.field private final memoryData:Lcom/taptap/sdk/initializer/data/response/GateKeeper;
    .annotation build Ld3/ll;
    .end annotation
.end field

.field private final scope:Lkotlinx/coroutines/ce;
    .annotation build Ld3/ll;
    .end annotation
.end field

.field private final storage:Lcom/taptap/sdk/initializer/repository/local/GatekeeperStorage;
    .annotation build Ld3/ll;
    .end annotation
.end field


# direct methods
.method public static constructor <clinit>()V
    .locals 2

    new-instance v0, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository$Companion;

    const/4 v1, 0x0

    invoke-direct {v0, v1}, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository$Companion;-><init>(Lkotlin/jvm/internal/s;)V

    sput-object v0, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->Companion:Lcom/taptap/sdk/initializer/repository/GatekeeperRepository$Companion;

    return-void
.end method

.method public constructor <init>(Landroid/content/Context;Lcom/taptap/sdk/initializer/repository/remote/GatekeeperApiService;Lcom/taptap/sdk/initializer/repository/local/GatekeeperStorage;)V
    .locals 7
    .param p1    # Landroid/content/Context;
        .annotation build Ld3/ll;
        .end annotation
    .end param
    .param p2    # Lcom/taptap/sdk/initializer/repository/remote/GatekeeperApiService;
        .annotation build Ld3/ll;
        .end annotation
    .end param
    .param p3    # Lcom/taptap/sdk/initializer/repository/local/GatekeeperStorage;
        .annotation build Ld3/ll;
        .end annotation
    .end param

    const-string v0, "context"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/bb;->g(Ljava/lang/Object;Ljava/lang/String;)V

    const-string v0, "apiService"

    invoke-static {p2, v0}, Lkotlin/jvm/internal/bb;->g(Ljava/lang/Object;Ljava/lang/String;)V

    const-string v0, "storage"

    invoke-static {p3, v0}, Lkotlin/jvm/internal/bb;->g(Ljava/lang/Object;Ljava/lang/String;)V

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    iput-object p1, p0, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->context:Landroid/content/Context;

    iput-object p2, p0, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->apiService:Lcom/taptap/sdk/initializer/repository/remote/GatekeeperApiService;

    iput-object p3, p0, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->storage:Lcom/taptap/sdk/initializer/repository/local/GatekeeperStorage;

    invoke-static {}, Lkotlinx/coroutines/q0;->l()Lkotlinx/coroutines/be;

    move-result-object p1

    const/4 p2, 0x0

    const/4 p3, 0x1

    invoke-static {p2, p3, p2}, Lkotlinx/coroutines/v2;->l(Lkotlinx/coroutines/r1;ILjava/lang/Object;)Lkotlinx/coroutines/y;

    move-result-object v0

    invoke-virtual {p1, v0}, Lc1/o;->plus(Lc1/II;)Lc1/II;

    move-result-object p1

    invoke-static {p1}, Lkotlinx/coroutines/cf;->o(Lc1/II;)Lkotlinx/coroutines/ce;

    move-result-object p1

    iput-object p1, p0, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->scope:Lkotlinx/coroutines/ce;

    new-instance p1, Lcom/taptap/sdk/initializer/data/response/GateKeeper;

    new-instance v1, Lcom/taptap/sdk/initializer/data/response/GateKeeper$Switch;

    invoke-direct {v1, p3, p3}, Lcom/taptap/sdk/initializer/data/response/GateKeeper$Switch;-><init>(ZZ)V

    const/4 v2, 0x0

    const/4 v3, 0x0

    const/4 v4, 0x0

    const/16 v5, 0xe

    const/4 v6, 0x0

    move-object v0, p1

    invoke-direct/range {v0 .. v6}, Lcom/taptap/sdk/initializer/data/response/GateKeeper;-><init>(Lcom/taptap/sdk/initializer/data/response/GateKeeper$Switch;Ljava/lang/Integer;Lcom/taptap/sdk/initializer/data/response/GateKeeper$Urls;Lcom/taptap/sdk/initializer/data/response/GateKeeper$SdkConfig;ILkotlin/jvm/internal/s;)V

    iput-object p1, p0, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->memoryData:Lcom/taptap/sdk/initializer/data/response/GateKeeper;

    const/4 p1, 0x0

    const/4 v0, 0x6

    invoke-static {p3, p1, p2, v0, p2}, Lkotlinx/coroutines/flow/ba;->O(IILm2/f;ILjava/lang/Object;)Lkotlinx/coroutines/flow/z;

    move-result-object p1

    iput-object p1, p0, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->_gateKeeperFlow:Lkotlinx/coroutines/flow/z;

    invoke-static {p1}, Lkotlinx/coroutines/flow/d;->J(Lkotlinx/coroutines/flow/b;)Lkotlinx/coroutines/flow/b;

    move-result-object p1

    iput-object p1, p0, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->gateKeeperFlow:Lkotlinx/coroutines/flow/b;

    iput-boolean p3, p0, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->loadGatekeeperSuccess:Z

    return-void
.end method

.method public static final synthetic access$getApiService$p(Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;)Lcom/taptap/sdk/initializer/repository/remote/GatekeeperApiService;
    .locals 0

    iget-object p0, p0, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->apiService:Lcom/taptap/sdk/initializer/repository/remote/GatekeeperApiService;

    return-object p0
.end method

.method public static final synthetic access$getContext$p(Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;)Landroid/content/Context;
    .locals 0

    iget-object p0, p0, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->context:Landroid/content/Context;

    return-object p0
.end method

.method public static final synthetic access$getGateKeeperFromDisk(Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;)Lcom/taptap/sdk/initializer/data/response/GateKeeper;
    .locals 0

    invoke-direct {p0}, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->getGateKeeperFromDisk()Lcom/taptap/sdk/initializer/data/response/GateKeeper;

    move-result-object p0

    return-object p0
.end method

.method public static final synthetic access$getMemoryData$p(Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;)Lcom/taptap/sdk/initializer/data/response/GateKeeper;
    .locals 0

    iget-object p0, p0, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->memoryData:Lcom/taptap/sdk/initializer/data/response/GateKeeper;

    return-object p0
.end method

.method public static final synthetic access$getStorage$p(Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;)Lcom/taptap/sdk/initializer/repository/local/GatekeeperStorage;
    .locals 0

    iget-object p0, p0, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->storage:Lcom/taptap/sdk/initializer/repository/local/GatekeeperStorage;

    return-object p0
.end method

.method public static final synthetic access$get_gateKeeperFlow$p(Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;)Lkotlinx/coroutines/flow/z;
    .locals 0

    iget-object p0, p0, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->_gateKeeperFlow:Lkotlinx/coroutines/flow/z;

    return-object p0
.end method

.method public static final synthetic access$setGatekeeperError$p(Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;Lcom/taptap/sdk/common/network/throwable/TapNetworkException;)V
    .locals 0

    iput-object p1, p0, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->gatekeeperError:Lcom/taptap/sdk/common/network/throwable/TapNetworkException;

    return-void
.end method

.method public static final synthetic access$setLoadGatekeeperSuccess$p(Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;Z)V
    .locals 0

    iput-boolean p1, p0, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->loadGatekeeperSuccess:Z

    return-void
.end method

.method public static final synthetic access$showErrorToast(Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;Lcom/taptap/sdk/common/network/throwable/TapNetworkException;)V
    .locals 0

    invoke-direct {p0, p1}, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->showErrorToast(Lcom/taptap/sdk/common/network/throwable/TapNetworkException;)V

    return-void
.end method

.method private final getGateKeeperFromDisk()Lcom/taptap/sdk/initializer/data/response/GateKeeper;
    .locals 1

    iget-object v0, p0, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->storage:Lcom/taptap/sdk/initializer/repository/local/GatekeeperStorage;

    invoke-interface {v0}, Lcom/taptap/sdk/initializer/repository/local/GatekeeperStorage;->getGateKeeper()Lcom/taptap/sdk/initializer/data/response/GateKeeper;

    move-result-object v0

    return-object v0
.end method

.method private final showErrorToast(Lcom/taptap/sdk/common/network/throwable/TapNetworkException;)V
    .locals 6

    # MOD补丁：重签名包上签名校验必败，TapSDK 守门人周期弹"包名、签名错误"toast，直接吞掉
    return-void

    invoke-static {}, Lkotlinx/coroutines/cf;->O()Lkotlinx/coroutines/ce;

    move-result-object v0

    const/4 v1, 0x0

    const/4 v2, 0x0

    new-instance v3, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository$showErrorToast$1;

    const/4 v4, 0x0

    invoke-direct {v3, p0, p1, v4}, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository$showErrorToast$1;-><init>(Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;Lcom/taptap/sdk/common/network/throwable/TapNetworkException;Lc1/ll;)V

    const/4 v4, 0x3

    const/4 v5, 0x0

    invoke-static/range {v0 .. v5}, Lkotlinx/coroutines/c;->i(Lkotlinx/coroutines/ce;Lc1/II;Lkotlinx/coroutines/a0;Lr1/j;ILjava/lang/Object;)Lkotlinx/coroutines/r1;

    return-void
.end method


# virtual methods
.method public final getCurrentGateKeeper()Lcom/taptap/sdk/initializer/data/response/GateKeeper;
    .locals 1
    .annotation build Ld3/ll;
    .end annotation

    iget-object v0, p0, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->_gateKeeperFlow:Lkotlinx/coroutines/flow/z;

    invoke-interface {v0}, Lkotlinx/coroutines/flow/ae;->o()Ljava/util/List;

    move-result-object v0

    invoke-static {v0}, Lv0/aa;->f2(Ljava/util/List;)Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Lcom/taptap/sdk/initializer/data/response/GateKeeper;

    if-nez v0, :cond_0

    iget-object v0, p0, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->memoryData:Lcom/taptap/sdk/initializer/data/response/GateKeeper;

    :cond_0
    return-object v0
.end method

.method public final getGateKeeperFlow()Lkotlinx/coroutines/flow/b;
    .locals 1
    .annotation build Ld3/ll;
    .end annotation

    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Lkotlinx/coroutines/flow/b<",
            "Lcom/taptap/sdk/initializer/data/response/GateKeeper;",
            ">;"
        }
    .end annotation

    iget-object v0, p0, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->gateKeeperFlow:Lkotlinx/coroutines/flow/b;

    return-object v0
.end method

.method public final initialize()Lkotlinx/coroutines/r1;
    .locals 6
    .annotation build Ld3/ll;
    .end annotation

    iget-object v0, p0, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->scope:Lkotlinx/coroutines/ce;

    const/4 v1, 0x0

    const/4 v2, 0x0

    new-instance v3, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository$initialize$1;

    const/4 v4, 0x0

    invoke-direct {v3, p0, v4}, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository$initialize$1;-><init>(Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;Lc1/ll;)V

    const/4 v4, 0x3

    const/4 v5, 0x0

    invoke-static/range {v0 .. v5}, Lkotlinx/coroutines/c;->i(Lkotlinx/coroutines/ce;Lc1/II;Lkotlinx/coroutines/a0;Lr1/j;ILjava/lang/Object;)Lkotlinx/coroutines/r1;

    move-result-object v0

    return-object v0
.end method

.method public final isGatekeeperLoadedSuccessfully()Z
    .locals 1

    iget-boolean v0, p0, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->loadGatekeeperSuccess:Z

    return v0
.end method

.method public final showGatekeeperError()V
    .locals 4

    iget-object v0, p0, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->gatekeeperError:Lcom/taptap/sdk/common/network/throwable/TapNetworkException;

    if-nez v0, :cond_0

    const-string v0, "\u5f53\u524d\u5e94\u7528\u8fd8\u672a\u521d\u59cb\u5316"

    invoke-static {v0}, Lcom/taptap/sdk/kit/internal/extensions/SysExtKt;->showToast(Ljava/lang/String;)Lkotlinx/coroutines/r1;

    const-string v0, "\u5f53\u524d\u5e94\u7528\u8fd8\u672a\u521d\u59cb\u5316: \u8bf7\u5728\u8c03\u7528 SDK \u4e1a\u52a1\u63a5\u53e3\u524d\uff0c\u5148\u8c03\u7528 [TapTapSDK.init()] \u63a5\u53e3"

    const/4 v1, 0x4

    const-string v2, "TapInitializer"

    const/4 v3, 0x0

    invoke-static {v2, v0, v3, v1, v3}, Lcom/taptap/sdk/kit/internal/TapLogger;->loge$default(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;ILjava/lang/Object;)V

    goto :goto_0

    :cond_0
    if-eqz v0, :cond_1

    invoke-direct {p0, v0}, Lcom/taptap/sdk/initializer/repository/GatekeeperRepository;->showErrorToast(Lcom/taptap/sdk/common/network/throwable/TapNetworkException;)V

    :cond_1
    :goto_0
    return-void
.end method
