import { useState, useEffect } from 'react';
import { useAppSelector } from '../../store';
import {
  isNotificationSupported,
  getNotificationPermissionStatus,
  registerForPushNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../../services/notificationService';
import type { NotificationPreferences } from '../../services/notificationService';

export default function NotificationSettings() {
  const { user } = useAppSelector((state) => state.auth);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    newRecipes: true,
    mealReminders: true,
    reminderTime: '08:00',
  });
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsSupported(isNotificationSupported());
    setPermission(getNotificationPermissionStatus());

    // Load saved token from localStorage
    const savedToken = localStorage.getItem('fcm-token');
    if (savedToken) {
      setFcmToken(savedToken);
    }

    // Load preferences
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    const prefs = await getNotificationPreferences(user.uid);
    if (prefs) {
      setPreferences(prefs);
    }
  };

  const handleEnableNotifications = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const token = await registerForPushNotifications(user.uid);
      if (token) {
        setFcmToken(token);
        localStorage.setItem('fcm-token', token);
        setPermission('granted');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = async (
    key: keyof NotificationPreferences,
    value: boolean | string
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    if (fcmToken) {
      await updateNotificationPreferences(fcmToken, { [key]: value });
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-gray-50 rounded-xl">
        <p className="text-sm text-gray-500">
          Push notifications are not supported in your browser.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Enable/Status Section */}
      {permission !== 'granted' ? (
        <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl">
          <div className="flex-1">
            <p className="font-medium text-gray-900">Enable Notifications</p>
            <p className="text-sm text-gray-600 mt-0.5">
              {permission === 'denied'
                ? 'Notifications are blocked. Enable them in browser settings.'
                : 'Get notified about new recipes and meal reminders'}
            </p>
          </div>
          <button
            onClick={handleEnableNotifications}
            disabled={isLoading || permission === 'denied'}
            className="ml-4 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Enabling...' : permission === 'denied' ? 'Blocked' : 'Enable'}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-medium text-green-700">
            Notifications enabled
          </span>
        </div>
      )}

      {/* Notification Preferences */}
      {permission === 'granted' && (
        <div className="space-y-3">
          {/* New Recipes */}
          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
            <div>
              <p className="font-medium text-gray-900">New Recipes</p>
              <p className="text-sm text-gray-500">
                When family members add new recipes
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.newRecipes}
                onChange={(e) =>
                  handlePreferenceChange('newRecipes', e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Meal Reminders */}
          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
            <div>
              <p className="font-medium text-gray-900">Meal Reminders</p>
              <p className="text-sm text-gray-500">
                Daily reminder for your meal plan
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.mealReminders}
                onChange={(e) =>
                  handlePreferenceChange('mealReminders', e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Reminder Time */}
          {preferences.mealReminders && (
            <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
              <div>
                <p className="font-medium text-gray-900">Reminder Time</p>
                <p className="text-sm text-gray-500">
                  When to receive daily reminders
                </p>
              </div>
              <input
                type="time"
                value={preferences.reminderTime}
                onChange={(e) =>
                  handlePreferenceChange('reminderTime', e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
