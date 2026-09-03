package com.rmmod;

import android.webkit.JavascriptInterface;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

/**
 * 悬浮窗(Java) <-> 游戏页面(mod.js) 的桥。
 * 注册成 window.MOD（在 MainActivity.createWebsite 里 addJavascriptInterface）。
 * - Java 侧按钮 -> ModBridge.queue("cmd") 入队
 * - 游戏侧 mod.js 每 300ms 调 takeCommand() 拉取并执行
 * - mod.js 调 report(json) 回传状态，悬浮窗轮询 lastReport() 显示
 */
public class ModBridge {
    private static final Queue<String> commands = new ConcurrentLinkedQueue<>();
    private static final Queue<String> logs = new ConcurrentLinkedQueue<>();
    private static volatile String lastReport = "";
    private static volatile String lastResponse = "";

    /** Java 侧入队一条命令（线程安全） */
    public static void queue(String cmd) {
        if (cmd != null) commands.add(cmd);
    }

    /** 悬浮窗轮询：取最近一条回传 */
    public static String lastReport() {
        return lastReport;
    }

    /** 数据面板轮询：取一次列表回包并清空 */
    public static String takeResponse() {
        String r = lastResponse;
        lastResponse = "";
        return r;
    }

    /** 悬浮窗轮询：取日志 */
    public static String pollLog() {
        return logs.poll();
    }

    // ---- 以下为 @JavascriptInterface，游戏页可调用 ----

    @JavascriptInterface
    public String takeCommand() {
        return commands.poll();
    }

    /** 把捕获到的脚本/密钥写到应用外部目录，方便 adb pull */
    @JavascriptInterface
    public String saveFile(String name, String content) {
        try {
            android.content.Context ctx = com.rmmod.ModHub.getContext();
            if (ctx == null) return "noctx";
            java.io.File dir = new java.io.File(ctx.getExternalFilesDir(null), "rmmod-capture");
            dir.mkdirs();
            java.io.File f = new java.io.File(dir, name.replaceAll("[^a-zA-Z0-9._-]", "_"));
            java.io.FileOutputStream fos = new java.io.FileOutputStream(f);
            fos.write(content.getBytes("UTF-8"));
            fos.close();
            return f.getAbsolutePath();
        } catch (Throwable t) {
            return "err:" + t.getMessage();
        }
    }

    @JavascriptInterface
    public void report(String json) {
        if (json != null) lastReport = json;
    }

    /** mod.js 列表查询的回包 */
    @JavascriptInterface
    public void respond(String json) {
        if (json != null) lastResponse = json;
    }

    @JavascriptInterface
    public void log(String msg) {
        if (msg != null) {
            logs.add(msg);
            android.util.Log.i("RMMOD", msg);
        }
    }

    /** 游戏页面板开关时隐藏/显示原生悬浮球（避免球压在面板上） */
    @JavascriptInterface
    public void setBallVisible(boolean v) {
        try {
            ModFloatingWindow.setBallVisible(v);
        } catch (Throwable ignored) {}
    }
}
