const { MongoClient } = require('mongodb');

async function simpleSeed() {
  const uri = 'mongodb+srv://ayushg23csai_db_user:jvGobn7AmVGXLdtI@cluster0.o7v40ob.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const dbName = 'cookie-licking-detector';
  
  const client = new MongoClient(uri);
  
  try {
    console.log('🌱 Seeding real-world data...');
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db(dbName);
    
    // Clear existing data first
    console.log('🧹 Clearing existing data...');
    await db.collection('repositories').deleteMany({});
    await db.collection('claimed_issues').deleteMany({});
    await db.collection('activity_log').deleteMany({});
    await db.collection('shame_board').deleteMany({});
    
    // Insert sample repositories
    const repos = [
      { github_owner: 'facebook', github_repo: 'react', created_at: new Date(), updated_at: new Date() },
      { github_owner: 'microsoft', github_repo: 'vscode', created_at: new Date(), updated_at: new Date() },
      { github_owner: 'vercel', github_repo: 'next.js', created_at: new Date(), updated_at: new Date() }
    ];
    
    const repoResult = await db.collection('repositories').insertMany(repos);
    console.log(`✅ Added ${repoResult.insertedCount} repositories`);
    
    // Insert sample claimed issues
    const issues = [
      {
        repository_id: repoResult.insertedIds[0],
        issue_number: 1234,
        issue_title: 'Fix memory leak in useEffect cleanup',
        issue_url: 'https://github.com/facebook/react/issues/1234',
        claimer_username: 'johndoe',
        claimer_avatar_url: 'https://github.com/johndoe.png',
        claim_comment_id: '123456789',
        claim_comment_text: 'I\'ll work on this issue. Should have a PR ready by tomorrow.',
        claimed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        last_checked_at: new Date(),
        status: 'active',
        nudge_count: 0,
        has_linked_pr: false,
        has_commits: false,
        auto_release_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        repository_id: repoResult.insertedIds[0],
        issue_number: 1235,
        issue_title: 'Improve TypeScript definitions for hooks',
        issue_url: 'https://github.com/facebook/react/issues/1235',
        claimer_username: 'alice_dev',
        claimer_avatar_url: 'https://github.com/alice_dev.png',
        claim_comment_id: '123456790',
        claim_comment_text: 'I can take this one. Already started working on it.',
        claimed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        last_checked_at: new Date(),
        status: 'nudged',
        nudge_count: 1,
        last_nudged_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        has_linked_pr: false,
        has_commits: false,
        auto_release_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        repository_id: repoResult.insertedIds[1],
        issue_number: 5678,
        issue_title: 'Add support for new file extensions',
        issue_url: 'https://github.com/microsoft/vscode/issues/5678',
        claimer_username: 'bob_contributor',
        claimer_avatar_url: 'https://github.com/bob_contributor.png',
        claim_comment_id: '123456791',
        claim_comment_text: 'I\'ll handle this. Should be straightforward.',
        claimed_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        last_checked_at: new Date(),
        status: 'released',
        nudge_count: 2,
        last_nudged_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        has_linked_pr: false,
        has_commits: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    const issuesResult = await db.collection('claimed_issues').insertMany(issues);
    console.log(`✅ Added ${issuesResult.insertedCount} claimed issues`);
    
    // Insert shame board entries
    const shameEntries = [
      { username: 'johndoe', total_abandoned: 0, total_completed: 3, reliability_score: 100.0, last_updated_at: new Date(), created_at: new Date() },
      { username: 'alice_dev', total_abandoned: 1, total_completed: 2, reliability_score: 66.7, last_updated_at: new Date(), created_at: new Date() },
      { username: 'bob_contributor', total_abandoned: 2, total_completed: 1, reliability_score: 33.3, last_updated_at: new Date(), created_at: new Date() }
    ];
    
    const shameResult = await db.collection('shame_board').insertMany(shameEntries);
    console.log(`✅ Added ${shameResult.insertedCount} shame board entries`);
    
    console.log('\n🎉 Real-world data seeding completed!');
    console.log('🌐 Visit http://localhost:3001 to see the data in action!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

simpleSeed();
