.class public final Lj0/c;
.super Ljava/lang/Object;
.source "SourceFile"

# interfaces
.implements Li0/o;


# instance fields
.field public O:Ljava/lang/String;

.field public final o:Landroid/content/Context;


# direct methods
.method public constructor <init>(Landroid/content/Context;)V
    .locals 1

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    const-string v0, "NubiaProvider"

    iput-object v0, p0, Lj0/c;->O:Ljava/lang/String;

    iput-object p1, p0, Lj0/c;->o:Landroid/content/Context;

    return-void
.end method


# virtual methods
.method public final a()Z
    .locals 2
    .annotation build Landroid/annotation/SuppressLint;
        value = {
            "AnnotateVersionCheck"
        }
    .end annotation

    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v1, 0x1d

    if-lt v0, v1, :cond_0

    const/4 v0, 0x1

    return v0

    :cond_0
    const/4 v0, 0x0

    return v0
.end method

.method public final o(Lg0/o;)V
    .locals 5

    iget-object v0, p0, Lj0/c;->o:Landroid/content/Context;

    if-nez v0, :cond_0

    return-void

    :cond_0
    invoke-virtual {p0}, Lj0/c;->a()Z

    move-result v0

    if-nez v0, :cond_1

    iget-object v0, p0, Lj0/c;->O:Ljava/lang/String;

    const-string v1, "Android 10 and above are supported for Nubia"

    invoke-static {v0, v1}, Lm0/I;->O(Ljava/lang/String;Ljava/lang/String;)V

    invoke-virtual {p0}, Lj0/c;->a()Z

    move-result v0

    new-instance v2, Li0/l;

    invoke-direct {v2, v1}, Li0/l;-><init>(Ljava/lang/String;)V

    const/16 v1, 0x67

    invoke-interface {p1, v0, v1, v2}, Lg0/o;->O(ZILjava/lang/Exception;)V

    return-void

    :cond_1
    :try_start_0
    const-string v0, "content://cn.nubia.identity/identity"

    invoke-static {v0}, Landroid/net/Uri;->parse(Ljava/lang/String;)Landroid/net/Uri;

    move-result-object v0

    iget-object v1, p0, Lj0/c;->o:Landroid/content/Context;

    invoke-virtual {v1}, Landroid/content/Context;->getContentResolver()Landroid/content/ContentResolver;

    move-result-object v1

    invoke-virtual {v1, v0}, Landroid/content/ContentResolver;->acquireContentProviderClient(Landroid/net/Uri;)Landroid/content/ContentProviderClient;

    move-result-object v0

    if-nez v0, :cond_2

    return-void

    :cond_2
    const-string v1, "getOAID"

    const/4 v2, 0x0

    invoke-virtual {v0, v1, v2, v2}, Landroid/content/ContentProviderClient;->call(Ljava/lang/String;Ljava/lang/String;Landroid/os/Bundle;)Landroid/os/Bundle;

    move-result-object v1

    sget v3, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v4, 0x18

    if-lt v3, v4, :cond_3

    invoke-virtual {v0}, Landroid/content/ContentProviderClient;->release()Z

    goto :goto_0

    :cond_3
    invoke-virtual {v0}, Landroid/content/ContentProviderClient;->release()Z

    :goto_0
    if-eqz v1, :cond_6

    const-string v0, "code"

    const/4 v3, -0x1

    invoke-virtual {v1, v0, v3}, Landroid/os/BaseBundle;->getInt(Ljava/lang/String;I)I

    move-result v0

    if-nez v0, :cond_4

    const-string v0, "id"

    invoke-virtual {v1, v0}, Landroid/os/BaseBundle;->getString(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v2

    :cond_4
    if-eqz v2, :cond_5

    invoke-virtual {v2}, Ljava/lang/String;->length()I

    move-result v0

    if-eqz v0, :cond_5

    iget-object v0, p0, Lj0/c;->O:Ljava/lang/String;

    const-string v1, " success: "

    invoke-virtual {v1, v2}, Ljava/lang/String;->concat(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v1

    invoke-static {v0, v1}, Lm0/I;->O(Ljava/lang/String;Ljava/lang/String;)V

    invoke-virtual {p0}, Lj0/c;->a()Z

    move-result v0

    invoke-interface {p1, v0, v2}, Lg0/o;->o(ZLjava/lang/String;)V

    return-void

    :cond_5
    new-instance v0, Li0/l;

    new-instance v2, Ljava/lang/StringBuilder;

    const-string v3, "failed: "

    invoke-direct {v2, v3}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    const-string v3, "message"

    invoke-virtual {v1, v3}, Landroid/os/BaseBundle;->getString(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v2, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    invoke-direct {v0, v1}, Li0/l;-><init>(Ljava/lang/String;)V

    throw v0

    :cond_6
    new-instance v0, Li0/l;

    const-string v1, "bundle is null"

    invoke-direct {v0, v1}, Li0/l;-><init>(Ljava/lang/String;)V

    throw v0
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    :catch_0
    move-exception v0

    iget-object v1, p0, Lj0/c;->O:Ljava/lang/String;

    invoke-static {v0}, Ljava/lang/String;->valueOf(Ljava/lang/Object;)Ljava/lang/String;

    move-result-object v2

    const-string v3, "getOAID e:"

    invoke-virtual {v3, v2}, Ljava/lang/String;->concat(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v2

    invoke-static {v1, v2}, Lm0/I;->i(Ljava/lang/String;Ljava/lang/String;)V

    invoke-virtual {p0}, Lj0/c;->a()Z

    move-result v1

    const/16 v2, 0x65

    invoke-interface {p1, v1, v2, v0}, Lg0/o;->O(ZILjava/lang/Exception;)V

    return-void
.end method
