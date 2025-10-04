-- Seed data for Cookie-Licking Detector
-- This creates realistic sample data to demonstrate the system

-- Insert sample repositories
INSERT INTO repositories (owner, name, full_name, description, url, stars, open_issues)
VALUES 
  ('vercel', 'next.js', 'vercel/next.js', 'The React Framework', 'https://github.com/vercel/next.js', 125000, 2500),
  ('facebook', 'react', 'facebook/react', 'The library for web and native user interfaces', 'https://github.com/facebook/react', 228000, 1200),
  ('microsoft', 'vscode', 'microsoft/vscode', 'Visual Studio Code', 'https://github.com/microsoft/vscode', 163000, 8500),
  ('nodejs', 'node', 'nodejs/node', 'Node.js JavaScript runtime', 'https://github.com/nodejs/node', 107000, 1800),
  ('denoland', 'deno', 'denoland/deno', 'A modern runtime for JavaScript and TypeScript', 'https://github.com/denoland/deno', 95000, 950);

-- Insert claimed issues with various statuses
-- Active claims (still being worked on)
INSERT INTO claimed_issues (
  repository_id, 
  issue_number, 
  issue_title, 
  issue_url, 
  claimed_by_username, 
  claimed_by_avatar, 
  claim_comment_url, 
  claimed_at, 
  status, 
  has_linked_pr, 
  auto_release_at
)
SELECT 
  r.id,
  12345,
  'Fix: Memory leak in server components',
  'https://github.com/vercel/next.js/issues/12345',
  'johndoe',
  'https://avatars.githubusercontent.com/u/1?v=4',
  'https://github.com/vercel/next.js/issues/12345#issuecomment-1',
  NOW() - INTERVAL '2 days',
  'active',
  false,
  NOW() + INTERVAL '5 days'
FROM repositories r WHERE r.name = 'next.js';

INSERT INTO claimed_issues (
  repository_id, 
  issue_number, 
  issue_title, 
  issue_url, 
  claimed_by_username, 
  claimed_by_avatar, 
  claim_comment_url, 
  claimed_at, 
  status, 
  has_linked_pr, 
  auto_release_at
)
SELECT 
  r.id,
  67890,
  'Add support for custom error boundaries',
  'https://github.com/facebook/react/issues/67890',
  'janedeveloper',
  'https://avatars.githubusercontent.com/u/2?v=4',
  'https://github.com/facebook/react/issues/67890#issuecomment-2',
  NOW() - INTERVAL '1 day',
  'active',
  true,
  NOW() + INTERVAL '6 days'
FROM repositories r WHERE r.name = 'react';

-- Stale claims (cookie lickers!)
INSERT INTO claimed_issues (
  repository_id, 
  issue_number, 
  issue_title, 
  issue_url, 
  claimed_by_username, 
  claimed_by_avatar, 
  claim_comment_url, 
  claimed_at, 
  status, 
  has_linked_pr, 
  auto_release_at,
  nudge_count,
  last_nudged_at
)
SELECT 
  r.id,
  11111,
  'Improve TypeScript performance',
  'https://github.com/microsoft/vscode/issues/11111',
  'lazycoder',
  'https://avatars.githubusercontent.com/u/3?v=4',
  'https://github.com/microsoft/vscode/issues/11111#issuecomment-3',
  NOW() - INTERVAL '15 days',
  'nudged',
  false,
  NOW() - INTERVAL '1 day',
  2,
  NOW() - INTERVAL '3 days'
FROM repositories r WHERE r.name = 'vscode';

INSERT INTO claimed_issues (
  repository_id, 
  issue_number, 
  issue_title, 
  issue_url, 
  claimed_by_username, 
  claimed_by_avatar, 
  claim_comment_url, 
  claimed_at, 
  status, 
  has_linked_pr, 
  auto_release_at,
  nudge_count,
  last_nudged_at
)
SELECT 
  r.id,
  22222,
  'Fix: Buffer overflow in crypto module',
  'https://github.com/nodejs/node/issues/22222',
  'ghostdev',
  'https://avatars.githubusercontent.com/u/4?v=4',
  'https://github.com/nodejs/node/issues/22222#issuecomment-4',
  NOW() - INTERVAL '20 days',
  'nudged',
  false,
  NOW() - INTERVAL '5 days',
  3,
  NOW() - INTERVAL '2 days'
FROM repositories r WHERE r.name = 'node';

INSERT INTO claimed_issues (
  repository_id, 
  issue_number, 
  issue_title, 
  issue_url, 
  claimed_by_username, 
  claimed_by_avatar, 
  claim_comment_url, 
  claimed_at, 
  status, 
  has_linked_pr, 
  auto_release_at
)
SELECT 
  r.id,
  33333,
  'Add WebGPU support',
  'https://github.com/denoland/deno/issues/33333',
  'procrastinator',
  'https://avatars.githubusercontent.com/u/5?v=4',
  'https://github.com/denoland/deno/issues/33333#issuecomment-5',
  NOW() - INTERVAL '25 days',
  'active',
  false,
  NOW() - INTERVAL '10 days'
FROM repositories r WHERE r.name = 'deno';

-- Completed issues
INSERT INTO claimed_issues (
  repository_id, 
  issue_number, 
  issue_title, 
  issue_url, 
  claimed_by_username, 
  claimed_by_avatar, 
  claim_comment_url, 
  claimed_at, 
  status, 
  has_linked_pr,
  completed_at
)
SELECT 
  r.id,
  44444,
  'Optimize bundle size',
  'https://github.com/vercel/next.js/issues/44444',
  'superdev',
  'https://avatars.githubusercontent.com/u/6?v=4',
  'https://github.com/vercel/next.js/issues/44444#issuecomment-6',
  NOW() - INTERVAL '10 days',
  'completed',
  true,
  NOW() - INTERVAL '3 days'
FROM repositories r WHERE r.name = 'next.js';

INSERT INTO claimed_issues (
  repository_id, 
  issue_number, 
  issue_title, 
  issue_url, 
  claimed_by_username, 
  claimed_by_avatar, 
  claim_comment_url, 
  claimed_at, 
  status, 
  has_linked_pr,
  completed_at
)
SELECT 
  r.id,
  55555,
  'Fix: Concurrent rendering bug',
  'https://github.com/facebook/react/issues/55555',
  'superdev',
  'https://avatars.githubusercontent.com/u/6?v=4',
  'https://github.com/facebook/react/issues/55555#issuecomment-7',
  NOW() - INTERVAL '8 days',
  'completed',
  true,
  NOW() - INTERVAL '2 days'
FROM repositories r WHERE r.name = 'react';

-- Released/abandoned issues
INSERT INTO claimed_issues (
  repository_id, 
  issue_number, 
  issue_title, 
  issue_url, 
  claimed_by_username, 
  claimed_by_avatar, 
  claim_comment_url, 
  claimed_at, 
  status, 
  has_linked_pr,
  released_at
)
SELECT 
  r.id,
  66666,
  'Improve error messages',
  'https://github.com/microsoft/vscode/issues/66666',
  'lazycoder',
  'https://avatars.githubusercontent.com/u/3?v=4',
  'https://github.com/microsoft/vscode/issues/66666#issuecomment-8',
  NOW() - INTERVAL '30 days',
  'released',
  false,
  NOW() - INTERVAL '5 days'
FROM repositories r WHERE r.name = 'vscode';

INSERT INTO claimed_issues (
  repository_id, 
  issue_number, 
  issue_title, 
  issue_url, 
  claimed_by_username, 
  claimed_by_avatar, 
  claim_comment_url, 
  claimed_at, 
  status, 
  has_linked_pr,
  released_at
)
SELECT 
  r.id,
  77777,
  'Add new CLI commands',
  'https://github.com/nodejs/node/issues/77777',
  'ghostdev',
  'https://avatars.githubusercontent.com/u/4?v=4',
  'https://github.com/nodejs/node/issues/77777#issuecomment-9',
  NOW() - INTERVAL '35 days',
  'released',
  false,
  NOW() - INTERVAL '7 days'
FROM repositories r WHERE r.name = 'node';

INSERT INTO claimed_issues (
  repository_id, 
  issue_number, 
  issue_title, 
  issue_url, 
  claimed_by_username, 
  claimed_by_avatar, 
  claim_comment_url, 
  claimed_at, 
  status, 
  has_linked_pr,
  released_at
)
SELECT 
  r.id,
  88888,
  'Update documentation',
  'https://github.com/denoland/deno/issues/88888',
  'procrastinator',
  'https://avatars.githubusercontent.com/u/5?v=4',
  'https://github.com/denoland/deno/issues/88888#issuecomment-10',
  NOW() - INTERVAL '40 days',
  'released',
  false,
  NOW() - INTERVAL '10 days'
FROM repositories r WHERE r.name = 'deno';

-- Insert activity log entries
INSERT INTO activity_log (claimed_issue_id, action_type, details)
SELECT id, 'claimed', jsonb_build_object('username', claimed_by_username, 'issue_number', issue_number)
FROM claimed_issues;

INSERT INTO activity_log (claimed_issue_id, action_type, details)
SELECT id, 'nudged', jsonb_build_object('nudge_count', nudge_count, 'username', claimed_by_username)
FROM claimed_issues WHERE status = 'nudged';

INSERT INTO activity_log (claimed_issue_id, action_type, details)
SELECT id, 'completed', jsonb_build_object('username', claimed_by_username, 'issue_number', issue_number)
FROM claimed_issues WHERE status = 'completed';

INSERT INTO activity_log (claimed_issue_id, action_type, details)
SELECT id, 'released', jsonb_build_object('username', claimed_by_username, 'reason', 'auto_release')
FROM claimed_issues WHERE status = 'released';

-- Insert shame board entries
INSERT INTO shame_board (username, avatar_url, total_claimed, total_completed, total_abandoned, reliability_score)
VALUES 
  ('superdev', 'https://avatars.githubusercontent.com/u/6?v=4', 5, 5, 0, 100.0),
  ('janedeveloper', 'https://avatars.githubusercontent.com/u/2?v=4', 3, 2, 1, 66.7),
  ('johndoe', 'https://avatars.githubusercontent.com/u/1?v=4', 2, 1, 1, 50.0),
  ('lazycoder', 'https://avatars.githubusercontent.com/u/3?v=4', 4, 0, 4, 0.0),
  ('ghostdev', 'https://avatars.githubusercontent.com/u/4?v=4', 5, 0, 5, 0.0),
  ('procrastinator', 'https://avatars.githubusercontent.com/u/5?v=4', 6, 0, 6, 0.0);

-- Update last activity timestamp
UPDATE shame_board SET last_activity_at = NOW() - INTERVAL '1 day' WHERE username = 'superdev';
UPDATE shame_board SET last_activity_at = NOW() - INTERVAL '2 days' WHERE username = 'janedeveloper';
UPDATE shame_board SET last_activity_at = NOW() - INTERVAL '5 days' WHERE username = 'johndoe';
UPDATE shame_board SET last_activity_at = NOW() - INTERVAL '15 days' WHERE username = 'lazycoder';
UPDATE shame_board SET last_activity_at = NOW() - INTERVAL '20 days' WHERE username = 'ghostdev';
UPDATE shame_board SET last_activity_at = NOW() - INTERVAL '25 days' WHERE username = 'procrastinator';
