export type TopicStatus = 'not_started' | 'in_progress' | 'done' | 'revising';
export type TopicDifficulty = 'easy' | 'medium' | 'hard';
export type ResourceType = 'video' | 'doc' | 'course' | 'book' | 'other';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Resource {
  id: string;
  user_id?: string;
  topic_id?: string | null;
  title: string;
  url: string;
  type: ResourceType;
  is_inbox?: boolean;
  created_at?: string;
}

export interface Topic {
  id: string;
  user_id?: string;
  track_id: string;
  section_id: string;
  title: string;
  order_index: number;
  status: TopicStatus;
  planned_start: string | null; // ISO YYYY-MM-DD
  deadline: string | null; // ISO YYYY-MM-DD
  actual_completed_date: string | null; // ISO YYYY-MM-DD
  difficulty: TopicDifficulty;
  confidence: number; // 1 to 5
  time_spent_mins: number;
  notes: string;
  subtasks: Subtask[];
  resources?: Resource[];
  created_at?: string;
  updated_at?: string;
}

export interface Section {
  id: string;
  user_id?: string;
  track_id: string;
  title: string;
  order_index: number;
  created_at?: string;
}

export interface Track {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  order_index: number;
  created_at?: string;
}

export interface DailyLog {
  id: string;
  user_id?: string;
  date: string; // YYYY-MM-DD
  total_study_time_mins: number;
  time_wasted_mins: number;
  wasted_reason: 'phone' | 'social_media' | 'youtube' | 'procrastination' | 'other' | '';
  sleep_hours: number;
  energy: number; // 1-5
  mood: number; // 1-5
  dsa_problems_solved: number;
  what_learned: string;
  tomorrow_plan: string;
  created_at?: string;
}

export interface PomodoroSession {
  id: string;
  user_id?: string;
  topic_id?: string | null;
  topic_title?: string;
  duration_mins: number;
  started_at: string;
  completed_at: string;
}

export interface DSAProblem {
  id: string;
  user_id?: string;
  title: string;
  pattern: string;
  link: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'todo' | 'attempted' | 'solved' | 'mastered';
  solved_date: string | null;
  attempts: number;
  time_spent_mins: number;
  mistakes: string;
  notes: string;
  next_revision_date: string | null;
  revision_step: number; // 1, 3, 7, 30 days
}

export interface ProjectItem {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  tech_stack: string[];
  github_url: string;
  demo_url: string;
  demo_video_url: string;
  milestones: { id: string; title: string; completed: boolean }[];
  readme_checklist: { id: string; title: string; completed: boolean }[];
  status: 'planning' | 'in_progress' | 'completed';
}

export interface JobApplication {
  id: string;
  user_id?: string;
  company: string;
  role: string;
  status: 'wishlist' | 'applied' | 'interviewing' | 'offer' | 'rejected';
  applied_date: string;
  rounds: { id: string; name: string; date: string; notes: string; passed: boolean }[];
  questions_asked: string[];
  mock_interviews: { id: string; interviewer: string; date: string; feedback: string }[];
  resume_version: string;
}

export interface PlannerSettings {
  startDate: string;
  hoursPerDay: number;
  examMode: boolean;
  examStartDate: string | null;
  examEndDate: string | null;
  activeMainTrackId: string | null;
  dsaDailyTarget: number;
}

export interface Goal {
  id: string;
  user_id?: string;
  type: 'yearly' | 'semester' | 'weekly';
  title: string;
  target_date: string;
  completed: boolean;
  created_at?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badge: string;
  unlocked: boolean;
  unlocked_at: string | null;
}

export interface PublicStats {
  githubUsername: string;
  leetcodeUsername: string;
  githubData: {
    name?: string;
    public_repos?: number;
    followers?: number;
    avatar_url?: string;
  } | null;
  leetcodeData: {
    totalSolved?: number;
    easySolved?: number;
    mediumSolved?: number;
    hardSolved?: number;
    ranking?: number;
  } | null;
  lastFetchedAt: string | null;
}

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  pendingChangesCount: number;
}
