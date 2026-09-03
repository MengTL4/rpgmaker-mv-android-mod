package com.rmmod;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.content.SharedPreferences;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.TextView;

/**
 * 悬浮球入口（原生 Java，混合方案）：拖动在原生层，跟手且不受游戏 WebView 卡顿影响。
 * 点击 -> ModBridge.queue("menu") -> 游戏页 rmmod.js 打开 Vue 面板。
 * 挂在 Activity 的 DecorView 上（不用 TYPE_APPLICATION_OVERLAY，免悬浮窗权限，装完即用）。
 * 面板打开时由 JS 调 ModBridge.setBallVisible(false) 隐藏球，避免压在面板上。
 */
public class ModFloatingWindow {
    private static ModFloatingWindow instance;

    private final Activity activity;
    private View ball;
    private float downRawX, downRawY, startTx, startTy;
    private boolean moved;

    private ModFloatingWindow(Activity act) {
        this.activity = act;
    }

    public static void show(Activity act) {
        ModHub.init(act);
        if (instance == null) instance = new ModFloatingWindow(act);
        instance.attach();
    }

    public static void hide() {
        if (instance != null) instance.destroy();
    }

    /** 游戏页面板开关时调用（JS 桥转发），面板打开时藏球 */
    public static void setBallVisible(final boolean v) {
        if (instance == null || instance.ball == null) return;
        instance.activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (instance != null && instance.ball != null) {
                    instance.ball.setVisibility(v ? View.VISIBLE : View.GONE);
                }
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

        ball.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View v, MotionEvent e) {
                switch (e.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        downRawX = e.getRawX();
                        downRawY = e.getRawY();
                        // 用父容器内绝对坐标（getX=getLeft+translation）做起点，兼容 margin 定位
                        startTx = v.getX();
                        startTy = v.getY();
                        moved = false;
                        v.setScaleX(0.9f);
                        v.setScaleY(0.9f);
                        return true;
                    case MotionEvent.ACTION_MOVE: {
                        float nx = clamp(startTx + (e.getRawX() - downRawX), 0, maxTx());
                        float ny = clamp(startTy + (e.getRawY() - downRawY), 0, maxTy());
                        if (!moved && (Math.abs(nx - startTx) > dp(6) || Math.abs(ny - startTy) > dp(6))) moved = true;
                        // 绝对位置换算回 translation（left/top 由 LayoutParams margin 决定）
                        v.setTranslationX(nx - v.getLeft());
                        v.setTranslationY(ny - v.getTop());
                        return true;
                    }
                    case MotionEvent.ACTION_UP:
                    case MotionEvent.ACTION_CANCEL:
                        v.setScaleX(1f);
                        v.setScaleY(1f);
                        if (!moved) {
                            ModBridge.queue("menu");
                        } else {
                            // 存视图绝对坐标（getX = left+translation），避免 margin/translation 混用导致重启后漂移
                            savePos(v.getX(), v.getY());
                        }
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
            return;
        }
        ball = buildBall();
        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(dp(46), dp(46), Gravity.TOP | Gravity.START);
        int[] pos = loadPos();
        lp.leftMargin = pos[0];
        lp.topMargin = pos[1];
        FrameLayout decor = (FrameLayout) activity.getWindow().getDecorView();
        try {
            decor.addView(ball, lp);
        } catch (Exception ignored) {
            ball = null;
        }
    }

    private void destroy() {
        try {
            if (ball != null && ball.getParent() != null) {
                ((FrameLayout) ball.getParent()).removeView(ball);
            }
        } catch (Exception ignored) {}
        ball = null;
        instance = null;
    }

    private int[] loadPos() {
        try {
            SharedPreferences sp = activity.getSharedPreferences("rmmod_prefs", 0);
            int x = Math.max(0, sp.getInt("ball_x", dp(8)));
            int y = Math.max(0, sp.getInt("ball_y", dp(200)));
            return new int[]{x, y};
        } catch (Exception e) {
            return new int[]{dp(8), dp(200)};
        }
    }

    private void savePos(float x, float y) {
        try {
            activity.getSharedPreferences("rmmod_prefs", 0).edit()
                    .putInt("ball_x", Math.round(x)).putInt("ball_y", Math.round(y)).apply();
        } catch (Exception ignored) {}
    }

    private float maxTx() {
        View decor = activity.getWindow().getDecorView();
        return Math.max(0, decor.getWidth() - dp(46));
    }

    private float maxTy() {
        View decor = activity.getWindow().getDecorView();
        return Math.max(0, decor.getHeight() - dp(46));
    }

    private static float clamp(float v, float min, float max) {
        return v < min ? min : (v > max ? max : v);
    }

    private int dp(int v) {
        return Math.round(v * activity.getResources().getDisplayMetrics().density);
    }
}
