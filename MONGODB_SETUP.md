# MongoDB Integration Setup

This document explains how to integrate MongoDB with your cookie-licking-detector project.

## Prerequisites

1. MongoDB installed locally or access to a MongoDB Atlas cluster
2. Node.js and npm installed

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=cookie-licking-detector

# GitHub Configuration (keep existing)
GITHUB_TOKEN=your_github_token_here

# Supabase Configuration (keep existing for reference)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Install Dependencies

The MongoDB dependencies are already installed:
- `mongodb` - Official MongoDB driver
- `mongoose` - MongoDB ODM (optional, for schema validation)

### 3. Setup MongoDB Database

Run the setup script to create collections and indexes:

```bash
npm run setup-mongodb
```

This will:
- Create the required collections: `repositories`, `claimed_issues`, `activity_log`, `shame_board`
- Set up indexes for optimal query performance
- Configure unique constraints

### 4. Database Schema

#### Collections Created:

1. **repositories** - Tracks monitored GitHub repositories
2. **claimed_issues** - Tracks claimed issues and their status
3. **activity_log** - Logs all actions (detected, nudged, released, etc.)
4. **shame_board** - Public accountability scores

#### Key Indexes:

- `claimed_issues.status` - For filtering by status
- `claimed_issues.repository_id` - For repository-specific queries
- `claimed_issues.auto_release_at` - For finding stale issues
- `activity_log.claimed_issue_id` - For activity tracking
- `shame_board.reliability_score` - For leaderboard sorting

## Usage

### MongoDB Actions

The project now includes MongoDB-based actions:

- `lib/actions/scan-repository-mongodb.ts` - Repository scanning with MongoDB
- `lib/actions/nudge-system-mongodb.ts` - Nudge system with MongoDB
- `lib/mongodb/operations.ts` - Core database operations
- `lib/mongodb/data-fetching.ts` - Data retrieval utilities

### Switching from Supabase to MongoDB

To use MongoDB instead of Supabase:

1. Update your imports in components to use the MongoDB actions:
   ```typescript
   // Instead of:
   import { scanRepository } from '@/lib/actions/scan-repository'
   
   // Use:
   import { scanRepository } from '@/lib/actions/scan-repository-mongodb'
   ```

2. Update data fetching in components:
   ```typescript
   // Instead of:
   import { createClient } from '@/lib/supabase/server'
   
   // Use:
   import { getClaimedIssues } from '@/lib/mongodb/data-fetching'
   ```

## MongoDB vs Supabase Comparison

| Feature | Supabase (PostgreSQL) | MongoDB |
|---------|----------------------|---------|
| Database Type | Relational | Document |
| Schema | Fixed tables | Flexible documents |
| Queries | SQL | MongoDB Query Language |
| Relationships | Foreign keys | References/Embedding |
| Scalability | Vertical | Horizontal |
| ACID | Full ACID | Document-level ACID |

## Benefits of MongoDB Integration

1. **Flexible Schema** - Easy to add new fields without migrations
2. **Horizontal Scaling** - Better for high-traffic applications
3. **Document Storage** - Natural fit for JSON-like data structures
4. **Aggregation Pipeline** - Powerful data processing capabilities
5. **Cloud Native** - Excellent integration with MongoDB Atlas

## Migration Strategy

If you want to migrate existing Supabase data to MongoDB:

1. Export data from Supabase
2. Transform data to MongoDB document format
3. Import using MongoDB tools or custom scripts
4. Update application to use MongoDB actions

## Troubleshooting

### Common Issues:

1. **Connection Error**: Check `MONGODB_URI` in environment variables
2. **Index Creation Failed**: Ensure MongoDB user has write permissions
3. **Query Performance**: Check if indexes are properly created
4. **Memory Issues**: Consider using MongoDB Atlas for production

### Useful Commands:

```bash
# Check MongoDB connection
mongosh "mongodb://localhost:27017"

# View collections
show collections

# Check indexes
db.claimed_issues.getIndexes()

# View sample documents
db.claimed_issues.findOne()
```

## Production Considerations

1. **Use MongoDB Atlas** for production deployments
2. **Enable authentication** and network access controls
3. **Set up monitoring** with MongoDB Atlas monitoring
4. **Configure backups** for data safety
5. **Use connection pooling** for better performance

## Support

For MongoDB-specific issues:
- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [MongoDB Community Forums](https://community.mongodb.com/)
