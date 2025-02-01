import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

async function migrateVocabularyStatus() {
  const client = await MongoClient.connect(MONGODB_URI);
  
  try {
    const db = client.db();
    const vocabularyCollection = db.collection('vocabularies');

    // Update all 'New' status to 'Learning'
    const newToLearning = await vocabularyCollection.updateMany(
      { status: 'New' },
      { $set: { status: 'Learning' } }
    );

    // Update all 'In Progress' status to 'Reviewing'
    const inProgressToReviewing = await vocabularyCollection.updateMany(
      { status: 'In Progress' },
      { $set: { status: 'Reviewing' } }
    );

    console.log(`Migration completed successfully:
    - ${newToLearning.modifiedCount} documents updated from 'New' to 'Learning'
    - ${inProgressToReviewing.modifiedCount} documents updated from 'In Progress' to 'Reviewing'`);

  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    await client.close();
    process.exit(0);
  }
}

migrateVocabularyStatus();
