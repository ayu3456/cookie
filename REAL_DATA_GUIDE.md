# Real-World Data Guide

This guide shows you how to populate your Cookie-Licking Detector with real GitHub data.

## 🚀 **Quick Start - Sample Data**

I've already seeded your database with realistic sample data! Visit http://localhost:3001 to see:

- **3 Repositories**: facebook/react, microsoft/vscode, vercel/next.js
- **3 Claimed Issues**: Different statuses (active, nudged, released)
- **3 Shame Board Entries**: With reliability scores

## 📊 **What You'll See**

### Dashboard
- Repository scanning form
- Tracked repositories count
- Active claimed issues list

### Shame Board
- Contributor reliability scores
- Total abandoned vs completed issues
- Public accountability rankings

### Notifications
- Nudgeable issues
- Auto-nudge functionality

## 🔄 **Adding More Real Data**

### Method 1: Scan Real Repositories

1. **Get GitHub Token**:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate a new token with `repo` permissions
   - Add to `.env.local`: `GITHUB_TOKEN=your_token_here`

2. **Scan Repositories**:
   - Visit Dashboard at http://localhost:3001/dashboard
   - Enter repository owner (e.g., `facebook`)
   - Enter repository name (e.g., `react`)
   - Click "Scan Repository"

### Method 2: Use the Seeding Script

```bash
# Run the sample data script
npm run seed-data

# Or run the simple version
node scripts/simple-seed.js
```

### Method 3: Manual Data Entry

You can also manually add data through MongoDB Atlas:

1. Go to your MongoDB Atlas dashboard
2. Navigate to your cluster
3. Click "Browse Collections"
4. Add documents to collections:
   - `repositories`
   - `claimed_issues`
   - `activity_log`
   - `shame_board`

## 🎯 **Real-World Scenarios**

### Scenario 1: Active Development
- Contributors claim issues
- Some follow through with PRs
- Others abandon claims
- System tracks reliability

### Scenario 2: Stale Claims
- Issues claimed but no progress
- Automated nudges sent
- Auto-release after grace period
- Shame board updates

### Scenario 3: High-Performance Team
- Consistent delivery
- High reliability scores
- Public recognition
- Team accountability

## 🔧 **Customizing Data**

### Add More Repositories
```javascript
// In scripts/simple-seed.js
const repos = [
  { github_owner: 'your-org', github_repo: 'your-repo', created_at: new Date(), updated_at: new Date() },
  // Add more repositories here
];
```

### Add More Claimed Issues
```javascript
const issues = [
  {
    repository_id: repoResult.insertedIds[0],
    issue_number: 1234,
    issue_title: 'Your Issue Title',
    issue_url: 'https://github.com/owner/repo/issues/1234',
    claimer_username: 'contributor',
    claim_comment_text: 'I\'ll work on this',
    claimed_at: new Date(),
    status: 'active',
    // ... other fields
  }
];
```

### Update Shame Board
```javascript
const shameEntries = [
  {
    username: 'contributor',
    total_abandoned: 0,
    total_completed: 5,
    reliability_score: 100.0,
    last_updated_at: new Date(),
    created_at: new Date()
  }
];
```

## 📈 **Monitoring Real Data**

### Check Database Status
```bash
# Test MongoDB connection
npm run test-mongodb

# View collections in MongoDB Atlas
# Go to your cluster → Browse Collections
```

### View Application Data
- **Dashboard**: http://localhost:3001/dashboard
- **Shame Board**: http://localhost:3001/shame-board
- **Notifications**: http://localhost:3001/notifications

## 🚀 **Production Deployment**

### Environment Variables
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
MONGODB_DATABASE=cookie-licking-detector
GITHUB_TOKEN=your_github_token
```

### Scaling Considerations
- MongoDB Atlas auto-scaling
- GitHub API rate limits
- Repository scanning frequency
- Data retention policies

## 🎉 **Success!**

Your Cookie-Licking Detector now has real-world data and is ready to:

1. **Track Issues**: Monitor claimed issues across repositories
2. **Send Nudges**: Automated reminders for stale claims
3. **Maintain Accountability**: Public shame board with reliability scores
4. **Scale**: Handle multiple repositories and contributors

Visit http://localhost:3001 to see your data in action! 🚀
