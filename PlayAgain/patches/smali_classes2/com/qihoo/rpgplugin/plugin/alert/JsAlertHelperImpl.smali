.class public Lcom/qihoo/rpgplugin/plugin/alert/JsAlertHelperImpl;
.super Ljava/lang/Object;
.source "JsAlertHelperImpl.java"

# interfaces
.implements Lcom/qihoo/rpgplugin/plugin/alert/IJsAlertHelper;


# instance fields
.field private x5Activity:Landroid/app/Activity;


# direct methods
.method public constructor <init>()V
    .locals 0

    .line 17
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method


# virtual methods
.method public checkJsAlert(Lcom/tencent/smtt/sdk/WebView;Ljava/lang/String;Ljava/lang/String;Lcom/tencent/smtt/export/external/interfaces/JsResult;)Z
    .locals 3

    # RMMOD: 广告 SDK（torch）已剥离，原 TORCH_Type -> ITorchHelper 分发删除。
    # 行为保持：prompt 消息含 TORCH_Type 时吞掉（cancel + true），其余交回默认处理。
    const/4 p1, 0x0

    :try_start_0
    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0, p3}, Lorg/json/JSONObject;-><init>(Ljava/lang/String;)V

    const-string v1, "TORCH_Type"

    invoke-virtual {v0, v1}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v2

    if-eqz v2, :cond_0

    invoke-interface {p4}, Lcom/tencent/smtt/export/external/interfaces/JsResult;->cancel()V

    const/4 p1, 0x1

    :cond_0
    :try_end_0
    .catchall {:try_start_0 .. :try_end_0} :catchall_0

    :catchall_0
    return p1
.end method

.method public getActivity()Landroid/app/Activity;
    .locals 1

    .line 44
    iget-object v0, p0, Lcom/qihoo/rpgplugin/plugin/alert/JsAlertHelperImpl;->x5Activity:Landroid/app/Activity;

    return-object v0
.end method

.method public init(Landroid/app/Activity;)V
    .locals 0

    .line 31
    iput-object p1, p0, Lcom/qihoo/rpgplugin/plugin/alert/JsAlertHelperImpl;->x5Activity:Landroid/app/Activity;

    return-void
.end method
