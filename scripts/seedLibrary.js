/**
 * Firebase Library Recipes Seeder
 *
 * This script seeds the libraryRecipes collection in Firestore.
 *
 * Usage:
 * 1. Set up Firebase Admin SDK credentials
 * 2. Run: node scripts/seedLibrary.js
 *
 * Prerequisites:
 * - Node.js installed
 * - Firebase project created
 * - Service account key downloaded from Firebase Console
 *   (Project Settings > Service Accounts > Generate new private key)
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// High-protein recipes data
const libraryRecipes = [
  // BREAKFAST
  {
    title: "Greek Yogurt Protein Bowl",
    category: "breakfast",
    ingredients: "2 cups Greek yogurt (plain, full-fat)\n1/4 cup almonds, sliced\n2 tbsp chia seeds\n1/2 cup mixed berries\n1 tbsp honey\n1 tbsp peanut butter",
    steps: "1. Add Greek yogurt to a bowl\n2. Top with sliced almonds and chia seeds\n3. Add fresh berries\n4. Drizzle with honey and peanut butter\n5. Mix gently and enjoy"
  },
  {
    title: "Scrambled Eggs with Cottage Cheese",
    category: "breakfast",
    ingredients: "4 large eggs\n1/2 cup cottage cheese\n2 tbsp butter\nSalt and pepper to taste\nFresh chives, chopped\n2 slices whole grain toast",
    steps: "1. Whisk eggs with cottage cheese\n2. Melt butter in a non-stick pan over medium-low heat\n3. Add egg mixture and stir gently\n4. Cook until just set, still slightly creamy\n5. Season with salt and pepper\n6. Top with fresh chives\n7. Serve with toast"
  },
  {
    title: "Protein Pancakes",
    category: "breakfast",
    ingredients: "1 cup oats\n1 scoop vanilla protein powder\n1 banana, mashed\n2 eggs\n1/2 cup Greek yogurt\n1/2 tsp baking powder\nButter for cooking",
    steps: "1. Blend oats into flour in a blender\n2. Add protein powder, banana, eggs, yogurt, and baking powder\n3. Blend until smooth\n4. Heat a pan with butter over medium heat\n5. Pour 1/4 cup batter per pancake\n6. Cook until bubbles form, flip and cook 1 more minute\n7. Serve with fresh fruit or nut butter"
  },
  // Add more recipes here...
  // Note: Full dataset is in src/data/libraryRecipes.ts
];

async function seedLibrary() {
  console.log('🌱 Starting library recipe seeding...\n');

  try {
    // Initialize Firebase Admin
    // Option 1: Use service account file
    const serviceAccountPath = join(__dirname, '../serviceAccountKey.json');

    try {
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
      initializeApp({
        credential: cert(serviceAccount)
      });
    } catch (e) {
      console.error('❌ Could not find serviceAccountKey.json');
      console.log('\nTo use this script:');
      console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
      console.log('2. Click "Generate new private key"');
      console.log('3. Save the file as "serviceAccountKey.json" in project root');
      console.log('4. Run this script again\n');
      process.exit(1);
    }

    const db = getFirestore();
    const batch = db.batch();
    const collectionRef = db.collection('libraryRecipes');

    // Clear existing recipes (optional)
    console.log('📦 Clearing existing library recipes...');
    const existingDocs = await collectionRef.get();
    existingDocs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Add new recipes
    console.log(`📝 Adding ${libraryRecipes.length} recipes...`);
    libraryRecipes.forEach((recipe) => {
      const docRef = collectionRef.doc();
      batch.set(docRef, recipe);
    });

    await batch.commit();

    console.log('\n✅ Successfully seeded library recipes!');
    console.log(`   Total recipes added: ${libraryRecipes.length}`);

    // Count by category
    const categories = {};
    libraryRecipes.forEach(r => {
      categories[r.category] = (categories[r.category] || 0) + 1;
    });
    console.log('\n📊 Recipes by category:');
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error seeding library:', error);
    process.exit(1);
  }
}

seedLibrary();
