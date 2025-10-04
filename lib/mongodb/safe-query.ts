import { getClaimedIssues, getShameBoard, getRepositories } from './data-fetching'
import { getOrCreateRepository } from './operations'

export async function safeQueryRepositories() {
  try {
    if (!process.env.MONGODB_URI) {
      return {
        data: [],
        isDemoMode: true
      }
    }
    
    const repositories = await getRepositories()
    return {
      data: repositories,
      isDemoMode: false
    }
  } catch (error) {
    console.error('[MongoDB] Error querying repositories:', error)
    return {
      data: [],
      isDemoMode: true
    }
  }
}

export async function safeQueryClaimedIssues(status?: string) {
  try {
    if (!process.env.MONGODB_URI) {
      return {
        data: [],
        isDemoMode: true
      }
    }
    
    let issues = await getClaimedIssues()
    
    if (status) {
      issues = issues.filter(issue => issue.status === status)
    }
    
    return {
      data: issues,
      isDemoMode: false
    }
  } catch (error) {
    console.error('[MongoDB] Error querying claimed issues:', error)
    return {
      data: [],
      isDemoMode: true
    }
  }
}

export async function safeQueryShameBoard() {
  try {
    if (!process.env.MONGODB_URI) {
      return {
        data: [],
        isDemoMode: true
      }
    }
    
    const shameEntries = await getShameBoard()
    return {
      data: shameEntries,
      isDemoMode: false
    }
  } catch (error) {
    console.error('[MongoDB] Error querying shame board:', error)
    return {
      data: [],
      isDemoMode: true
    }
  }
}
