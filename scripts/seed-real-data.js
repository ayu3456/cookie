const { MongoClient } = require('mongodb');

async function seedRealData() {
  const uri = 'mongodb+srv://ayushg23csai_db_user:jvGobn7AmVGXLdtI@cluster0.o7v40ob.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const dbName = 'cookie-licking-detector';
  
  const options = {
    tls: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false,
    retryWrites: true,
    w: 'majority'
  };
  
  const client = new MongoClient(uri, options);
  
  try {
    console.log('Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db(dbName);
    
    // Sample real-world repositories
    const repositories = [
      {
        github_owner: 'facebook',
        github_repo: 'react',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        github_owner: 'microsoft',
        github_repo: 'vscode',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        github_owner: 'vercel',
        github_repo: 'next.js',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    // Insert repositories
    const repoCollection = db.collection('repositories');
    const insertedRepos = await repoCollection.insertMany(repositories);
    console.log(`✅ Inserted ${insertedRepos.insertedCount} repositories`);
    
    // Sample claimed issues (realistic data)
    const claimedIssues = [
      {
        repository_id: insertedRepos.insertedIds[0], // facebook/react
        issue_number: 1234,
        issue_title: 'Fix memory leak in useEffect cleanup',
        issue_url: 'https://github.com/facebook/react/issues/1234',
        claimer_username: 'johndoe',
        claimer_avatar_url: 'https://github.com/johndoe.png',
        claim_comment_id: '123456789',
        claim_comment_text: 'I\'ll work on this issue. Should have a PR ready by tomorrow.',
        claimed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        last_checked_at: new Date(),
        status: 'active',
        nudge_count: 0,
        has_linked_pr: false,
        has_commits: false,
        auto_release_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        repository_id: insertedRepos.insertedIds[0], // facebook/react
        issue_number: 1235,
        issue_title: 'Improve TypeScript definitions for hooks',
        issue_url: 'https://github.com/facebook/react/issues/1235',
        claimer_username: 'alice_dev',
        claimer_avatar_url: 'https://github.com/alice_dev.png',
        claim_comment_id: '123456790',
        claim_comment_text: 'I can take this one. Already started working on it.',
        claimed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        last_checked_at: new Date(),
        status: 'nudged',
        nudge_count: 1,
        last_nudged_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        has_linked_pr: false,
        has_commits: false,
        auto_release_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        repository_id: insertedRepos.insertedIds[1], // microsoft/vscode
        issue_number: 5678,
        issue_title: 'Add support for new file extensions',
        issue_url: 'https://github.com/microsoft/vscode/issues/5678',
        claimer_username: 'bob_contributor',
        claimer_avatar_url: 'https://github.com/bob_contributor.png',
        claim_comment_id: '123456791',
        claim_comment_text: 'I\'ll handle this. Should be straightforward.',
        claimed_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        last_checked_at: new Date(),
        status: 'released',
        nudge_count: 2,
        last_nudged_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        has_linked_pr: false,
        has_commits: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        repository_id: insertedRepos.insertedIds[2], // vercel/next.js
        issue_number: 9012,
        issue_title: 'Optimize bundle size for production builds',
        issue_url: 'https://github.com/vercel/next.js/issues/9012',
        claimer_username: 'sarah_engineer',
        claimer_avatar_url: 'https://github.com/sarah_engineer.png',
        claim_comment_id: '123456792',
        claim_comment_text: 'I\'m working on this optimization. PR coming soon!',
        claimed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        last_checked_at: new Date(),
        status: 'active',
        nudge_count: 0,
        has_linked_pr: true,
        has_commits: true,
        auto_release_at: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    // Insert claimed issues
    const issuesCollection = db.collection('claimed_issues');
    const insertedIssues = await issuesCollection.insertMany(claimedIssues);
    console.log(`✅ Inserted ${insertedIssues.insertedCount} claimed issues`);
    
    // Sample activity logs
    const activityLogs = [
      {
        claimed_issue_id: insertedIssues.insertedIds[0],
        action_type: 'detected',
        action_data: {
          issue_number: 1234,
          claimer: 'johndoe',
          repository: 'facebook/react'
        },
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        claimed_issue_id: insertedIssues.insertedIds[1],
        action_type: 'detected',
        action_data: {
          issue_number: 1235,
          claimer: 'alice_dev',
          repository: 'facebook/react'
        },
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        claimed_issue_id: insertedIssues.insertedIds[1],
        action_type: 'nudged',
        action_data: {
          issue_number: 1235,
          claimer: 'alice_dev',
          nudge_count: 1
        },
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        claimed_issue_id: insertedIssues.insertedIds[2],
        action_type: 'detected',
        action_data: {
          issue_number: 5678,
          claimer: 'bob_contributor',
          repository: 'microsoft/vscode'
        },
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      },
      {
        claimed_issue_id: insertedIssues.insertedIds[2],
        action_type: 'released',
        action_data: {
          issue_number: 5678,
          claimer: 'bob_contributor',
          reason: 'auto_release_timeout'
        },
        created_at: new Date()
      },
      {
        claimed_issue_id: insertedIssues.insertedIds[3],
        action_type: 'detected',
        action_data: {
          issue_number: 9012,
          claimer: 'sarah_engineer',
          repository: 'vercel/next.js'
        },
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        claimed_issue_id: insertedIssues.insertedIds[3],
        action_type: 'pr_linked',
        action_data: {
          issue_number: 9012,
          claimer: 'sarah_engineer'
        },
        created_at: new Date()
      }
    ];
    
    // Insert activity logs
    const activityCollection = db.collection('activity_log');
    const insertedLogs = await activityCollection.insertMany(activityLogs);
    console.log(`✅ Inserted ${insertedLogs.insertedCount} activity logs`);
    
    // Sample shame board entries
    const shameBoardEntries = [
      {
        username: 'johndoe',
        total_abandoned: 0,
        total_completed: 3,
        reliability_score: 100.0,
        last_updated_at: new Date(),
        created_at: new Date()
      },
      {
        username: 'alice_dev',
        total_abandoned: 1,
        total_completed: 2,
        reliability_score: 66.7,
        last_updated_at: new Date(),
        created_at: new Date()
      },
      {
        username: 'bob_contributor',
        total_abandoned: 2,
        total_completed: 1,
        reliability_score: 33.3,
        last_updated_at: new Date(),
        created_at: new Date()
      },
      {
        username: 'sarah_engineer',
        total_abandoned: 0,
        total_completed: 5,
        reliability_score: 100.0,
        last_updated_at: new Date(),
        created_at: new Date()
      }
    ];
    
    // Insert shame board entries
    const shameCollection = db.collection('shame_board');
    const insertedShame = await shameCollection.insertMany(shameBoardEntries);
    console.log(`✅ Inserted ${insertedShame.insertedCount} shame board entries`);
    
    console.log('\n🎉 Real-world data seeding completed successfully!');
    console.log('\n📊 What was added:');
    console.log('• 3 repositories (facebook/react, microsoft/vscode, vercel/next.js)');
    console.log('• 4 claimed issues with different statuses');
    console.log('• 7 activity log entries');
    console.log('• 4 shame board entries with reliability scores');
    console.log('\n🌐 Visit http://localhost:3001 to see the data in action!');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
  } finally {
    await client.close();
  }
}

seedRealData();
