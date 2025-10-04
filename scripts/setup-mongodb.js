const { MongoClient } = require('mongodb');

async function setupMongoDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGODB_DATABASE || 'cookie-licking-detector';
  
  const options = {
    tls: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false,
    retryWrites: true,
    w: 'majority'
  };
  
  const client = new MongoClient(uri, options);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Create collections with indexes
    const collections = ['repositories', 'claimed_issues', 'activity_log', 'shame_board'];
    
    for (const collectionName of collections) {
      await db.createCollection(collectionName);
      console.log(`Created collection: ${collectionName}`);
    }
    
    // Create indexes for better performance
    const claimedIssues = db.collection('claimed_issues');
    await claimedIssues.createIndex({ status: 1 });
    await claimedIssues.createIndex({ repository_id: 1 });
    await claimedIssues.createIndex({ auto_release_at: 1 }, { partialFilterExpression: { status: 'active' } });
    await claimedIssues.createIndex({ claimed_at: 1 });
    await claimedIssues.createIndex({ claimer_username: 1 });
    console.log('Created indexes for claimed_issues');
    
    const activityLog = db.collection('activity_log');
    await activityLog.createIndex({ claimed_issue_id: 1 });
    await activityLog.createIndex({ action_type: 1 });
    await activityLog.createIndex({ created_at: 1 });
    console.log('Created indexes for activity_log');
    
    const shameBoard = db.collection('shame_board');
    await shameBoard.createIndex({ username: 1 }, { unique: true });
    await shameBoard.createIndex({ reliability_score: -1 });
    console.log('Created indexes for shame_board');
    
    const repositories = db.collection('repositories');
    await repositories.createIndex({ github_owner: 1, github_repo: 1 }, { unique: true });
    console.log('Created indexes for repositories');
    
    console.log('MongoDB setup completed successfully!');
    
  } catch (error) {
    console.error('Error setting up MongoDB:', error);
  } finally {
    await client.close();
  }
}

setupMongoDB();
