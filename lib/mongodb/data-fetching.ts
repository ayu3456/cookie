import { getClaimedIssuesWithRepository, getShameBoardEntries } from './operations'
import { getDatabase } from './client'
import { COLLECTIONS } from './models'

export async function getClaimedIssues(filters: any = {}) {
  return await getClaimedIssuesWithRepository(filters)
}

export async function getActiveIssues() {
  return await getClaimedIssuesWithRepository({ status: 'active' })
}

export async function getNudgedIssues() {
  return await getClaimedIssuesWithRepository({ status: 'nudged' })
}

export async function getReleasedIssues() {
  return await getClaimedIssuesWithRepository({ status: 'released' })
}

export async function getCompletedIssues() {
  return await getClaimedIssuesWithRepository({ status: 'completed' })
}

export async function getShameBoard() {
  return await getShameBoardEntries()
}

export async function getIssuesByRepository(owner: string, repo: string) {
  const { getOrCreateRepository } = await import('./operations')
  const repository = await getOrCreateRepository(owner, repo)
  return await getClaimedIssuesWithRepository({ repository_id: repository._id! })
}

export async function getRepositories() {
  try {
    const db = await getDatabase()
    const repositories = await db.collection(COLLECTIONS.REPOSITORIES)
      .find({})
      .sort({ updated_at: -1 })
      .toArray()
    
    // Serialize MongoDB documents for client components
    return repositories.map(repo => ({
      _id: repo._id?.toString(),
      github_owner: repo.github_owner,
      github_repo: repo.github_repo,
      github_installation_id: repo.github_installation_id,
      created_at: repo.created_at?.toISOString(),
      updated_at: repo.updated_at?.toISOString()
    }))
  } catch (error) {
    console.error('[MongoDB] Error fetching repositories:', error)
    return []
  }
}
