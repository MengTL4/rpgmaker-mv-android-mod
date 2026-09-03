package com.rmmod;

import android.content.Context;

/** 静态上下文持有器（避免到处传 Context） */
public class ModHub {
    private static Context context;

    public static void init(Context c) {
        if (c != null) context = c.getApplicationContext();
    }

    public static Context getContext() {
        return context;
    }
}
