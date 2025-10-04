// GitHub API utilities for detecting cookie licking

export interface GitHubIssue {
  number: number
  title: string
  html_url: string
  state: string
  created_at: string
  updated_at: string
  user: {
    login: string
    avatar_url: string
  }
  pull_request?: {
    url: string
  }
}

export interface GitHubComment {
  id: number
  body: string
  user: {
    login: string
    avatar_url: string
  }
  created_at: string
  html_url: string
}

export interface GitHubPullRequest {
  number: number
  title: string
  html_url: string
  state: string
  user: {
    login: string
  }
  created_at: string
}

// Patterns that indicate someone is claiming an issue
const CLAIM_PATTERNS = [
  /\b(i'?ll|i will|let me|i can|i'?d like to)\s+(work on|take|handle|fix|do|tackle)\s+(this|it)\b/i,
  /\b(assign|assigned)\s+(this|me|to me)\b/i,
  /\b(working on|started on)\s+(this|it)\b/i,
  /\b(can i|may i)\s+(work on|take|handle|fix)\s+(this|it)\b/i,
  /\b(i'?m on|i'?m taking)\s+(this|it)\b/i,
]

export function isClaimComment(commentBody: string): boolean {
  return CLAIM_PATTERNS.some((pattern) => pattern.test(commentBody))
}

export async function fetchIssues(
  owner: string,
  repo: string,
  state: "open" | "closed" | "all" = "open",
): Promise<GitHubIssue[]> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=${state}&per_page=100`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Cookie-Licking-Detector",
    },
    next: { revalidate: 300 }, // Cache for 5 minutes
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`)
  }

  const issues = await response.json()
  // Filter out pull requests (they appear in issues endpoint)
  return issues.filter((issue: GitHubIssue) => !issue.pull_request)
}

export async function fetchIssueComments(owner: string, repo: string, issueNumber: number): Promise<GitHubComment[]> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Cookie-Licking-Detector",
    },
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`)
  }

  return response.json()
}

export async function fetchUserPullRequests(
  owner: string,
  repo: string,
  username: string,
): Promise<GitHubPullRequest[]> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=100`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Cookie-Licking-Detector",
    },
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`)
  }

  const allPRs = await response.json()
  return allPRs.filter((pr: GitHubPullRequest) => pr.user.login === username)
}

export async function checkForLinkedPR(
  owner: string,
  repo: string,
  issueNumber: number,
  username: string,
): Promise<boolean> {
  // Check if user has any PRs that reference this issue
  const userPRs = await fetchUserPullRequests(owner, repo, username)

  for (const pr of userPRs) {
    // Check if PR body or title mentions the issue
    const prResponse = await fetch(
      pr.html_url.replace("github.com", "api.github.com/repos").replace("/pull/", "/pulls/"),
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Cookie-Licking-Detector",
        },
        next: { revalidate: 300 },
      },
    )

    if (prResponse.ok) {
      const prDetails = await prResponse.json()
      const body = prDetails.body || ""
      const title = prDetails.title || ""

      // Check for common issue reference patterns
      const issueRef = new RegExp(
        `#${issueNumber}\\b|fixes #${issueNumber}|closes #${issueNumber}|resolves #${issueNumber}`,
        "i",
      )
      if (issueRef.test(body) || issueRef.test(title)) {
        return true
      }
    }
  }

  return false
}
