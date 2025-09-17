export function requestNotificationPermission(): void {
  try {
    if (typeof window === "undefined" || typeof Notification === "undefined")
      return;
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {
        console.warn("[Notify] Permission request failed");
      });
    }
  } catch {}
}

export function showDesktopNotification(title: string, body: string): void {
  try {
    if (typeof window === "undefined" || typeof Notification === "undefined")
      return;
    if (Notification.permission === "default") {
      // Try to request once more on-demand
      Notification.requestPermission()
        .then((perm) => {
          if (perm === "granted") {
            new Notification(title, { body });
          } else {
            console.warn("[Notify] Permission not granted");
          }
        })
        .catch(() => {
          console.warn("[Notify] Permission request error");
        });
      return;
    }
    if (Notification.permission !== "granted") {
      console.warn("[Notify] Blocked by browser permissions");
      return;
    }
    // Show even when tab is visible to verify behavior; adjust later if needed
    new Notification(title, { body });
  } catch {}
}
