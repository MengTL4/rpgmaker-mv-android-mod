package com.rmmod;

import android.app.Activity;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewConfiguration;
import android.widget.FrameLayout;
import android.widget.TextView;

/**
 * 悬浮球入口（原生 Java，混合方案）：拖动在原生层，跟手且不受游戏 WebView 卡顿影响。
 * 点击 -> ModBridge.queue("menu") -> 游戏页 rmmod.js 打开 Vue 面板。
 * 挂在 Activity 的 DecorView 上（不用 TYPE_APPLICATION_OVERLAY，免悬浮窗权限，装完即用）。
 * 面板打开时由 JS 调 ModBridge.setBallVisible(false) 隐藏球，避免压在面板上。
 *
 * 定位：LayoutParams 固定在左上角（无 margin），位置完全由 translationX/Y 表示（= 父容器内绝对坐标）。
 * 松手后吸附到最近的左/右边缘；持久化"贴哪一边 + 纵向坐标"，屏幕尺寸变化（旋转、分屏、
 * 换设备恢复数据）时按新尺寸重新摆放，保证球始终在屏幕内。
 */
public class ModFloatingWindow {
    private static final String PREFS = "rmmod_prefs";
    private static final int SIZE_DP = 46;
    private static final int EDGE_DP = 4;

    private static ModFloatingWindow instance;

    private final Activity activity;
    private View ball;
    private View.OnLayoutChangeListener decorListener;
    private float downRawX, downRawY, startTx, startTy;
    private boolean moved;
    /** 0 = 贴左, 1 = 贴右 */
    private int side;
    private int posY;

    private ModFloatingWindow(Activity act) {
        this.activity = act;
    }

    public static void show(Activity act) {
        if (act == null) return;
        ModHub.init(act);
        // Activity 重建后旧实例持有已销毁的 Activity，球挂在旧窗口上看不见，需换新
        if (instance != null && instance.activity != act) instance.destroy();
        if (instance == null) instance = new ModFloatingWindow(act);
        instance.attach();
    }

    public static void hide() {
        if (instance == null) return;
        // 重建时新 Activity 可能先 show、旧 Activity 后 onDestroy -> hide；
        // 只在当前实例所属 Activity 确实在销毁时才拆球，避免把新球误删
        Activity a = instance.activity;
        boolean dying = a.isFinishing();
        try { dying = dying || a.isDestroyed(); } catch (Throwable ignored) {}
        if (dying) instance.destroy();
    }

    /** 游戏页面板开关时调用（JS 桥转发，非 UI 线程），面板打开时藏球 */
    public static void setBallVisible(final boolean v) {
        final ModFloatingWindow w = instance;
        if (w == null) return;
        w.activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (w != instance || w.ball == null) return;
                w.ball.setVisibility(v ? View.VISIBLE : View.GONE);
                if (v) w.place(false);
            }
        });
    }

    private View buildBall() {
        // LGLTeam/SemiJni 风格：深色渐变圆底 + 绿色描边 + MOD 字样（静态，无动画）
        TextView ball = new TextView(activity);
        ball.setText("MOD");
        ball.setTextColor(Color.WHITE);
        ball.setTextSize(11);
        ball.setGravity(Gravity.CENTER);
        GradientDrawable gd = new GradientDrawable(GradientDrawable.Orientation.TOP_BOTTOM,
                new int[]{0xF2283648, 0xF2141A24});
        gd.setShape(GradientDrawable.OVAL);
        gd.setStroke(dp(2), 0xFF3DDC2E);
        ball.setBackground(gd);
        ball.setElevation(dp(6)); // 圆形背景自带轮廓阴影
        ball.setTypeface(null, android.graphics.Typeface.BOLD);
        ball.setContentDescription("MOD");

        final int slop = ViewConfiguration.get(activity).getScaledTouchSlop();
        ball.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View v, MotionEvent e) {
                switch (e.getActionMasked()) {
                    case MotionEvent.ACTION_DOWN:
                        v.animate().cancel();
                        downRawX = e.getRawX();
                        downRawY = e.getRawY();
                        startTx = v.getTranslationX();
                        startTy = v.getTranslationY();
                        moved = false;
                        v.setScaleX(0.9f);
                        v.setScaleY(0.9f);
                        return true;
                    case MotionEvent.ACTION_MOVE: {
                        float dx = e.getRawX() - downRawX, dy = e.getRawY() - downRawY;
                        if (!moved && (Math.abs(dx) > slop || Math.abs(dy) > slop)) moved = true;
                        if (moved) {
                            v.setTranslationX(clamp(startTx + dx, 0, maxX()));
                            v.setTranslationY(clamp(startTy + dy, 0, maxY()));
                        }
                        return true;
                    }
                    case MotionEvent.ACTION_UP:
                        v.setScaleX(1f);
                        v.setScaleY(1f);
                        if (moved) snapToEdge(v);
                        else ModBridge.queue("menu");
                        return true;
                    case MotionEvent.ACTION_CANCEL:
                        // 系统取消（来电、手势被拦截等）不是点击，不能开面板
                        v.setScaleX(1f);
                        v.setScaleY(1f);
                        if (moved) snapToEdge(v);
                        return true;
                }
                return false;
            }
        });
        return ball;
    }

    private void attach() {
        if (ball != null && ball.getParent() != null) {
            ball.setVisibility(View.VISIBLE);
            place(false);
            return;
        }
        loadPos();
        ball = buildBall();
        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(dp(SIZE_DP), dp(SIZE_DP), Gravity.TOP | Gravity.START);
        final FrameLayout decor = (FrameLayout) activity.getWindow().getDecorView();
        try {
            decor.addView(ball, lp);
        } catch (Exception ignored) {
            ball = null;
            return;
        }
        // 尺寸未知前先按保存值放（左侧/纵向），布局完成后按真实尺寸校正
        ball.setTranslationX(dp(EDGE_DP));
        ball.setTranslationY(posY);
        decorListener = new View.OnLayoutChangeListener() {
            @Override
            public void onLayoutChange(View v, int l, int t, int r, int b, int ol, int ot, int or, int ob) {
                if ((r - l) != (or - ol) || (b - t) != (ob - ot)) place(false);
            }
        };
        decor.addOnLayoutChangeListener(decorListener);
        decor.post(new Runnable() {
            @Override
            public void run() { place(false); }
        });
    }

    /** 按 side/posY 摆放到当前父容器尺寸内 */
    private void place(boolean animate) {
        if (ball == null) return;
        View decor = activity.getWindow().getDecorView();
        if (decor.getWidth() <= 0 || decor.getHeight() <= 0) return;
        float x = side == 1 ? maxX() - dp(EDGE_DP) : dp(EDGE_DP);
        float y = clamp(posY, 0, maxY());
        x = clamp(x, 0, maxX());
        if (animate) {
            ball.animate().translationX(x).translationY(y).setDuration(180).start();
        } else {
            ball.animate().cancel();
            ball.setTranslationX(x);
            ball.setTranslationY(y);
        }
    }

    private void snapToEdge(View v) {
        float centerX = v.getTranslationX() + dp(SIZE_DP) / 2f;
        View decor = activity.getWindow().getDecorView();
        side = centerX > decor.getWidth() / 2f ? 1 : 0;
        posY = Math.round(clamp(v.getTranslationY(), 0, maxY()));
        savePos();
        place(true);
    }

    private void destroy() {
        try {
            View decor = activity.getWindow().getDecorView();
            if (decorListener != null) decor.removeOnLayoutChangeListener(decorListener);
        } catch (Exception ignored) {}
        decorListener = null;
        try {
            if (ball != null && ball.getParent() != null) {
                ((FrameLayout) ball.getParent()).removeView(ball);
            }
        } catch (Exception ignored) {}
        ball = null;
        if (instance == this) instance = null;
    }

    private void loadPos() {
        try {
            SharedPreferences sp = activity.getSharedPreferences(PREFS, 0);
            side = sp.getInt("ball_side", 0) == 1 ? 1 : 0;
            posY = Math.max(0, sp.getInt("ball_y", dp(200)));
        } catch (Exception e) {
            side = 0;
            posY = dp(200);
        }
    }

    private void savePos() {
        try {
            activity.getSharedPreferences(PREFS, 0).edit()
                    .putInt("ball_side", side).putInt("ball_y", posY).apply();
        } catch (Exception ignored) {}
    }

    private float maxX() {
        View decor = activity.getWindow().getDecorView();
        return Math.max(0, decor.getWidth() - dp(SIZE_DP));
    }

    private float maxY() {
        View decor = activity.getWindow().getDecorView();
        return Math.max(0, decor.getHeight() - dp(SIZE_DP));
    }

    private static float clamp(float v, float min, float max) {
        return v < min ? min : (v > max ? max : v);
    }

    private int dp(int v) {
        return Math.round(v * activity.getResources().getDisplayMetrics().density);
    }
}
