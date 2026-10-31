export class NotificationService {
  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public static getPermission(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  public static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const res = await Notification.requestPermission();
      return res === 'granted';
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return false;
    }
  }

  public static sendNotification(title: string, options?: NotificationOptions): boolean {
    if (!this.isSupported() || Notification.permission !== 'granted') return false;

    try {
      new Notification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        ...options
      });
      return true;
    } catch (e) {
      console.warn('Failed to send notification:', e);
      return false;
    }
  }

  public static checkAndTriggerAlerts(
    dueRevisionsCount: number,
    overdueTopicsCount: number,
    hasLoggedToday: boolean
  ) {
    if (!this.isSupported() || Notification.permission !== 'granted') return;

    const lastAlertKey = 'fde_last_daily_alert_date';
    const todayStr = new Date().toISOString().split('T')[0];
    const lastAlert = typeof localStorage !== 'undefined' ? localStorage.getItem(lastAlertKey) : null;

    if (lastAlert === todayStr) {
      return; // Already notified today
    }

    if (dueRevisionsCount > 0) {
      this.sendNotification(`Spaced Repetition: ${dueRevisionsCount} Problems Due`, {
        body: `You have ${dueRevisionsCount} DSA/topic revisions due for review today to lock in long-term memory.`
      });
    } else if (overdueTopicsCount > 0) {
      this.sendNotification(`Study Planner: ${overdueTopicsCount} Topics Overdue`, {
        body: `Use the 1-Tap Reschedule in the Planner tab to catch up your schedule.`
      });
    } else if (!hasLoggedToday) {
      const currentHour = new Date().getHours();
      if (currentHour >= 18) {
        // Evening reminder
        this.sendNotification(`FDE Daily Tracking Reminder`, {
          body: `Keep your No Zero Days streak alive! Log your study time in under 30 seconds.`
        });
      }
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(lastAlertKey, todayStr);
    }
  }
}
