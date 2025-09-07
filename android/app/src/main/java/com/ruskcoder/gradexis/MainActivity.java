package com.ruskcoder.gradexis;

import com.getcapacitor.BridgeActivity;
import com.capacitorjs.plugins.pushnotifications.PushNotificationsPlugin;
import com.capacitorjs.plugins.localnotifications.LocalNotificationsPlugin;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Set the theme to remove splash before calling super.onCreate()
        setTheme(R.style.AppTheme_NoActionBar);
        super.onCreate(savedInstanceState);
        
        // Configure edge-to-edge display
        configureEdgeToEdge();
        
        // Initialize plugins
        registerPlugin(PushNotificationsPlugin.class);
        registerPlugin(LocalNotificationsPlugin.class);
    }

    private void configureEdgeToEdge() {
        Window window = getWindow();
        
        // Enable edge-to-edge layout
        WindowCompat.setDecorFitsSystemWindows(window, false);
        
        // Make status bar and navigation bar transparent
        window.setFlags(
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
        );
        
        // Ensure the webview can draw behind system bars
        window.getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        );
    }
}
