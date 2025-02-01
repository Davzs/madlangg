import dbConnect from '../src/lib/dbConnect';
import Vocabulary from '../src/models/Vocabulary';

async function migrateVocabularyStatus() {
  try {
    await dbConnect();
    
    // Update all 'New' status to 'Learning'
    await Vocabulary.updateMany(
      { status: 'New' },
      { $set: { status: 'Learning' } }
    );

    // Update all 'In Progress' status to 'Reviewing'
    await Vocabulary.updateMany(
      { status: 'In Progress' },
      { $set: { status: 'Reviewing' } }
    );

    console.log('Successfully migrated vocabulary status values');
    process.exit(0);
  } catch (error) {
    console.error('Error migrating vocabulary status:', error);
    process.exit(1);
  }
}

migrateVocabularyStatus();
