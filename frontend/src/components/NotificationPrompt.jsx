import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { registerServiceWorker, ensurePushSubscription } from "../utils/pwaClient";

const STORAGE_KEY = "furadopt-notifications-dismissed";

const supportsNotifications = () =>
  typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;

const NotificationPrompt = () => {
  const [permission, setPermission] = useState(() =>
    supportsNotifications() ? Notification.permission : "unsupported"
  );
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(STORAGE_KEY) === "1");
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (!supportsNotifications()) return;
    const handleVisibility = () => setPermission(Notification.permission);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const showPrompt = useMemo(() => {
    if (!supportsNotifications()) return false;
    if (dismissed) return false;
    if (permission === "granted") return false;
    return true;
  }, [dismissed, permission]);

  if (!showPrompt) return null;

  const handleEnable = async () => {
    if (!supportsNotifications()) return;
    setIsBusy(true);
    try {
      await registerServiceWorker();
      await ensurePushSubscription();
      setPermission(Notification.permission);
      if (Notification.permission === "granted") {
        localStorage.setItem(STORAGE_KEY, "1");
        setDismissed(true);
      }
    } catch (error) {
      console.error("Failed to enable notifications", error);
    } finally {
      setIsBusy(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  };

  const isDenied = permission === "denied";

  return (
    <div className="notification-banner" role="status" aria-live="polite">
      <div className="notification-copy">
        <Bell size={18} />
        <div>
          <p className="notification-title">Stay updated</p>
          <p className="notification-sub">
            {isDenied
              ? "Notifications are blocked in your browser settings. Enable them to get chat and adoption updates."
              : "Enable notifications to get real-time chat and adoption updates."}
          </p>
        </div>
      </div>
      <div className="notification-actions">
        {!isDenied && (
          <button className="btn-primary" onClick={handleEnable} disabled={isBusy}>
            {isBusy ? "Enabling..." : "Enable"}
          </button>
        )}
        <button className="btn-ghost" onClick={handleDismiss}>
          {isDenied ? "Got it" : "Later"}
        </button>
      </div>
    </div>
  );
};

export default NotificationPrompt;
