import { DSAProblem, ProjectItem, JobApplication, Goal, Achievement } from '../types';

export const SEED_DSA_PROBLEMS: DSAProblem[] = [
  {
    id: 'dsa-1',
    title: 'Two Sum',
    pattern: 'Two Pointers / Hash Map',
    link: 'https://leetcode.com/problems/two-sum/',
    difficulty: 'easy',
    status: 'solved',
    solved_date: '2026-10-25',
    attempts: 1,
    time_spent_mins: 15,
    mistakes: 'Checked nested loops first; remember to use single-pass hash map for O(n) lookup.',
    notes: 'Store complement target - num in map as key and index as value.',
    next_revision_date: '2026-11-01',
    revision_step: 3
  },
  {
    id: 'dsa-2',
    title: 'Longest Substring Without Repeating Characters',
    pattern: 'Sliding Window',
    link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    difficulty: 'medium',
    status: 'solved',
    solved_date: '2026-10-28',
    attempts: 2,
    time_spent_mins: 25,
    mistakes: 'Left pointer jumped backwards if duplicate was outside current window. Must do left = Math.max(left, map.get(char) + 1).',
    notes: 'Maintain window [left, right] with hash map of last seen character indices.',
    next_revision_date: '2026-11-04',
    revision_step: 7
  },
  {
    id: 'dsa-3',
    title: 'Trapping Rain Water',
    pattern: 'Two Pointers',
    link: 'https://leetcode.com/problems/trapping-rain-water/',
    difficulty: 'hard',
    status: 'attempted',
    solved_date: null,
    attempts: 3,
    time_spent_mins: 45,
    mistakes: 'Confused the left_max and right_max update logic when heights are equal.',
    notes: 'Two pointers from ends: water trapped at i depends on min(leftMax, rightMax) - height[i].',
    next_revision_date: '2026-11-01',
    revision_step: 1
  },
  {
    id: 'dsa-4',
    title: 'Merge Intervals',
    pattern: 'Merge Intervals',
    link: 'https://leetcode.com/problems/merge-intervals/',
    difficulty: 'medium',
    status: 'solved',
    solved_date: '2026-10-29',
    attempts: 1,
    time_spent_mins: 20,
    mistakes: 'Forgot to sort by start time first.',
    notes: 'Sort intervals by interval[0]. Merge if current start <= previous end.',
    next_revision_date: '2026-11-05',
    revision_step: 7
  },
  {
    id: 'dsa-5',
    title: 'Binary Tree Level Order Traversal',
    pattern: 'Tree BFS',
    link: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
    difficulty: 'medium',
    status: 'todo',
    solved_date: null,
    attempts: 0,
    time_spent_mins: 0,
    mistakes: '',
    notes: 'Use queue with size snapshot at each level loop.',
    next_revision_date: null,
    revision_step: 1
  },
  {
    id: 'dsa-6',
    title: 'Course Schedule (Cycle Detection)',
    pattern: 'Graph / Topological Sort',
    link: 'https://leetcode.com/problems/course-schedule/',
    difficulty: 'medium',
    status: 'todo',
    solved_date: null,
    attempts: 0,
    time_spent_mins: 0,
    mistakes: '',
    notes: 'Kahns Algorithm using in-degree array, or DFS with 3 states (unvisited, visiting, visited).',
    next_revision_date: null,
    revision_step: 1
  },
  {
    id: 'dsa-7',
    title: 'Coin Change',
    pattern: 'Dynamic Programming',
    link: 'https://leetcode.com/problems/coin-change/',
    difficulty: 'medium',
    status: 'todo',
    solved_date: null,
    attempts: 0,
    time_spent_mins: 0,
    mistakes: '',
    notes: 'Unbounded knapsack: dp[i] = min(dp[i], dp[i - coin] + 1). Initialize dp with infinity.',
    next_revision_date: null,
    revision_step: 1
  },
  {
    id: 'dsa-8',
    title: 'Search in Rotated Sorted Array',
    pattern: 'Modified Binary Search',
    link: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
    difficulty: 'medium',
    status: 'solved',
    solved_date: '2026-10-30',
    attempts: 2,
    time_spent_mins: 30,
    mistakes: 'Forgot <= edge case when checking if left half is normally sorted.',
    notes: 'At least one half is always sorted. Determine which half is sorted and check if target lies within its bounds.',
    next_revision_date: '2026-11-02',
    revision_step: 3
  }
];

export const SEED_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-1',
    title: 'High-Throughput Enterprise RAG & Vector Pipeline',
    description: 'Forward Deployed AI data ingestion engine: extracts documents, embeds with pgvector, handles hybrid sparse/dense search, and serves customer analytics via FastAPI & React.',
    tech_stack: ['FastAPI', 'PostgreSQL / pgvector', 'React', 'TypeScript', 'Docker', 'OpenAI / Ollama'],
    github_url: 'https://github.com/polak-fde/enterprise-rag-pipeline',
    demo_url: 'https://rag-pipeline-demo.vercel.app',
    demo_video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    status: 'in_progress',
    milestones: [
      { id: 'm1', title: 'Data chunking & parsing pipeline (PDF, DOCX, Markdown)', completed: true },
      { id: 'm2', title: 'pgvector schema setup with HNSW index', completed: true },
      { id: 'm3', title: 'Hybrid search with Reciprocal Rank Fusion (RRF)', completed: false },
      { id: 'm4', title: 'Real-time WebSocket streaming chat UI', completed: false },
      { id: 'm5', title: 'Benchmarking latency under 100 concurrent requests', completed: false }
    ],
    readme_checklist: [
      { id: 'r1', title: 'Clear architecture diagram (Mermaid / Excalidraw)', completed: true },
      { id: 'r2', title: '2-minute video walkthrough showcasing client integration', completed: false },
      { id: 'r3', title: 'High-res UI screenshots & telemetry metrics', completed: true },
      { id: 'r4', title: 'One-command Docker Compose setup instruction', completed: true }
    ]
  },
  {
    id: 'proj-2',
    title: 'Real-Time Edge Telemetry & Client Observability Platform',
    description: 'Distributed monitoring agent deployed on customer on-prem infrastructure streaming logs, heartbeats, and metrics to a centralized dashboard with sub-second alert evaluations.',
    tech_stack: ['Go', 'WebSockets', 'ClickHouse', 'React', 'Tailwind', 'Prometheus'],
    github_url: 'https://github.com/polak-fde/edge-telemetry-engine',
    demo_url: 'https://edge-telemetry.vercel.app',
    demo_video_url: '',
    status: 'planning',
    milestones: [
      { id: 'm21', title: 'Lightweight daemon agent written in Go (<15MB RAM)', completed: false },
      { id: 'm22', title: 'ClickHouse time-series schema & compression benchmarks', completed: false },
      { id: 'm23', title: 'Live Canvas visualization of event throughput', completed: false }
    ],
    readme_checklist: [
      { id: 'r21', title: 'Clear architecture diagram (Mermaid / Excalidraw)', completed: false },
      { id: 'r22', title: '2-minute video walkthrough showcasing client integration', completed: false },
      { id: 'r23', title: 'High-res UI screenshots & telemetry metrics', completed: false },
      { id: 'r24', title: 'One-command Docker Compose setup instruction', completed: false }
    ]
  }
];

export const SEED_JOBS: JobApplication[] = [
  {
    id: 'job-1',
    company: 'Palantir Technologies',
    role: 'Forward Deployed Software Engineer (FDSE)',
    status: 'interviewing',
    applied_date: '2026-10-15',
    resume_version: 'v2.1-fde-systems.pdf',
    rounds: [
      { id: 'rnd-1', name: 'Recruiter Screen', date: '2026-10-20', notes: 'Discussed graduation year, client-facing interests, and systems background.', passed: true },
      { id: 'rnd-2', name: 'Technical Phone Screen (DSA & Problem Solving)', date: '2026-10-27', notes: 'Solved Graph traversal + data structure design for enterprise inventory.', passed: true },
      { id: 'rnd-3', name: 'Decomp / System Architecture Onsite', date: '2026-11-10', notes: 'Focus on scaling distributed ingestion pipeline with unreliable networks.', passed: false }
    ],
    questions_asked: [
      'Design a real-time sync system between offline edge nodes and central cloud.',
      'How would you prioritize client feature requests versus technical debt?',
      'Implement an LRU Cache with TTL support in O(1).'
    ],
    mock_interviews: [
      { id: 'mi-1', interviewer: 'Senior FDE Mentor (Ex-Palantir)', date: '2026-10-24', feedback: 'Great algorithmic speed. Spend more time clarifying ambiguous constraints upfront before writing code.' }
    ]
  },
  {
    id: 'job-2',
    company: 'Snowflake',
    role: 'Solutions Engineer / Data Apps',
    status: 'applied',
    applied_date: '2026-10-22',
    resume_version: 'v2.0-general-swe.pdf',
    rounds: [],
    questions_asked: [],
    mock_interviews: []
  }
];

export const SEED_GOALS: Goal[] = [
  {
    id: 'goal-1',
    type: 'yearly',
    title: 'Master 150 Core DSA Patterns (Sliding Window, Two Pointers, Trees, Graphs, DP)',
    target_date: '2027-11-01',
    completed: false
  },
  {
    id: 'goal-2',
    type: 'yearly',
    title: 'Deploy 2 Full-Stack Client Prototypes with Architecture Docs & Video Demos',
    target_date: '2027-11-01',
    completed: false
  },
  {
    id: 'goal-3',
    type: 'semester',
    title: 'Complete System Design Track: Caching, Load Balancing, SQL vs NoSQL, Sharding',
    target_date: '2027-04-30',
    completed: false
  },
  {
    id: 'goal-4',
    type: 'weekly',
    title: 'Solve 7 LeetCode Mediums on Graphs & Topological Sort',
    target_date: '2026-11-07',
    completed: false
  },
  {
    id: 'goal-5',
    type: 'weekly',
    title: 'No Zero Days: Log at least 60 mins of focused study every single day',
    target_date: '2026-11-07',
    completed: false
  }
];

export const SEED_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    title: 'First Step',
    description: 'Mark your very first roadmap topic as Done',
    badge: '🚀',
    unlocked: true,
    unlocked_at: '2026-10-25T14:30:00Z'
  },
  {
    id: 'ach-2',
    title: '7-Day Streak',
    description: 'Log focused study time 7 consecutive days',
    badge: '🔥',
    unlocked: true,
    unlocked_at: '2026-10-31T20:00:00Z'
  },
  {
    id: 'ach-3',
    title: 'No Zero Days Champion',
    description: 'Log 14 consecutive days without skipping',
    badge: '⚡',
    unlocked: false,
    unlocked_at: null
  },
  {
    id: 'ach-4',
    title: 'Algorithm Apprentice',
    description: 'Solve 10 DSA problems in the tracker',
    badge: '🧠',
    unlocked: false,
    unlocked_at: null
  },
  {
    id: 'ach-5',
    title: 'Spaced Repetition Master',
    description: 'Complete 5 scheduled revision reviews on time',
    badge: '📚',
    unlocked: false,
    unlocked_at: null
  },
  {
    id: 'ach-6',
    title: 'Production Ready',
    description: 'Complete all 4 README checklist requirements on a project',
    badge: '🏆',
    unlocked: false,
    unlocked_at: null
  },
  {
    id: 'ach-7',
    title: 'Palantir / FDE Ready',
    description: 'Record an interview round or mock interview in Job Tracker',
    badge: '💼',
    unlocked: true,
    unlocked_at: '2026-10-24T18:00:00Z'
  }
];
