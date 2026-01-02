import { getToken, onMessage } from 'firebase/messaging';
import type { Messaging } from 'firebase/messaging';
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db, getFirebaseMessaging } from './firebase';

// VAPID key for web push - get this from Firebase Console > Project Settings > Cloud Messaging
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

export interface NotificationPreferences {
  newRecipes: boolean;
  mealReminders: boolean;
  reminderTime: string; // HH:MM format
}

export interface UserNotificationToken {
  token: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: NotificationPreferences;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  newRecipes: true,
  mealReminders: true,
  reminderTime: '08:00',
};

// Check if notifications are supported
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

// Get current notification permission status
export function getNotificationPermissionStatus(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported in this browser');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

// Register service worker and get FCM token
export async function registerForPushNotifications(
  userId: string
): Promise<string | null> {
  try {
    // Check if notifications are supported
    if (!isNotificationSupported()) {
      console.warn('Push notifications not supported');
      return null;
    }

    // Check permission
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    // Get messaging instance
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.warn('Firebase Messaging not supported');
      return null;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js'
    );
    console.log('Service Worker registered:', registration);

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      // Save token to Firestore
      await saveTokenToFirestore(userId, token);

      // Set up foreground message handler
      setupForegroundMessageHandler(messaging);

      console.log('FCM Token obtained:', token);
      return token;
    }

    console.warn('No FCM token received');
    return null;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

// Save FCM token to Firestore
async function saveTokenToFirestore(
  userId: string,
  token: string
): Promise<void> {
  const tokenDoc = doc(db, 'notificationTokens', token);
  const existingToken = await getDoc(tokenDoc);

  const preferences = existingToken.exists()
    ? existingToken.data()?.preferences || DEFAULT_PREFERENCES
    : DEFAULT_PREFERENCES;

  await setDoc(tokenDoc, {
    token,
    userId,
    preferences,
    updatedAt: serverTimestamp(),
    ...(existingToken.exists() ? {} : { createdAt: serverTimestamp() }),
  });
}

// Remove FCM token from Firestore
export async function unregisterFromPushNotifications(
  token: string
): Promise<void> {
  try {
    await deleteDoc(doc(db, 'notificationTokens', token));
    console.log('FCM token removed from Firestore');
  } catch (error) {
    console.error('Error removing FCM token:', error);
  }
}

// Update notification preferences
export async function updateNotificationPreferences(
  token: string,
  preferences: Partial<NotificationPreferences>
): Promise<void> {
  try {
    const tokenDoc = doc(db, 'notificationTokens', token);
    const existingDoc = await getDoc(tokenDoc);

    if (existingDoc.exists()) {
      const currentPrefs = existingDoc.data()?.preferences || DEFAULT_PREFERENCES;
      await setDoc(
        tokenDoc,
        {
          preferences: { ...currentPrefs, ...preferences },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (error) {
    console.error('Error updating notification preferences:', error);
  }
}

// Get user's notification preferences
export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences | null> {
  try {
    const tokensQuery = query(
      collection(db, 'notificationTokens'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(tokensQuery);

    if (!snapshot.empty) {
      const tokenData = snapshot.docs[0].data();
      return tokenData.preferences || DEFAULT_PREFERENCES;
    }

    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

// Set up foreground message handler
function setupForegroundMessageHandler(messaging: Messaging): void {
  onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);

    // Show a notification even when app is in foreground
    if (Notification.permission === 'granted') {
      const title = payload.notification?.title || 'SharedPlate';
      const options: NotificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: payload.data?.tag || 'sharedplate-foreground',
        data: payload.data,
      };

      new Notification(title, options);
    }

    // Dispatch custom event for in-app handling
    window.dispatchEvent(
      new CustomEvent('fcm-message', { detail: payload })
    );
  });
}

// Send local notification (for reminders scheduled on device)
export function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, string>
): void {
  if (Notification.permission !== 'granted') return;

  new Notification(title, {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data,
  });
}

// Schedule a meal reminder notification
export function scheduleMealReminder(
  mealTime: Date,
  mealName: string,
  recipeName: string
): number {
  const now = new Date();
  const delay = mealTime.getTime() - now.getTime();

  if (delay <= 0) return -1;

  const timerId = window.setTimeout(() => {
    sendLocalNotification(
      `Time for ${mealName}!`,
      `Don't forget: ${recipeName} is on your meal plan`,
      { type: 'meal_reminder', url: '/meal-planner' }
    );
  }, delay);

  return timerId;
}

// Cancel a scheduled reminder
export function cancelScheduledReminder(timerId: number): void {
  window.clearTimeout(timerId);
}

// Get all tokens for a user (for sending notifications)
export async function getUserTokens(userId: string): Promise<string[]> {
  try {
    const tokensQuery = query(
      collection(db, 'notificationTokens'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(tokensQuery);

    return snapshot.docs.map((doc) => doc.data().token);
  } catch (error) {
    console.error('Error getting user tokens:', error);
    return [];
  }
}
