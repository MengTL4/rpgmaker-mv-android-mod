.class public Lcom/qihoo/rpgplugin/MainActivity;
.super Landroidx/appcompat/app/AppCompatActivity;
.source "MainActivity.java"


# instance fields
.field private dialog:Landroid/app/AlertDialog;

.field private x5WebView:Lcom/qihoo/rpgplugin/X5WebView;


# direct methods
.method public constructor <init>()V
    .locals 0

    .line 54
    invoke-direct {p0}, Landroidx/appcompat/app/AppCompatActivity;-><init>()V

    return-void
.end method

.method public static AESDecrypt(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
    .locals 4
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/lang/Exception;
        }
    .end annotation

    const-string v0, ""

    .line 522
    invoke-static {p1, v0}, Lcom/qihoo/rpgplugin/MainActivity;->md5(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v1

    const/4 v2, 0x0

    const/16 v3, 0x10

    invoke-virtual {v1, v2, v3}, Ljava/lang/String;->substring(II)Ljava/lang/String;

    move-result-object v1

    .line 523
    invoke-static {p1, v0}, Lcom/qihoo/rpgplugin/MainActivity;->md5(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object p1

    const/16 v0, 0x20

    invoke-virtual {p1, v3, v0}, Ljava/lang/String;->substring(II)Ljava/lang/String;

    move-result-object p1

    .line 524
    invoke-static {p0, v1, p1}, Lcom/qihoo/rpgplugin/AESUtils;->Decrypt(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object p0

    return-object p0
.end method

.method public static AESEncrypt(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
    .locals 4
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/lang/Exception;
        }
    .end annotation

    const-string v0, ""

    .line 528
    invoke-static {p1, v0}, Lcom/qihoo/rpgplugin/MainActivity;->md5(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v1

    const/4 v2, 0x0

    const/16 v3, 0x10

    invoke-virtual {v1, v2, v3}, Ljava/lang/String;->substring(II)Ljava/lang/String;

    move-result-object v1

    .line 529
    invoke-static {p1, v0}, Lcom/qihoo/rpgplugin/MainActivity;->md5(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object p1

    const/16 v0, 0x20

    invoke-virtual {p1, v3, v0}, Ljava/lang/String;->substring(II)Ljava/lang/String;

    move-result-object p1

    .line 530
    invoke-static {p0, v1, p1}, Lcom/qihoo/rpgplugin/AESUtils;->Encrypt(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object p0

    return-object p0
.end method

.method public static LoadExternal(Ljava/lang/String;)Ljava/lang/String;
    .locals 2
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation

    .line 445
    new-instance v0, Ljava/io/FileInputStream;

    invoke-direct {v0, p0}, Ljava/io/FileInputStream;-><init>(Ljava/lang/String;)V

    .line 446
    new-instance p0, Ljava/io/BufferedReader;

    new-instance v1, Ljava/io/InputStreamReader;

    invoke-direct {v1, v0}, Ljava/io/InputStreamReader;-><init>(Ljava/io/InputStream;)V

    invoke-direct {p0, v1}, Ljava/io/BufferedReader;-><init>(Ljava/io/Reader;)V

    .line 447
    new-instance v0, Ljava/lang/StringBuffer;

    invoke-direct {v0}, Ljava/lang/StringBuffer;-><init>()V

    .line 449
    :goto_0
    invoke-virtual {p0}, Ljava/io/BufferedReader;->readLine()Ljava/lang/String;

    move-result-object v1

    if-eqz v1, :cond_0

    .line 450
    invoke-virtual {v0, v1}, Ljava/lang/StringBuffer;->append(Ljava/lang/String;)Ljava/lang/StringBuffer;

    goto :goto_0

    .line 452
    :cond_0
    invoke-virtual {v0}, Ljava/lang/StringBuffer;->toString()Ljava/lang/String;

    move-result-object p0

    return-object p0
.end method

.method static synthetic access$000(Lcom/qihoo/rpgplugin/MainActivity;Landroid/os/Bundle;)V
    .locals 0

    .line 54
    invoke-direct {p0, p1}, Lcom/qihoo/rpgplugin/MainActivity;->start(Landroid/os/Bundle;)V

    return-void
.end method

.method static synthetic access$100(Lcom/qihoo/rpgplugin/MainActivity;)V
    .locals 0

    .line 54
    invoke-direct {p0}, Lcom/qihoo/rpgplugin/MainActivity;->createWebsite()V

    return-void
.end method

.method static synthetic access$200(Lcom/qihoo/rpgplugin/MainActivity;)Landroid/app/AlertDialog;
    .locals 0

    .line 54
    iget-object p0, p0, Lcom/qihoo/rpgplugin/MainActivity;->dialog:Landroid/app/AlertDialog;

    return-object p0
.end method

.method private createDialog()V
    .locals 3

    .line 396
    new-instance v0, Landroid/app/AlertDialog$Builder;

    invoke-direct {v0, p0}, Landroid/app/AlertDialog$Builder;-><init>(Landroid/content/Context;)V

    const-string v1, "\u94c1\u6c41\uff0c\u4f60\u771f\u5f97\u8981\u9000\u51fa\u5417\uff1f\u5efa\u8bae\u518d\u73a924\u5c0f\u65f6\uff01"

    .line 397
    invoke-virtual {v0, v1}, Landroid/app/AlertDialog$Builder;->setMessage(Ljava/lang/CharSequence;)Landroid/app/AlertDialog$Builder;

    const-string v1, "\u63d0\u793a"

    .line 398
    invoke-virtual {v0, v1}, Landroid/app/AlertDialog$Builder;->setTitle(Ljava/lang/CharSequence;)Landroid/app/AlertDialog$Builder;

    .line 399
    new-instance v1, Lcom/qihoo/rpgplugin/MainActivity$5;

    invoke-direct {v1, p0}, Lcom/qihoo/rpgplugin/MainActivity$5;-><init>(Lcom/qihoo/rpgplugin/MainActivity;)V

    const-string v2, "\u53d6\u6d88"

    invoke-virtual {v0, v2, v1}, Landroid/app/AlertDialog$Builder;->setNegativeButton(Ljava/lang/CharSequence;Landroid/content/DialogInterface$OnClickListener;)Landroid/app/AlertDialog$Builder;

    .line 405
    new-instance v1, Lcom/qihoo/rpgplugin/MainActivity$6;

    invoke-direct {v1, p0}, Lcom/qihoo/rpgplugin/MainActivity$6;-><init>(Lcom/qihoo/rpgplugin/MainActivity;)V

    const-string v2, "\u786e\u8ba4"

    invoke-virtual {v0, v2, v1}, Landroid/app/AlertDialog$Builder;->setPositiveButton(Ljava/lang/CharSequence;Landroid/content/DialogInterface$OnClickListener;)Landroid/app/AlertDialog$Builder;

    .line 412
    invoke-virtual {v0}, Landroid/app/AlertDialog$Builder;->create()Landroid/app/AlertDialog;

    move-result-object v0

    iput-object v0, p0, Lcom/qihoo/rpgplugin/MainActivity;->dialog:Landroid/app/AlertDialog;

    return-void
.end method

.method private createWebsite()V
    .locals 3

    .line 146
    iget-object v0, p0, Lcom/qihoo/rpgplugin/MainActivity;->x5WebView:Lcom/qihoo/rpgplugin/X5WebView;

    const-string v1, "file:///android_asset/www/index.html"

    invoke-virtual {v0, v1}, Lcom/qihoo/rpgplugin/X5WebView;->loadUrl(Ljava/lang/String;)V

    .line 147
    iget-object v0, p0, Lcom/qihoo/rpgplugin/MainActivity;->x5WebView:Lcom/qihoo/rpgplugin/X5WebView;

    new-instance v1, Lcom/qihoo/rpgplugin/MainActivity$2;

    invoke-direct {v1, p0}, Lcom/qihoo/rpgplugin/MainActivity$2;-><init>(Lcom/qihoo/rpgplugin/MainActivity;)V

    const-string v2, "HWGOEA"

    invoke-virtual {v0, v1, v2}, Lcom/qihoo/rpgplugin/X5WebView;->addJavascriptInterface(Ljava/lang/Object;Ljava/lang/String;)V

    # ---- RMMOD 注入 ----
    iget-object v0, p0, Lcom/qihoo/rpgplugin/MainActivity;->x5WebView:Lcom/qihoo/rpgplugin/X5WebView;

    new-instance v1, Lcom/rmmod/ModBridge;

    invoke-direct {v1}, Lcom/rmmod/ModBridge;-><init>()V

    const-string v2, "MOD"

    invoke-virtual {v0, v1, v2}, Lcom/qihoo/rpgplugin/X5WebView;->addJavascriptInterface(Ljava/lang/Object;Ljava/lang/String;)V

    invoke-static {p0}, Lcom/rmmod/ModFloatingWindow;->show(Landroid/app/Activity;)V

    return-void
.end method

.method private init(Landroid/os/Bundle;)V
    .locals 3

    .line 116
    iget-object v0, p0, Lcom/qihoo/rpgplugin/MainActivity;->x5WebView:Lcom/qihoo/rpgplugin/X5WebView;

    const/4 v1, 0x2

    const/4 v2, 0x0

    invoke-virtual {v0, v1, v2}, Lcom/qihoo/rpgplugin/X5WebView;->setLayerType(ILandroid/graphics/Paint;)V

    .line 117
    iget-object v0, p0, Lcom/qihoo/rpgplugin/MainActivity;->x5WebView:Lcom/qihoo/rpgplugin/X5WebView;

    const/high16 v1, 0x2000000

    invoke-virtual {v0, v1}, Lcom/qihoo/rpgplugin/X5WebView;->setScrollBarStyle(I)V

    .line 118
    iget-object v0, p0, Lcom/qihoo/rpgplugin/MainActivity;->x5WebView:Lcom/qihoo/rpgplugin/X5WebView;

    const/4 v1, 0x1

    invoke-virtual {v0, v1}, Lcom/qihoo/rpgplugin/X5WebView;->setHapticFeedbackEnabled(Z)V

    .line 119
    iget-object v0, p0, Lcom/qihoo/rpgplugin/MainActivity;->x5WebView:Lcom/qihoo/rpgplugin/X5WebView;

    invoke-virtual {v0, v1}, Lcom/qihoo/rpgplugin/X5WebView;->setHorizontalScrollBarEnabled(Z)V

    .line 120
    iget-object v0, p0, Lcom/qihoo/rpgplugin/MainActivity;->x5WebView:Lcom/qihoo/rpgplugin/X5WebView;

    invoke-virtual {v0, v1}, Lcom/qihoo/rpgplugin/X5WebView;->setVerticalScrollBarEnabled(Z)V

    .line 121
    iget-object v0, p0, Lcom/qihoo/rpgplugin/MainActivity;->x5WebView:Lcom/qihoo/rpgplugin/X5WebView;

    invoke-virtual {v0, v1}, Lcom/qihoo/rpgplugin/X5WebView;->setLongClickable(Z)V

    .line 123
    invoke-static {}, Landroid/webkit/CookieManager;->getInstance()Landroid/webkit/CookieManager;

    move-result-object v0

    .line 124
    invoke-virtual {v0, v1}, Landroid/webkit/CookieManager;->setAcceptCookie(Z)V

    .line 125
    invoke-virtual {v0}, Landroid/webkit/CookieManager;->acceptCookie()Z

    .line 126
    invoke-static {p0}, Landroid/webkit/CookieSyncManager;->createInstance(Landroid/content/Context;)Landroid/webkit/CookieSyncManager;

    .line 127
    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I

    if-eqz p1, :cond_0

    .line 131
    iget-object v0, p0, Lcom/qihoo/rpgplugin/MainActivity;->x5WebView:Lcom/qihoo/rpgplugin/X5WebView;

    invoke-virtual {v0, p1}, Lcom/qihoo/rpgplugin/X5WebView;->restoreState(Landroid/os/Bundle;)Lcom/tencent/smtt/sdk/WebBackForwardList;

    .line 134
    :cond_0
    sget-boolean p1, Lcom/qihoo/rpgplugin/Config;->Single_Game:Z

    if-eqz p1, :cond_1

    .line 135
    sget-object p1, Lcom/qihoo/rpgplugin/Config;->APP_ID:Ljava/lang/String;

    invoke-static {p0, p1}, Lcom/taptap/sdk/TapLoginHelper;->init(Landroid/content/Context;Ljava/lang/String;)V

    .line 136
    invoke-direct {p0}, Lcom/qihoo/rpgplugin/MainActivity;->taptapLoginListener()V

    .line 137
    invoke-direct {p0}, Lcom/qihoo/rpgplugin/MainActivity;->taptapAntiAddictionInit()V

    .line 138
    invoke-direct {p0}, Lcom/qihoo/rpgplugin/MainActivity;->taptapLoginStatusOnly()V

    goto :goto_0

    .line 140
    :cond_1
    invoke-direct {p0}, Lcom/qihoo/rpgplugin/MainActivity;->createWebsite()V

    :goto_0
    return-void
.end method

.method public static md5(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
    .locals 7

    const-string v0, "null"

    .line 491
    invoke-virtual {v0, p0}, Ljava/lang/String;->equalsIgnoreCase(Ljava/lang/String;)Z

    move-result v0

    const-string v1, ""

    if-nez v0, :cond_3

    invoke-virtual {v1, p0}, Ljava/lang/String;->equalsIgnoreCase(Ljava/lang/String;)Z

    move-result v0

    if-eqz v0, :cond_0

    goto :goto_1

    :cond_0
    :try_start_0
    const-string v0, "MD5"

    .line 496
    invoke-static {v0}, Ljava/security/MessageDigest;->getInstance(Ljava/lang/String;)Ljava/security/MessageDigest;

    move-result-object v0

    .line 497
    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    invoke-virtual {v2, p0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p0

    invoke-virtual {p0}, Ljava/lang/String;->getBytes()[B

    move-result-object p0

    invoke-virtual {v0, p0}, Ljava/security/MessageDigest;->digest([B)[B

    move-result-object p0

    .line 498
    new-instance p1, Ljava/lang/StringBuilder;

    invoke-direct {p1}, Ljava/lang/StringBuilder;-><init>()V

    .line 499
    array-length v0, p0

    const/4 v2, 0x0

    const/4 v3, 0x0

    :goto_0
    if-ge v3, v0, :cond_2

    aget-byte v4, p0, v3

    and-int/lit16 v4, v4, 0xff

    .line 500
    invoke-static {v4}, Ljava/lang/Integer;->toHexString(I)Ljava/lang/String;

    move-result-object v4

    .line 501
    invoke-virtual {v4}, Ljava/lang/String;->length()I

    move-result v5

    const/4 v6, 0x1

    if-ne v5, v6, :cond_1

    .line 502
    invoke-virtual {p1, v2}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    .line 504
    :cond_1
    invoke-virtual {p1, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    add-int/lit8 v3, v3, 0x1

    goto :goto_0

    .line 506
    :cond_2
    invoke-virtual {p1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p0
    :try_end_0
    .catch Ljava/security/NoSuchAlgorithmException; {:try_start_0 .. :try_end_0} :catch_0

    return-object p0

    :catch_0
    move-exception p0

    .line 508
    invoke-virtual {p0}, Ljava/security/NoSuchAlgorithmException;->printStackTrace()V

    :cond_3
    :goto_1
    return-object v1
.end method

.method private start(Landroid/os/Bundle;)V
    .locals 3

    .line 81
    invoke-static {}, Lcom/qihoo/rpgplugin/plugin/alert/IJsAlertHelper$-CC;->get()Lcom/qihoo/rpgplugin/plugin/alert/IJsAlertHelper;

    move-result-object v0

    invoke-interface {v0, p0}, Lcom/qihoo/rpgplugin/plugin/alert/IJsAlertHelper;->init(Landroid/app/Activity;)V

    .line 84
    invoke-direct {p0, p1}, Lcom/qihoo/rpgplugin/MainActivity;->init(Landroid/os/Bundle;)V

    .line 87
    sget p1, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v0, 0x17

    if-lt p1, v0, :cond_0

    const-string p1, "android.permission.READ_EXTERNAL_STORAGE"

    const-string v0, "android.permission.WRITE_EXTERNAL_STORAGE"

    const-string v1, "android.permission.REQUEST_INSTALL_PACKAGES"

    const-string v2, "android.permission.INTERNET"

    .line 88
    filled-new-array {p1, v0, v1, v2}, [Ljava/lang/String;

    move-result-object p1

    const/16 v0, 0x1f40

    invoke-virtual {p0, p1, v0}, Lcom/qihoo/rpgplugin/MainActivity;->requestPermissions([Ljava/lang/String;I)V

    .line 102
    :cond_0
    invoke-direct {p0}, Lcom/qihoo/rpgplugin/MainActivity;->startService()V

    return-void
.end method

.method private startService()V
    .locals 3

    .line 355
    new-instance v0, Landroid/content/Intent;

    const-class v1, Lcom/qihoo/rpgplugin/service/GameService;

    invoke-direct {v0, p0, v1}, Landroid/content/Intent;-><init>(Landroid/content/Context;Ljava/lang/Class;)V

    .line 356
    sget v1, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v2, 0x1a

    if-lt v1, v2, :cond_0

    .line 357
    invoke-virtual {p0}, Lcom/qihoo/rpgplugin/MainActivity;->getApplication()Landroid/app/Application;

    move-result-object v1

    invoke-virtual {v1, v0}, Landroid/app/Application;->startForegroundService(Landroid/content/Intent;)Landroid/content/ComponentName;

    goto :goto_0

    .line 359
    :cond_0
    invoke-virtual {p0}, Lcom/qihoo/rpgplugin/MainActivity;->getApplication()Landroid/app/Application;

    move-result-object v1

    invoke-virtual {v1, v0}, Landroid/app/Application;->startService(Landroid/content/Intent;)Landroid/content/ComponentName;

    :goto_0
    return-void
.end method

.method private taptapAntiAddictionInit()V
    .locals 3

    .line 296
    new-instance v0, Lcom/tapsdk/antiaddiction/config/AntiAddictionFunctionConfig$Builder;

    invoke-direct {v0}, Lcom/tapsdk/antiaddiction/config/AntiAddictionFunctionConfig$Builder;-><init>()V

    const/4 v1, 0x1

    .line 297
    invoke-virtual {v0, v1}, Lcom/tapsdk/antiaddiction/config/AntiAddictionFunctionConfig$Builder;->enablePaymentLimit(Z)Lcom/tapsdk/antiaddiction/config/AntiAddictionFunctionConfig$Builder;

    move-result-object v0

    .line 298
    invoke-virtual {v0, v1}, Lcom/tapsdk/antiaddiction/config/AntiAddictionFunctionConfig$Builder;->enableOnLineTimeLimit(Z)Lcom/tapsdk/antiaddiction/config/AntiAddictionFunctionConfig$Builder;

    move-result-object v0

    const/4 v1, 0x0

    .line 299
    invoke-virtual {v0, v1}, Lcom/tapsdk/antiaddiction/config/AntiAddictionFunctionConfig$Builder;->showSwitchAccount(Z)Lcom/tapsdk/antiaddiction/config/AntiAddictionFunctionConfig$Builder;

    move-result-object v0

    .line 300
    invoke-virtual {v0}, Lcom/tapsdk/antiaddiction/config/AntiAddictionFunctionConfig$Builder;->build()Lcom/tapsdk/antiaddiction/config/AntiAddictionFunctionConfig;

    move-result-object v0

    .line 302
    sget-object v1, Lcom/qihoo/rpgplugin/Config;->APP_ID:Ljava/lang/String;

    new-instance v2, Lcom/qihoo/rpgplugin/MainActivity$4;

    invoke-direct {v2, p0}, Lcom/qihoo/rpgplugin/MainActivity$4;-><init>(Lcom/qihoo/rpgplugin/MainActivity;)V

    invoke-static {p0, v1, v0, v2}, Lcom/tapsdk/antiaddictionui/AntiAddictionUIKit;->init(Landroid/app/Activity;Ljava/lang/String;Lcom/tapsdk/antiaddiction/config/AntiAddictionFunctionConfig;Lcom/tapsdk/antiaddictionui/AntiAddictionUICallback;)V

    return-void
.end method

.method private taptapLoginListener()V
    .locals 1

    .line 268
    new-instance v0, Lcom/qihoo/rpgplugin/MainActivity$3;

    invoke-direct {v0, p0}, Lcom/qihoo/rpgplugin/MainActivity$3;-><init>(Lcom/qihoo/rpgplugin/MainActivity;)V

    .line 291
    invoke-static {v0}, Lcom/taptap/sdk/TapLoginHelper;->registerLoginCallback(Lcom/taptap/sdk/TapLoginHelper$TapLoginResultCallback;)V

    return-void
.end method

.method private taptapLoginStatusOnly()V
    .locals 2

    .line 342
    invoke-static {}, Lcom/taptap/sdk/TapLoginHelper;->getCurrentAccessToken()Lcom/taptap/sdk/AccessToken;

    move-result-object v0

    if-nez v0, :cond_0

    const-string v0, "public_profile"

    .line 344
    filled-new-array {v0}, [Ljava/lang/String;

    move-result-object v0

    invoke-static {p0, v0}, Lcom/taptap/sdk/TapLoginHelper;->startTapLogin(Landroid/app/Activity;[Ljava/lang/String;)V

    goto :goto_0

    .line 347
    :cond_0
    invoke-static {}, Lcom/taptap/sdk/TapLoginHelper;->getCurrentProfile()Lcom/taptap/sdk/Profile;

    move-result-object v0

    .line 348
    invoke-virtual {v0}, Lcom/taptap/sdk/Profile;->getOpenid()Ljava/lang/String;

    move-result-object v0

    const/4 v1, 0x1

    .line 349
    invoke-static {p0, v1, v0}, Lcom/tapsdk/antiaddictionui/AntiAddictionUIKit;->startup(Landroid/app/Activity;ZLjava/lang/String;)V

    :goto_0
    return-void
.end method

.method public static writeExternal(Ljava/lang/String;Ljava/lang/String;)V
    .locals 3
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation

    .line 426
    invoke-static {}, Landroid/os/Environment;->getExternalStorageState()Ljava/lang/String;

    move-result-object v0

    const-string v1, "mounted"

    .line 428
    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_1

    .line 430
    new-instance v0, Ljava/io/File;

    const/4 v1, 0x0

    const-string v2, "/"

    invoke-virtual {p0, v2}, Ljava/lang/String;->lastIndexOf(Ljava/lang/String;)I

    move-result v2

    invoke-virtual {p0, v1, v2}, Ljava/lang/String;->substring(II)Ljava/lang/String;

    move-result-object v1

    invoke-direct {v0, v1}, Ljava/io/File;-><init>(Ljava/lang/String;)V

    .line 431
    invoke-virtual {v0}, Ljava/io/File;->exists()Z

    move-result v1

    if-nez v1, :cond_0

    .line 433
    invoke-virtual {v0}, Ljava/io/File;->mkdirs()Z

    .line 436
    :cond_0
    new-instance v0, Ljava/io/FileOutputStream;

    invoke-direct {v0, p0}, Ljava/io/FileOutputStream;-><init>(Ljava/lang/String;)V

    .line 438
    invoke-virtual {p1}, Ljava/lang/String;->getBytes()[B

    move-result-object p0

    invoke-virtual {v0, p0}, Ljava/io/FileOutputStream;->write([B)V

    .line 440
    invoke-virtual {v0}, Ljava/io/FileOutputStream;->close()V

    :cond_1
    return-void
.end method

.method public static zlibGunzip(Ljava/lang/String;)Ljava/lang/String;
    .locals 0
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation

    .line 518
    invoke-static {p0}, Lcom/qihoo/rpgplugin/GZIP;->unCompress(Ljava/lang/String;)Ljava/lang/String;

    move-result-object p0

    return-object p0
.end method

.method public static zlibGzip(Ljava/lang/String;)Ljava/lang/String;
    .locals 0
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation

    .line 514
    invoke-static {p0}, Lcom/qihoo/rpgplugin/GZIP;->compress(Ljava/lang/String;)Ljava/lang/String;

    move-result-object p0

    return-object p0
.end method


# virtual methods
.method public JudgeExternal(Ljava/lang/String;)Z
    .locals 1

    .line 416
    new-instance v0, Ljava/io/File;

    invoke-direct {v0, p1}, Ljava/io/File;-><init>(Ljava/lang/String;)V

    .line 417
    invoke-virtual {v0}, Ljava/io/File;->exists()Z

    move-result p1

    if-nez p1, :cond_0

    const/4 p1, 0x0

    return p1

    :cond_0
    const/4 p1, 0x1

    return p1
.end method

.method public OpenWeb(Ljava/lang/String;)V
    .locals 2

    .line 535
    new-instance v0, Landroid/content/Intent;

    const-string v1, "android.intent.action.VIEW"

    invoke-direct {v0, v1}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    .line 537
    invoke-static {p1}, Landroid/net/Uri;->parse(Ljava/lang/String;)Landroid/net/Uri;

    move-result-object p1

    invoke-virtual {v0, p1}, Landroid/content/Intent;->setData(Landroid/net/Uri;)Landroid/content/Intent;

    .line 539
    invoke-virtual {p0, v0}, Lcom/qihoo/rpgplugin/MainActivity;->startActivity(Landroid/content/Intent;)V

    return-void
.end method

.method public final copyToClipboard(Ljava/lang/String;)V
    .locals 2

    const-string v0, "clipboard"

    .line 481
    invoke-virtual {p0, v0}, Lcom/qihoo/rpgplugin/MainActivity;->getSystemService(Ljava/lang/String;)Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Landroid/content/ClipboardManager;

    if-eqz v0, :cond_0

    const/4 v1, 0x0

    .line 483
    invoke-static {v1, p1}, Landroid/content/ClipData;->newPlainText(Ljava/lang/CharSequence;Ljava/lang/CharSequence;)Landroid/content/ClipData;

    move-result-object p1

    invoke-virtual {v0, p1}, Landroid/content/ClipboardManager;->setPrimaryClip(Landroid/content/ClipData;)V

    .line 484
    invoke-virtual {v0}, Landroid/content/ClipboardManager;->hasPrimaryClip()Z

    move-result p1

    if-eqz p1, :cond_0

    .line 485
    invoke-virtual {v0}, Landroid/content/ClipboardManager;->getPrimaryClip()Landroid/content/ClipData;

    move-result-object p1

    const/4 v0, 0x0

    invoke-virtual {p1, v0}, Landroid/content/ClipData;->getItemAt(I)Landroid/content/ClipData$Item;

    move-result-object p1

    invoke-virtual {p1}, Landroid/content/ClipData$Item;->getText()Ljava/lang/CharSequence;

    :cond_0
    return-void
.end method

.method public deleteExternal(Ljava/lang/String;)Z
    .locals 2

    .line 456
    new-instance v0, Ljava/io/File;

    invoke-direct {v0, p1}, Ljava/io/File;-><init>(Ljava/lang/String;)V

    .line 458
    invoke-virtual {v0}, Ljava/io/File;->exists()Z

    move-result p1

    const/4 v1, 0x0

    if-eqz p1, :cond_0

    invoke-virtual {v0}, Ljava/io/File;->isFile()Z

    move-result p1

    if-eqz p1, :cond_0

    .line 459
    invoke-virtual {v0}, Ljava/io/File;->delete()Z

    move-result p1

    if-eqz p1, :cond_0

    const/4 p1, 0x1

    return p1

    :cond_0
    return v1
.end method

.method public destroy()V
    .locals 0
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .line 544
    invoke-virtual {p0}, Lcom/qihoo/rpgplugin/MainActivity;->finish()V

    return-void
.end method

.method protected onCreate(Landroid/os/Bundle;)V
    .locals 2

    .line 60
    invoke-super {p0, p1}, Landroidx/appcompat/app/AppCompatActivity;->onCreate(Landroid/os/Bundle;)V

    .line 62
    invoke-virtual {p0}, Lcom/qihoo/rpgplugin/MainActivity;->getWindow()Landroid/view/Window;

    move-result-object v0

    const/16 v1, 0x80

    invoke-virtual {v0, v1, v1}, Landroid/view/Window;->setFlags(II)V

    const v0, 0x7f0b00b4

    .line 63
    invoke-virtual {p0, v0}, Lcom/qihoo/rpgplugin/MainActivity;->setContentView(I)V

    const v0, 0x7f0802d8

    .line 64
    invoke-virtual {p0, v0}, Lcom/qihoo/rpgplugin/MainActivity;->findViewById(I)Landroid/view/View;

    move-result-object v0

    check-cast v0, Lcom/qihoo/rpgplugin/X5WebView;

    iput-object v0, p0, Lcom/qihoo/rpgplugin/MainActivity;->x5WebView:Lcom/qihoo/rpgplugin/X5WebView;

    .line 66
    sget-object v0, Lcom/qihoo/privacy/PrivacyManager;->Companion:Lcom/qihoo/privacy/PrivacyManager$Companion;

    invoke-virtual {v0}, Lcom/qihoo/privacy/PrivacyManager$Companion;->getInstance()Lcom/qihoo/privacy/PrivacyManager;

    move-result-object v0

    new-instance v1, Lcom/qihoo/rpgplugin/MainActivity$1;

    invoke-direct {v1, p0, p1}, Lcom/qihoo/rpgplugin/MainActivity$1;-><init>(Lcom/qihoo/rpgplugin/MainActivity;Landroid/os/Bundle;)V

    invoke-virtual {v0, p0, v1}, Lcom/qihoo/privacy/PrivacyManager;->checkPrivacy(Landroidx/appcompat/app/AppCompatActivity;Lcom/qihoo/privacy/PrivacyConfirmListener;)V

    return-void
.end method

.method protected onDestroy()V
    .locals 2

    .line 377
    invoke-super {p0}, Landroidx/appcompat/app/AppCompatActivity;->onDestroy()V

    invoke-static {}, Lcom/rmmod/ModFloatingWindow;->hide()V

    .line 378
    iget-object v0, p0, Lcom/qihoo/rpgplugin/MainActivity;->x5WebView:Lcom/qihoo/rpgplugin/X5WebView;

    invoke-virtual {v0}, Lcom/qihoo/rpgplugin/X5WebView;->getSettings()Lcom/tencent/smtt/sdk/WebSettings;

    move-result-object v0

    const/4 v1, 0x0

    .line 379
    invoke-virtual {v0, v1}, Lcom/tencent/smtt/sdk/WebSettings;->setJavaScriptEnabled(Z)V

    .line 380
    iget-object v0, p0, Lcom/qihoo/rpgplugin/MainActivity;->x5WebView:Lcom/qihoo/rpgplugin/X5WebView;

    invoke-virtual {v0}, Lcom/qihoo/rpgplugin/X5WebView;->destroy()V

    return-void
.end method

.method public onKeyDown(ILandroid/view/KeyEvent;)Z
    .locals 0

    const/4 p2, 0x4

    if-ne p1, p2, :cond_1

    .line 386
    iget-object p1, p0, Lcom/qihoo/rpgplugin/MainActivity;->dialog:Landroid/app/AlertDialog;

    if-nez p1, :cond_0

    .line 387
    invoke-direct {p0}, Lcom/qihoo/rpgplugin/MainActivity;->createDialog()V

    .line 389
    :cond_0
    iget-object p1, p0, Lcom/qihoo/rpgplugin/MainActivity;->dialog:Landroid/app/AlertDialog;

    invoke-virtual {p1}, Landroid/app/AlertDialog;->show()V

    const/4 p1, 0x1

    return p1

    :cond_1
    const/4 p1, 0x0

    return p1
.end method

.method protected onPause()V
    .locals 1

    .line 371
    invoke-super {p0}, Landroidx/appcompat/app/AppCompatActivity;->onPause()V

    .line 372
    iget-object v0, p0, Lcom/qihoo/rpgplugin/MainActivity;->x5WebView:Lcom/qihoo/rpgplugin/X5WebView;

    invoke-virtual {v0}, Lcom/qihoo/rpgplugin/X5WebView;->onPause()V

    return-void
.end method

.method protected onResume()V
    .locals 1

    .line 365
    invoke-super {p0}, Landroidx/appcompat/app/AppCompatActivity;->onResume()V

    .line 366
    iget-object v0, p0, Lcom/qihoo/rpgplugin/MainActivity;->x5WebView:Lcom/qihoo/rpgplugin/X5WebView;

    invoke-virtual {v0}, Lcom/qihoo/rpgplugin/X5WebView;->onResume()V

    return-void
.end method

.method public showToast(Ljava/lang/String;)V
    .locals 2

    .line 473
    invoke-virtual {p0}, Lcom/qihoo/rpgplugin/MainActivity;->getApplicationContext()Landroid/content/Context;

    move-result-object v0

    const/4 v1, 0x0

    invoke-static {v0, p1, v1}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;

    move-result-object p1

    invoke-virtual {p1}, Landroid/widget/Toast;->show()V

    return-void
.end method

.method public showToastLong(Ljava/lang/String;)V
    .locals 2

    .line 477
    invoke-virtual {p0}, Lcom/qihoo/rpgplugin/MainActivity;->getApplicationContext()Landroid/content/Context;

    move-result-object v0

    const/4 v1, 0x1

    invoke-static {v0, p1, v1}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;

    move-result-object p1

    invoke-virtual {p1}, Landroid/widget/Toast;->show()V

    return-void
.end method
