import { useState, useEffect } from 'react';
import { useAppSelector } from '../../store';
import {
  isNotificationSupported,
  getNotificationPermissionStatus,
  registerForPushNotifications,
} from '../../services/notificationService';

interface NotificationPromptProps {
  onDismiss?: () => void;
}

export default function NotificationPrompt({ onDismiss }: NotificationPromptProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if we should show the prompt
    const shouldShowPrompt = () => {
      if (!isNotificationSupported()) return false;

      const permission = getNotificationPermissionStatus();
      if (permission !== 'default') return false;

      // Check if user dismissed the prompt before
      const dismissed = localStorage.getItem('notification-prompt-dismissed');
      if (dismissed) {
        const dismissedDate = new Date(dismissed);
        const daysSinceDismissed =
          (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
        // Show again after 7 days
        if (daysSinceDismissed < 7) return false;
      }

      return true;
    };

    // Delay showing the prompt for better UX
    const timer = setTimeout(() => {
      if (shouldShowPrompt() && user) {
        setIsVisible(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [user]);

  const handleEnable = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const token = await registerForPushNotifications(user.uid);
      if (token) {
        console.log('Push notifications enabled');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setIsLoading(false);
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('notification-prompt-dismissed', new Date().toISOString());
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-50 px-4 animate-slideInRight">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 max-w-sm mx-auto">
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm">
              Enable Notifications
            </h3>
            <p className="text-gray-600 text-xs mt-0.5">
              Get notified about new recipes and meal reminders
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Not Now
          </button>
          <button
            onClick={handleEnable}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Enabling...' : 'Enable'}
          </button>
        </div>
      </div>
    </div>
  );
}
