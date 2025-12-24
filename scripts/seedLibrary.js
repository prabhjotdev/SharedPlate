/**
 * Firebase Library Recipes Seeder
 *
 * This script seeds the libraryRecipes collection in Firestore.
 *
 * Usage:
 * 1. Install firebase-admin: npm install firebase-admin
 * 2. Download service account key from Firebase Console
 * 3. Run: node scripts/seedLibrary.js
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

// Import recipes from data file
import { libraryRecipes } from '../src/data/libraryRecipes.js';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function seedLibrary() {
  console.log('🌱 Starting library recipe seeding...\n');

  try {
    // Initialize Firebase Admin with service account
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
    const collectionRef = db.collection('libraryRecipes');

    // Clear existing recipes
    console.log('📦 Clearing existing library recipes...');
    const existingDocs = await collectionRef.get();
    const deletePromises = existingDocs.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);
    console.log(`   Deleted ${existingDocs.size} existing recipes`);

    // Add new recipes in batches of 500 (Firestore limit)
    console.log(`\n📝 Adding ${libraryRecipes.length} recipes...`);

    const batchSize = 500;
    for (let i = 0; i < libraryRecipes.length; i += batchSize) {
      const batch = db.batch();
      const chunk = libraryRecipes.slice(i, i + batchSize);

      chunk.forEach((recipe) => {
        const docRef = collectionRef.doc();
        batch.set(docRef, {
          title: recipe.title,
          category: recipe.category,
          ingredients: recipe.ingredients,
          steps: recipe.steps
        });
      });

      await batch.commit();
      console.log(`   Batch ${Math.floor(i / batchSize) + 1}: Added ${chunk.length} recipes`);
    }

    console.log('\n✅ Successfully seeded library recipes!');
    console.log(`   Total recipes added: ${libraryRecipes.length}`);

    // Count by category
    const categories = {};
    libraryRecipes.forEach(r => {
      categories[r.category] = (categories[r.category] || 0) + 1;
    });
    console.log('\n📊 Recipes by category:');
    Object.entries(categories).sort().forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`);
    });

    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding library:', error);
    process.exit(1);
  }
}

seedLibrary();
