.class public Lcom/qihoo/rpgplugin/RmApplication;
.super Landroid/app/Application;
.source "RmApplication.java"


# static fields
.field private static final TAG:Ljava/lang/String; = "Application"


# direct methods
.method public constructor <init>()V
    .locals 0

    .line 16
    invoke-direct {p0}, Landroid/app/Application;-><init>()V

    return-void
.end method

.method public static getRandomString(I)Ljava/lang/String;
    .locals 5

    .line 96
    new-instance v0, Ljava/util/Random;

    invoke-direct {v0}, Ljava/util/Random;-><init>()V

    .line 97
    new-instance v1, Ljava/lang/StringBuffer;

    invoke-direct {v1}, Ljava/lang/StringBuffer;-><init>()V

    const/4 v2, 0x0

    :goto_0
    if-ge v2, p0, :cond_0

    const/16 v3, 0x3e

    .line 99
    invoke-virtual {v0, v3}, Ljava/util/Random;->nextInt(I)I

    move-result v3

    const-string v4, "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM0123456789"

    .line 100
    invoke-virtual {v4, v3}, Ljava/lang/String;->charAt(I)C

    move-result v3

    invoke-virtual {v1, v3}, Ljava/lang/StringBuffer;->append(C)Ljava/lang/StringBuffer;

    add-int/lit8 v2, v2, 0x1

    goto :goto_0

    .line 102
    :cond_0
    invoke-virtual {v1}, Ljava/lang/StringBuffer;->toString()Ljava/lang/String;

    move-result-object p0

    return-object p0
.end method


# virtual methods
.method public initLD()V
    .locals 0

    # RMMOD: 360 LDSdk（设备标识采集，原为无条件初始化）已随外围 SDK 剥离，置空

    return-void
.end method

.method public onCreate()V
    .locals 2

    .line 23
    invoke-super {p0}, Landroid/app/Application;->onCreate()V

    const-string v0, "aaaaaaaaa"

    const-string v1, "aaaaaaaaaaaaaaaaaa"

    .line 25
    invoke-static {v0, v1}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    const/4 v0, 0x1

    .line 28
    invoke-static {v0}, Lcom/tencent/smtt/sdk/QbSdk;->setDownloadWithoutWifi(Z)V

    const v0, 0xb358

    .line 32
    invoke-static {v0}, Lcom/tencent/smtt/sdk/QbSdk;->setCoreMinVersion(I)V

    .line 35
    new-instance v0, Lcom/qihoo/rpgplugin/RmApplication$1;

    invoke-direct {v0, p0}, Lcom/qihoo/rpgplugin/RmApplication$1;-><init>(Lcom/qihoo/rpgplugin/RmApplication;)V

    invoke-static {v0}, Lcom/tencent/smtt/sdk/QbSdk;->setTbsListener(Lcom/tencent/smtt/sdk/TbsListener;)V

    .line 64
    new-instance v0, Lcom/qihoo/rpgplugin/RmApplication$2;

    invoke-direct {v0, p0}, Lcom/qihoo/rpgplugin/RmApplication$2;-><init>(Lcom/qihoo/rpgplugin/RmApplication;)V

    invoke-static {p0, v0}, Lcom/tencent/smtt/sdk/QbSdk;->initX5Environment(Landroid/content/Context;Lcom/tencent/smtt/sdk/QbSdk$PreInitCallback;)V

    .line 84
    invoke-virtual {p0}, Lcom/qihoo/rpgplugin/RmApplication;->initLD()V

    return-void
.end method
