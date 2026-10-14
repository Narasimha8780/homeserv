package in.homeserv.app;

import android.app.Dialog;
import android.os.Bundle;
import android.os.Message;
import android.view.ViewGroup;
import android.view.Window;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

/**
 * Keeps JavaScript popups inside the app.
 *
 * phone.email verifies a number in a window.open() popup and posts the result back
 * to window.opener. The default Capacitor WebView hands window.open() to Chrome,
 * which runs in another process, so window.opener is null there and the result
 * never reaches us. Enabling multiple-window support and servicing onCreateWindow
 * with a child WebView keeps the popup in this WebView, where the opener link —
 * and therefore postMessage — still works.
 */
public class MainActivity extends BridgeActivity {

    private Dialog popupDialog;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Bridge bridge = getBridge();
        WebView webView = bridge.getWebView();

        WebSettings settings = webView.getSettings();
        settings.setSupportMultipleWindows(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);

        webView.setWebChromeClient(new PopupAwareChromeClient(bridge));
    }

    private class PopupAwareChromeClient extends BridgeWebChromeClient {

        PopupAwareChromeClient(Bridge bridge) {
            super(bridge);
        }

        @Override
        public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
            WebView popupView = new WebView(MainActivity.this);

            WebSettings popupSettings = popupView.getSettings();
            popupSettings.setJavaScriptEnabled(true);
            popupSettings.setDomStorageEnabled(true);
            popupSettings.setSupportMultipleWindows(true);
            popupSettings.setJavaScriptCanOpenWindowsAutomatically(true);

            // Without a WebViewClient the WebView hands navigation to the system,
            // which would send the popup straight back out to Chrome.
            popupView.setWebViewClient(new WebViewClient());

            // The page closes itself once verification finishes.
            popupView.setWebChromeClient(
                new WebChromeClient() {
                    @Override
                    public void onCloseWindow(WebView window) {
                        dismissPopup();
                    }
                }
            );

            popupDialog = new Dialog(MainActivity.this, android.R.style.Theme_Material_Light_Dialog_NoActionBar);
            Window dialogWindow = popupDialog.getWindow();
            if (dialogWindow != null) {
                dialogWindow.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
            }
            popupDialog.setContentView(
                popupView,
                new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
            );
            // Dismissing by Back must also tear the WebView down, or it keeps running.
            popupDialog.setOnDismissListener(d -> destroyPopupView(popupView));
            popupDialog.show();

            // Handing the WebView back through the transport is what preserves
            // window.opener on the new window.
            WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
            transport.setWebView(popupView);
            resultMsg.sendToTarget();
            return true;
        }

        @Override
        public void onCloseWindow(WebView window) {
            dismissPopup();
        }
    }

    private void dismissPopup() {
        if (popupDialog != null && popupDialog.isShowing()) {
            popupDialog.dismiss();
        }
        popupDialog = null;
    }

    private void destroyPopupView(WebView popupView) {
        ViewGroup parent = (ViewGroup) popupView.getParent();
        if (parent != null) {
            parent.removeView(popupView);
        }
        popupView.loadUrl("about:blank");
        popupView.destroy();
    }
}
