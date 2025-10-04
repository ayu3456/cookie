import { ObjectId } from 'mongodb'
import { getDatabase } from './client'
import { COLLECTIONS, Repository, ClaimedIssue, ActivityLog, ShameboardEntry } from './models'

// Repository operations
export async function getOrCreateRepository(owner: string, repo: string): Promise<Repository> {
  const db = await getDatabase()
  const collection = db.collection<Repository>(COLLECTIONS.REPOSITORIES)
  
  const existing = await collection.findOne({ github_owner: owner, github_repo: repo })
  if (existing) {
    return existing
  }
  
  const newRepo: Omit<Repository, '_id'> = {
    github_owner: owner,
    github_repo: repo,
    created_at: new Date(),
    updated_at: new Date()
  }
  
  const result = await collection.insertOne(newRepo)
  return { ...newRepo, _id: result.insertedId }
}

export async function updateRepository(id: ObjectId, updates: Partial<Repository>): Promise<void> {
  const db = await getDatabase()
  const collection = db.collection<Repository>(COLLECTIONS.REPOSITORIES)
  
  await collection.updateOne(
    { _id: id },
    { $set: { ...updates, updated_at: new Date() } }
  )
}

// Claimed Issues operations
export async function createClaimedIssue(issue: Omit<ClaimedIssue, '_id' | 'created_at' | 'updated_at'>): Promise<ObjectId> {
  const db = await getDatabase()
  const collection = db.collection<ClaimedIssue>(COLLECTIONS.CLAIMED_ISSUES)
  
  const now = new Date()
  const newIssue: Omit<ClaimedIssue, '_id'> = {
    ...issue,
    created_at: now,
    updated_at: now
  }
  
  const result = await collection.insertOne(newIssue)
  return result.insertedId
}

export async function findClaimedIssue(repositoryId: ObjectId, issueNumber: number, claimerUsername: string): Promise<ClaimedIssue | null> {
  const db = await getDatabase()
  const collection = db.collection<ClaimedIssue>(COLLECTIONS.CLAIMED_ISSUES)
  
  return await collection.findOne({
    repository_id: repositoryId,
    issue_number: issueNumber,
    claimer_username: claimerUsername
  })
}

export async function updateClaimedIssue(id: ObjectId, updates: Partial<ClaimedIssue>): Promise<void> {
  const db = await getDatabase()
  const collection = db.collection<ClaimedIssue>(COLLECTIONS.CLAIMED_ISSUES)
  
  await collection.updateOne(
    { _id: id },
    { $set: { ...updates, updated_at: new Date() } }
  )
}

export async function getClaimedIssuesWithRepository(filters: any = {}): Promise<any[]> {
  const db = await getDatabase()
  const collection = db.collection<ClaimedIssue>(COLLECTIONS.CLAIMED_ISSUES)
  
  const pipeline = [
    { $match: filters },
    {
      $lookup: {
        from: COLLECTIONS.REPOSITORIES,
        localField: 'repository_id',
        foreignField: '_id',
        as: 'repository'
      }
    },
    {
      $unwind: '$repository'
    }
  ]
  
  const results = await collection.aggregate(pipeline).toArray()
  
  // Serialize MongoDB documents for client components
  return results.map(issue => ({
    _id: issue._id?.toString(),
    repository_id: issue.repository_id?.toString(),
    issue_number: issue.issue_number,
    issue_title: issue.issue_title,
    issue_url: issue.issue_url,
    claimer_username: issue.claimer_username,
    claimer_avatar_url: issue.claimer_avatar_url,
    claim_comment_id: issue.claim_comment_id,
    claim_comment_text: issue.claim_comment_text,
    claimed_at: issue.claimed_at?.toISOString(),
    last_checked_at: issue.last_checked_at?.toISOString(),
    status: issue.status,
    nudge_count: issue.nudge_count,
    last_nudged_at: issue.last_nudged_at?.toISOString(),
    has_linked_pr: issue.has_linked_pr,
    has_commits: issue.has_commits,
    auto_release_at: issue.auto_release_at?.toISOString(),
    created_at: issue.created_at?.toISOString(),
    updated_at: issue.updated_at?.toISOString(),
    repository: {
      _id: issue.repository._id?.toString(),
      github_owner: issue.repository.github_owner,
      github_repo: issue.repository.github_repo,
      github_installation_id: issue.repository.github_installation_id,
      created_at: issue.repository.created_at?.toISOString(),
      updated_at: issue.repository.updated_at?.toISOString()
    }
  }))
}

export async function getStaleIssues(): Promise<any[]> {
  const now = new Date()
  return await getClaimedIssuesWithRepository({
    status: 'active',
    auto_release_at: { $lte: now }
  })
}

export async function getNudgeableIssues(): Promise<any[]> {
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  
  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)
  
  return await getClaimedIssuesWithRepository({
    status: { $in: ['active', 'nudged'] },
    claimed_at: { $lte: threeDaysAgo },
    has_linked_pr: false,
    $or: [
      { last_nudged_at: { $exists: false } },
      { last_nudged_at: { $lte: oneDayAgo } }
    ]
  })
}

// Activity Log operations
export async function createActivityLog(log: Omit<ActivityLog, '_id' | 'created_at'>): Promise<ObjectId> {
  const db = await getDatabase()
  const collection = db.collection<ActivityLog>(COLLECTIONS.ACTIVITY_LOG)
  
  const newLog: Omit<ActivityLog, '_id'> = {
    ...log,
    created_at: new Date()
  }
  
  const result = await collection.insertOne(newLog)
  return result.insertedId
}

// Shame Board operations
export async function getOrCreateShameBoardEntry(username: string): Promise<ShameboardEntry> {
  const db = await getDatabase()
  const collection = db.collection<ShameboardEntry>(COLLECTIONS.SHAME_BOARD)
  
  const existing = await collection.findOne({ username })
  if (existing) {
    return existing
  }
  
  const newEntry: Omit<ShameboardEntry, '_id'> = {
    username,
    total_abandoned: 0,
    total_completed: 0,
    reliability_score: 100,
    last_updated_at: new Date(),
    created_at: new Date()
  }
  
  const result = await collection.insertOne(newEntry)
  return { ...newEntry, _id: result.insertedId }
}

export async function updateShameBoardEntry(username: string, action: 'abandoned' | 'completed'): Promise<void> {
  const db = await getDatabase()
  const collection = db.collection<ShameboardEntry>(COLLECTIONS.SHAME_BOARD)
  
  const entry = await getOrCreateShameBoardEntry(username)
  
  const totalAbandoned = entry.total_abandoned + (action === 'abandoned' ? 1 : 0)
  const totalCompleted = entry.total_completed + (action === 'completed' ? 1 : 0)
  const total = totalAbandoned + totalCompleted
  const reliabilityScore = total > 0 ? (totalCompleted / total) * 100 : 100
  
  await collection.updateOne(
    { username },
    {
      $set: {
        total_abandoned: totalAbandoned,
        total_completed: totalCompleted,
        reliability_score: reliabilityScore,
        last_updated_at: new Date()
      }
    }
  )
}

export async function getShameBoardEntries(): Promise<any[]> {
  const db = await getDatabase()
  const collection = db.collection<ShameboardEntry>(COLLECTIONS.SHAME_BOARD)
  
  const results = await collection.find({}).sort({ reliability_score: -1 }).toArray()
  
  // Serialize MongoDB documents for client components
  return results.map(entry => ({
    _id: entry._id?.toString(),
    username: entry.username,
    total_abandoned: entry.total_abandoned,
    total_completed: entry.total_completed,
    reliability_score: entry.reliability_score,
    last_updated_at: entry.last_updated_at?.toISOString(),
    created_at: entry.created_at?.toISOString()
  }))
}
