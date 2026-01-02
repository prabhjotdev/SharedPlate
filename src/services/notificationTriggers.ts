import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { sendLocalNotification } from './notificationService';

// Types for notification payloads
interface NotificationPayload {
  type: 'new_recipe' | 'meal_reminder' | 'shopping_update';
  title: string;
  body: string;
  data?: Record<string, string>;
  householdId: string;
  createdBy: string;
  createdAt: ReturnType<typeof serverTimestamp>;
  targetUserIds?: string[]; // If not provided, sends to all household members except creator
}

// Queue a notification for processing by Cloud Functions
// This creates a document that Firebase Cloud Functions can listen to
// and send actual push notifications to users' devices
export async function queueNotification(
  payload: Omit<NotificationPayload, 'createdAt'>
): Promise<void> {
  try {
    await addDoc(collection(db, 'notificationQueue'), {
      ...payload,
      createdAt: serverTimestamp(),
      processed: false,
    });
    console.log('Notification queued:', payload.type);
  } catch (error) {
    console.error('Error queuing notification:', error);
  }
}

// Trigger notification when a new recipe is added
export async function notifyNewRecipe(
  recipeId: string,
  recipeTitle: string,
  creatorName: string,
  creatorId: string,
  householdId: string
): Promise<void> {
  await queueNotification({
    type: 'new_recipe',
    title: 'New Recipe Added',
    body: `${creatorName} added "${recipeTitle}" to your shared recipes`,
    data: {
      recipeId,
      type: 'new_recipe',
      url: `/recipe/${recipeId}`,
    },
    householdId,
    createdBy: creatorId,
  });
}

// Trigger meal reminder notification
export async function notifyMealReminder(
  userId: string,
  householdId: string,
  mealType: string,
  recipeName: string,
  recipeId?: string
): Promise<void> {
  await queueNotification({
    type: 'meal_reminder',
    title: `Time for ${mealType}!`,
    body: `Today's meal: ${recipeName}`,
    data: {
      type: 'meal_reminder',
      mealType,
      recipeName,
      ...(recipeId && { recipeId, url: `/recipe/${recipeId}` }),
    },
    householdId,
    createdBy: 'system',
    targetUserIds: [userId],
  });
}

// Schedule daily meal reminders based on user preferences
// This should be called when the app loads or when preferences change
export async function scheduleDailyMealReminder(
  userId: string,
  householdId: string,
  reminderTime: string // HH:MM format
): Promise<void> {
  // Parse reminder time
  const [hours, minutes] = reminderTime.split(':').map(Number);

  // Calculate time until next reminder
  const now = new Date();
  const reminderDate = new Date();
  reminderDate.setHours(hours, minutes, 0, 0);

  // If the time has already passed today, schedule for tomorrow
  if (reminderDate <= now) {
    reminderDate.setDate(reminderDate.getDate() + 1);
  }

  const delay = reminderDate.getTime() - now.getTime();

  // Schedule local notification
  setTimeout(async () => {
    // Get today's meal plan
    const today = new Date().toISOString().split('T')[0];
    const mealPlanQuery = query(
      collection(db, 'mealPlans'),
      where('householdId', '==', householdId),
      where('date', '==', today)
    );

    try {
      const snapshot = await getDocs(mealPlanQuery);
      if (!snapshot.empty) {
        const mealPlan = snapshot.docs[0].data();
        const meals = [];

        if (mealPlan.breakfast?.title) meals.push(mealPlan.breakfast.title);
        if (mealPlan.lunch?.title) meals.push(mealPlan.lunch.title);
        if (mealPlan.dinner?.title) meals.push(mealPlan.dinner.title);

        if (meals.length > 0) {
          sendLocalNotification(
            "Today's Meals",
            meals.join(', '),
            { type: 'meal_reminder', url: '/meal-planner' }
          );
        }
      }
    } catch (error) {
      console.error('Error fetching meal plan for reminder:', error);
    }

    // Reschedule for next day
    scheduleDailyMealReminder(userId, householdId, reminderTime);
  }, delay);
}

// Send immediate local notification for meal time
export function sendMealTimeNotification(
  mealType: 'breakfast' | 'lunch' | 'dinner',
  recipeName: string
): void {
  const mealLabels = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
  };

  sendLocalNotification(
    `Time for ${mealLabels[mealType]}!`,
    `Don't forget: ${recipeName}`,
    { type: 'meal_reminder', url: '/meal-planner' }
  );
}
