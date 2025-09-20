type TimerId = ReturnType<typeof setTimeout>;

const scheduled: Map<number, TimerId> = new Map();

export function scheduleReminder(
  messageId: number,
  text: string,
  triggerAt: Date
): void {
  try {
    cancelReminder(messageId);
    const delay = Math.max(0, triggerAt.getTime() - Date.now());
    const id = setTimeout(() => {
      try {
        if (typeof Notification !== 'undefined') {
          if (Notification.permission === 'default') {
            Notification.requestPermission().then(perm => {
              if (perm === 'granted')
                new Notification('Reminder', { body: text });
            });
          } else if (Notification.permission === 'granted') {
            new Notification('Reminder', { body: text });
          }
        } else {
          // Fallback
          alert(`Reminder: ${text}`);
        }
      } finally {
        scheduled.delete(messageId);
      }
    }, delay);
    scheduled.set(messageId, id);
  } catch {}
}

export function cancelReminder(messageId: number): void {
  const id = scheduled.get(messageId);
  if (id) {
    clearTimeout(id);
    scheduled.delete(messageId);
  }
}
