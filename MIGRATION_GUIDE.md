# Migration Guide: Supabase to MongoDB

This guide helps you migrate your cookie-licking-detector from Supabase to MongoDB.

## Step-by-Step Migration

### 1. Environment Setup

Create `.env.local` with MongoDB configuration:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=cookie-licking-detector

# Keep existing GitHub token
GITHUB_TOKEN=your_github_token_here
```

### 2. Database Setup

```bash
# Setup MongoDB database and collections
npm run setup-mongodb

# Test the connection
npm run test-mongodb
```

### 3. Update Component Imports

#### Before (Supabase):
```typescript
// In your components
import { scanRepository } from '@/lib/actions/scan-repository'
import { sendNudge } from '@/lib/actions/nudge-system'
import { createClient } from '@/lib/supabase/server'
```

#### After (MongoDB):
```typescript
// In your components
import { scanRepository } from '@/lib/actions/scan-repository-mongodb'
import { sendNudge } from '@/lib/actions/nudge-system-mongodb'
import { getClaimedIssues } from '@/lib/mongodb/data-fetching'
```

### 4. Update Data Fetching

#### Before (Supabase):
```typescript
const supabase = await createClient()
const { data: issues } = await supabase
  .from('claimed_issues')
  .select('*, repository:repositories(*)')
  .eq('status', 'active')
```

#### After (MongoDB):
```typescript
import { getActiveIssues } from '@/lib/mongodb/data-fetching'
const issues = await getActiveIssues()
```

### 5. Update API Routes

#### Before (Supabase):
```typescript
// app/api/scan/route.ts
import { scanRepository } from '@/lib/actions/scan-repository'
```

#### After (MongoDB):
```typescript
// app/api/scan/route.ts
import { scanRepository } from '@/lib/actions/scan-repository-mongodb'
```

### 6. Data Migration (Optional)

If you have existing Supabase data, you can migrate it:

```javascript
// scripts/migrate-data.js
const { MongoClient } = require('mongodb');

async function migrateData() {
  // 1. Export data from Supabase
  // 2. Transform to MongoDB format
  // 3. Import to MongoDB
}
```

## Key Differences

### Database Queries

| Supabase (PostgreSQL) | MongoDB |
|----------------------|---------|
| `SELECT * FROM table` | `db.collection.find({})` |
| `WHERE status = 'active'` | `{ status: 'active' }` |
| `JOIN repositories` | `$lookup` aggregation |
| `INSERT INTO table` | `collection.insertOne()` |
| `UPDATE table SET` | `collection.updateOne()` |

### Data Structure

#### Supabase (Relational):
```sql
-- Separate tables with foreign keys
repositories (id, github_owner, github_repo)
claimed_issues (id, repository_id, issue_number, ...)
```

#### MongoDB (Document):
```javascript
// Embedded or referenced documents
{
  _id: ObjectId,
  repository_id: ObjectId,
  issue_number: 123,
  repository: { // Embedded or populated
    github_owner: "owner",
    github_repo: "repo"
  }
}
```

## Performance Considerations

### Indexes
MongoDB automatically creates indexes for:
- `_id` (primary key)
- Custom indexes for `status`, `repository_id`, etc.

### Query Optimization
- Use projection to limit returned fields
- Use aggregation pipeline for complex queries
- Consider compound indexes for multi-field queries

## Testing the Migration

1. **Test Connection**: `npm run test-mongodb`
2. **Test Setup**: `npm run setup-mongodb`
3. **Test Actions**: Try scanning a repository
4. **Test Data**: Verify data is stored correctly

## Rollback Plan

If you need to rollback to Supabase:

1. Keep your original Supabase actions
2. Update imports back to Supabase versions
3. Remove MongoDB environment variables
4. Restore Supabase configuration

## Common Issues

### 1. ObjectId vs String IDs
```typescript
// MongoDB uses ObjectId
import { ObjectId } from 'mongodb'
const id = new ObjectId(issueId)
```

### 2. Date Handling
```typescript
// MongoDB stores dates as Date objects
const now = new Date()
```

### 3. Query Differences
```typescript
// Supabase
.eq('status', 'active')

// MongoDB
{ status: 'active' }
```

## Production Deployment

### MongoDB Atlas Setup
1. Create MongoDB Atlas cluster
2. Get connection string
3. Update `MONGODB_URI` in production
4. Configure network access
5. Set up monitoring

### Environment Variables
```env
# Production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DATABASE=cookie-licking-detector
```

## Support

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Next.js MongoDB Integration](https://nextjs.org/docs/app/building-your-application/data-fetching)
