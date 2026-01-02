import { useEffect, useRef } from 'react';
import { useAppSelector } from '../store';
import {
  getNotificationPreferences,
  getNotificationPermissionStatus,
} from '../services/notificationService';
import { scheduleDailyMealReminder } from '../services/notificationTriggers';

export function useMealReminders() {
  const { user } = useAppSelector((state) => state.auth);
  const { household } = useAppSelector((state) => state.household);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Only initialize once per session
    if (initializedRef.current || !user || !household) return;

    const initializeReminders = async () => {
      // Check if notifications are enabled
      if (getNotificationPermissionStatus() !== 'granted') {
        return;
      }

      // Get user's notification preferences
      const preferences = await getNotificationPreferences(user.uid);

      // If meal reminders are enabled, schedule them
      if (preferences?.mealReminders) {
        const reminderTime = preferences.reminderTime || '08:00';
        scheduleDailyMealReminder(user.uid, household.id, reminderTime);
        console.log(`Meal reminders scheduled for ${reminderTime}`);
      }

      initializedRef.current = true;
    };

    initializeReminders();
  }, [user, household]);
}
