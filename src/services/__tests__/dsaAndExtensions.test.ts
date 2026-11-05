import { describe, it, expect, beforeEach } from 'vitest';
import { DataService } from '../dataService';

describe('DataService - Stages 4 & 5 (DSA, Projects, Jobs, Goals, Inbox & Search)', () => {
  let service: DataService;

  beforeEach(() => {
    service = new DataService();
    service.resetToDefaults();
  });

  describe('DSA Tracker & Spaced Repetition', () => {
    it('seeds curated DSA problems and allows adding new problems', () => {
      const initial = service.getDSAProblems();
      expect(initial.length).toBeGreaterThanOrEqual(5);

      const added = service.addDSAProblem({
        title: 'Word Search',
        pattern: 'Backtracking',
        link: 'https://leetcode.com/problems/word-search/',
        difficulty: 'medium',
        status: 'todo',
        solved_date: null,
        attempts: 0,
        time_spent_mins: 0,
        mistakes: '',
        notes: 'DFS with grid in-place marking #',
        next_revision_date: null,
        revision_step: 1
      });

      expect(added.id).toBeDefined();
      expect(service.getDSAProblemById(added.id)?.title).toBe('Word Search');
    });

    it('marks a problem solved, sets next revision date to +1 day and increments daily log count', () => {
      const added = service.addDSAProblem({
        title: 'Invert Binary Tree',
        pattern: 'Tree DFS',
        link: 'https://leetcode.com/problems/invert-binary-tree/',
        difficulty: 'easy',
        status: 'todo',
        solved_date: null,
        attempts: 0,
        time_spent_mins: 0,
        mistakes: '',
        notes: 'Recursively swap left and right pointers',
        next_revision_date: null,
        revision_step: 1
      });

      const updated = service.markDSASolved(added.id, 20);
      expect(updated?.status).toBe('solved');
      expect(updated?.attempts).toBe(1);
      expect(updated?.time_spent_mins).toBe(20);
      expect(updated?.revision_step).toBe(1);
      expect(updated?.next_revision_date).toBeDefined();

      const todayStr = new Date().toISOString().split('T')[0];
      const todayLog = service.getDailyLogByDate(todayStr);
      expect(todayLog?.dsa_problems_solved).toBeGreaterThanOrEqual(1);
    });

    it('advances spaced repetition intervals (1 -> 3 -> 7 -> 30 -> 90 -> mastered)', () => {
      const prob = service.addDSAProblem({
        title: 'Coin Change Test',
        pattern: 'DP',
        link: 'https://leetcode.com/problems/coin-change/',
        difficulty: 'medium',
        status: 'solved',
        solved_date: '2026-10-31',
        attempts: 1,
        time_spent_mins: 25,
        mistakes: '',
        notes: '',
        next_revision_date: '2026-10-31',
        revision_step: 1
      });

      // Complete 1st revision -> step becomes 3
      const rev1 = service.completeRevision(prob.id);
      expect(rev1?.revision_step).toBe(3);

      // Complete 2nd revision -> step becomes 7
      const rev2 = service.completeRevision(prob.id);
      expect(rev2?.revision_step).toBe(7);

      // Complete 3rd revision -> step becomes 30
      const rev3 = service.completeRevision(prob.id);
      expect(rev3?.revision_step).toBe(30);

      // Complete 4th revision -> step becomes 90
      const rev4 = service.completeRevision(prob.id);
      expect(rev4?.revision_step).toBe(90);

      // Complete 5th revision -> mastered!
      const rev5 = service.completeRevision(prob.id);
      expect(rev5?.status).toBe('mastered');
      expect(rev5?.next_revision_date).toBeNull();
    });

    it('correctly filters due revisions', () => {
      service.addDSAProblem({
        title: 'Overdue Problem',
        pattern: 'Two Pointers',
        link: 'https://leetcode.com',
        difficulty: 'easy',
        status: 'solved',
        solved_date: '2026-10-20',
        attempts: 1,
        time_spent_mins: 15,
        mistakes: '',
        notes: '',
        next_revision_date: '2026-10-25', // in the past
        revision_step: 3
      });

      const due = service.getDueRevisions();
      expect(due.some(p => p.title === 'Overdue Problem')).toBe(true);
    });
  });

  describe('Projects & README Checklist', () => {
    it('manages projects, toggles milestones and readme items', () => {
      const proj = service.addProject({
        title: 'Autonomous Client Agent',
        description: 'FDE agent tool for data onboarding',
        tech_stack: ['Python', 'LangChain', 'FastAPI'],
        github_url: 'https://github.com/test/agent',
        demo_url: 'https://demo.agent.dev',
        demo_video_url: '',
        status: 'in_progress',
        milestones: [{ id: 'm-1', title: 'Connect to Postgres', completed: false }],
        readme_checklist: [
          { id: 'r-1', title: 'Architecture diagram', completed: false },
          { id: 'r-2', title: '2-minute demo video', completed: false }
        ]
      });

      expect(service.getProjects().some(p => p.id === proj.id)).toBe(true);

      service.toggleProjectMilestone(proj.id, 'm-1');
      const updatedProj = service.getProjects().find(p => p.id === proj.id);
      expect(updatedProj?.milestones[0].completed).toBe(true);

      service.toggleProjectReadmeItem(proj.id, 'r-1');
      const updatedProj2 = service.getProjects().find(p => p.id === proj.id);
      expect(updatedProj2?.readme_checklist[0].completed).toBe(true);
    });
  });

  describe('Job and Interview Tracker', () => {
    it('adds job applications, interview rounds, questions asked and mock interviews', () => {
      const job = service.addJob({
        company: 'Anthropic',
        role: 'Forward Deployed AI Engineer',
        status: 'applied',
        applied_date: '2026-10-31',
        resume_version: 'v3.0.pdf',
        rounds: [],
        questions_asked: [],
        mock_interviews: []
      });

      expect(job.id).toBeDefined();

      service.addInterviewRound(job.id, {
        name: 'Technical Screening',
        date: '2026-11-05',
        notes: 'Live coding on distributed rate limiter',
        passed: true
      });

      service.addQuestionAsked(job.id, 'Explain trade-offs between consistency and latency in distributed caching.');
      service.addMockInterview(job.id, {
        interviewer: 'Alum Peer',
        date: '2026-11-02',
        feedback: 'Good architecture diagrams, articulate failure recovery faster.'
      });

      const updated = service.getJobs().find(j => j.id === job.id);
      expect(updated?.rounds.length).toBe(1);
      expect(updated?.questions_asked.length).toBe(1);
      expect(updated?.mock_interviews.length).toBe(1);
    });
  });

  describe('Goals & Achievements', () => {
    it('manages goals and dynamically verifies achievements', () => {
      const goal = service.addGoal({
        type: 'weekly',
        title: 'Read 2 Palantir Engineering blog posts',
        target_date: '2026-11-05',
        completed: false
      });

      expect(goal.completed).toBe(false);
      const toggled = service.toggleGoal(goal.id);
      expect(toggled?.completed).toBe(true);

      const achs = service.getAchievements();
      expect(achs.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Resource Inbox & Global Search', () => {
    it('adds to resource inbox and attaches resource to a topic', () => {
      const inboxRes = service.addToInbox({
        title: 'Martin Kleppmann Talk on Distributed Transactions',
        url: 'https://youtube.com/watch?v=123',
        type: 'video'
      });

      expect(service.getInboxResources().some(r => r.id === inboxRes.id)).toBe(true);

      const topics = service.getTopics();
      const firstTopic = topics[0];

      const attached = service.attachInboxResourceToTopic(inboxRes.id, firstTopic.id);
      expect(attached).toBe(true);
      expect(service.getInboxResources().some(r => r.id === inboxRes.id)).toBe(false);
    });

    it('performs global search across topics, DSA problems, and projects', () => {
      const results = service.globalSearch('Palantir');
      expect(results.length).toBeGreaterThan(0);

      const dsaSearch = service.globalSearch('Sum');
      expect(dsaSearch.some(r => r.type === 'dsa')).toBe(true);
    });
  });

  describe('Full Backup Import/Export with Extensions', () => {
    it('exports and restores all extended models intact', () => {
      service.addProject({
        title: 'Test Engineering Project',
        description: 'Test Description',
        tech_stack: ['Python', 'Docker'],
        status: 'planning',
        milestones: [],
        readme_checklist: []
      } as any);
      const exportedJson = service.exportToJson();
      expect(exportedJson).toContain('dsaProblems');
      expect(exportedJson).toContain('projects');
      expect(exportedJson).toContain('jobs');

      const freshService = new DataService();
      const restored = freshService.importFromJson(exportedJson);
      expect(restored).toBe(true);
      expect(freshService.getDSAProblems().length).toBeGreaterThanOrEqual(5);
      expect(freshService.getProjects().length).toBeGreaterThanOrEqual(1);
    });
  });
});
