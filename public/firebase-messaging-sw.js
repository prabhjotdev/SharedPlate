// Firebase Messaging Service Worker
// This service worker handles background push notifications

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
// Note: These values are populated at runtime from environment variables
firebase.initializeApp({
  apiKey: self.FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: self.FIREBASE_AUTH_DOMAIN || 'YOUR_PROJECT.firebaseapp.com',
  projectId: self.FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: self.FIREBASE_STORAGE_BUCKET || 'YOUR_PROJECT.appspot.com',
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId: self.FIREBASE_APP_ID || 'YOUR_APP_ID',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'SharedPlate';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: payload.data?.tag || 'sharedplate-notification',
    data: payload.data,
    actions: getNotificationActions(payload.data?.type),
    vibrate: [100, 50, 100],
    requireInteraction: payload.data?.type === 'meal_reminder',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Get notification actions based on type
function getNotificationActions(type) {
  switch (type) {
    case 'new_recipe':
      return [
        { action: 'view', title: 'View Recipe' },
        { action: 'dismiss', title: 'Dismiss' },
      ];
    case 'meal_reminder':
      return [
        { action: 'view_meal', title: 'View Meal Plan' },
        { action: 'snooze', title: 'Remind Later' },
      ];
    default:
      return [{ action: 'open', title: 'Open App' }];
  }
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click:', event.action);
  event.notification.close();

  const data = event.notification.data || {};
  let urlToOpen = '/';

  switch (event.action) {
    case 'view':
      urlToOpen = data.recipeId ? `/recipe/${data.recipeId}` : '/';
      break;
    case 'view_meal':
      urlToOpen = '/meal-planner';
      break;
    case 'snooze':
      // Snooze for 30 minutes - schedule a new notification
      scheduleSnoozeReminder(data);
      return;
    case 'dismiss':
      return;
    default:
      urlToOpen = data.url || '/';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'NAVIGATE', url: urlToOpen });
          return client.focus();
        }
      }
      // Open a new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Schedule a snooze reminder (30 minutes)
function scheduleSnoozeReminder(data) {
  const snoozeTime = 30 * 60 * 1000; // 30 minutes

  setTimeout(() => {
    self.registration.showNotification('Meal Reminder', {
      body: data.body || "Don't forget about your meal plan!",
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'meal-reminder-snooze',
      data: { ...data, type: 'meal_reminder' },
      actions: [
        { action: 'view_meal', title: 'View Meal Plan' },
        { action: 'snooze', title: 'Remind Later' },
      ],
      requireInteraction: true,
    });
  }, snoozeTime);
}
