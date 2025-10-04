const { MongoClient } = require('mongodb');

async function setupAtlas() {
  const uri = 'mongodb+srv://ayushg23csai_db_user:jvGobn7AmVGXLdtI@cluster0.o7v40ob.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const dbName = 'cookie-licking-detector';
  
  const client = new MongoClient(uri);
  
  try {
    console.log('Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas successfully');
    
    const db = client.db(dbName);
    console.log(`✅ Connected to database: ${dbName}`);
    
    // Create collections
    const collections = ['repositories', 'claimed_issues', 'activity_log', 'shame_board'];
    
    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } catch (error) {
        if (error.code === 48) { // Collection already exists
          console.log(`📁 Collection ${collectionName} already exists`);
        } else {
          console.log(`⚠️  Collection ${collectionName}: ${error.message}`);
        }
      }
    }
    
    // Create indexes
    console.log('\n🔧 Creating indexes...');
    
    // Claimed Issues indexes
    const claimedIssues = db.collection('claimed_issues');
    await claimedIssues.createIndex({ status: 1 });
    await claimedIssues.createIndex({ repository_id: 1 });
    await claimedIssues.createIndex({ auto_release_at: 1 }, { partialFilterExpression: { status: 'active' } });
    await claimedIssues.createIndex({ claimed_at: 1 });
    await claimedIssues.createIndex({ claimer_username: 1 });
    console.log('✅ Created indexes for claimed_issues');
    
    // Activity Log indexes
    const activityLog = db.collection('activity_log');
    await activityLog.createIndex({ claimed_issue_id: 1 });
    await activityLog.createIndex({ action_type: 1 });
    await activityLog.createIndex({ created_at: 1 });
    console.log('✅ Created indexes for activity_log');
    
    // Shame Board indexes
    const shameBoard = db.collection('shame_board');
    await shameBoard.createIndex({ username: 1 }, { unique: true });
    await shameBoard.createIndex({ reliability_score: -1 });
    console.log('✅ Created indexes for shame_board');
    
    // Repositories indexes
    const repositories = db.collection('repositories');
    await repositories.createIndex({ github_owner: 1, github_repo: 1 }, { unique: true });
    console.log('✅ Created indexes for repositories');
    
    console.log('\n🎉 MongoDB Atlas setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Create .env.local with your MongoDB URI');
    console.log('2. Restart your development server');
    console.log('3. Test the application');
    
  } catch (error) {
    console.error('❌ Error setting up MongoDB Atlas:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check your network connection');
    console.log('2. Verify your MongoDB Atlas credentials');
    console.log('3. Ensure your IP is whitelisted in MongoDB Atlas');
  } finally {
    await client.close();
  }
}

setupAtlas();
