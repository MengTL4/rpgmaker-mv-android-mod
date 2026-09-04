.class public Lcom/hjgzs/rpgplugin/MainActivity$o;
.super Ljava/lang/Object;
.source "SourceFile"

# interfaces
.implements Ljava/lang/Runnable;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Lcom/hjgzs/rpgplugin/MainActivity;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x1
    name = null
.end annotation


# instance fields
.field public final synthetic o:Lcom/hjgzs/rpgplugin/MainActivity;


# direct methods
.method public constructor <init>(Lcom/hjgzs/rpgplugin/MainActivity;)V
    .locals 0

    iput-object p1, p0, Lcom/hjgzs/rpgplugin/MainActivity$o;->o:Lcom/hjgzs/rpgplugin/MainActivity;

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method


# virtual methods
.method public run()V
    .locals 0

    # RMMOD: SDK剥离——原为 TapTap 登录态轮询，已随 ll 移除

    return-void
.end method

