import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrbitalLogo } from '../components/OrbitalLogo';
import { StudentService, AuthService } from '../api/client';
import {
  BookOpen,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  Sparkles,
  LogOut,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export const StudentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [masteries, setMasteries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sample weekly progress data for Recharts
  const trendData = [
    { day: 'Mon', score: 65 },
    { day: 'Tue', score: 72 },
    { day: 'Wed', score: 68 },
    { day: 'Thu', score: 84 },
    { day: 'Fri', score: 88 },
    { day: 'Sat', score: 92 },
  ];

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);

    const fetchData = async () => {
      try {
        const [tasksData, masteryData] = await Promise.all([
          StudentService.getTodayTasks().catch(() => []),
          StudentService.getMastery().catch(() => []),
        ]);
        setTasks(tasksData);
        setMasteries(masteryData);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Top Mobile App Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 py-3 flex items-center justify-between">
        <OrbitalLogo size={36} showText={true} />
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs font-bold text-white">{user?.full_name?.split(' ')[0] || 'Student'}</div>
            <div className="text-[10px] text-cyan-400 font-medium">Roll #{user?.roll_no || 1}</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-5 flex flex-col gap-6">
        {/* Daily Motivation Streak Card */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-900/60 to-slate-900 border border-indigo-500/20 p-4 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-300">Daily Study Streak</div>
              <div className="text-sm font-bold text-white">4 Days Consistent 🔥</div>
            </div>
          </div>
          <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            CLASS 8A
          </span>
        </div>

        {/* SECTION 1: Today's Homework Tasks */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" /> Today's Assigned Tasks
            </h2>
            <span className="text-xs font-medium text-slate-500 font-mono">
              {tasks.length} Active
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {tasks.length === 0 ? (
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 text-center text-slate-400 text-xs">
                No homework pending for today! Great job staying caught up.
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl bg-slate-900 border border-slate-800 p-4 hover:border-indigo-500/40 transition flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold tracking-wider text-cyan-400 uppercase">
                        {task.subject}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-0.5">{task.title}</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                      {task.items?.length || 5} Questions
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Due {task.due_at ? new Date(task.due_at).toLocaleDateString() : 'Tomorrow'}
                    </span>
                    <button
                      onClick={() => navigate(`/student/submit/${task.id}`)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/20"
                    >
                      Solve & Submit <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* SECTION 2: Topic Mastery Breakdown */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" /> Adaptive Topic Mastery
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {masteries.length === 0 ? (
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 text-center text-xs text-slate-400">
                Submit homework to unlock AI multimodal diagnostic ratings.
              </div>
            ) : (
              masteries.map((m) => {
                const tier = m.tier?.toLowerCase() || 'average';
                const isStrong = tier === 'strong';
                const isWeak = tier === 'weak';
                const isIllusion = m.illusion_flag;

                return (
                  <div
                    key={m.topic_id}
                    className="rounded-2xl bg-slate-900 border border-slate-800 p-3.5 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">
                        {m.topic_name || 'Linear Equations in One Variable'}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Score: {Math.round(m.fused_score || 75)}%</span>
                        {isIllusion && (
                          <span className="text-[10px] text-amber-400 font-semibold bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.5 rounded">
                            Illusion Detected
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border uppercase ${
                          isStrong
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                            : isWeak
                            ? 'bg-rose-950 text-rose-300 border-rose-500/30'
                            : 'bg-amber-950 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {tier}
                      </span>
                      {isWeak && (
                        <button
                          onClick={() => navigate(`/student/remediation/${m.topic_id}`)}
                          className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold"
                        >
                          Re-Teach
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* SECTION 3: Weekly Mastery Trend Chart */}
        <section className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Weekly Mastery Trend
            </h2>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              +14% Growth
            </span>
          </div>

          <div className="w-full h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[50, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#38bdf8', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', r: 4 }}
                  activeDot={{ r: 6, fill: '#38bdf8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
};
