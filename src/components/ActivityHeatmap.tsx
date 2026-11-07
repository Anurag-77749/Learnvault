import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getTodayDateString, DailyLogEntry } from '../services/db';

type HeatmapViewMode = 'year1' | 'year2' | 'year3' | 'year4' | 'all';

interface HeatmapDayCell {
  dateStr: string;
  dayNumber: number; // 1 to 1460
  formattedDate: string;
  dayOfWeek: number; // 0 (Sun) to 6 (Sat)
  log?: DailyLogEntry;
  score: number;
}

export const ActivityHeatmap: React.FC = () => {
  const [viewMode, setViewMode] = useState<HeatmapViewMode>('year1');
  const [hoveredDay, setHoveredDay] = useState<{
    dateStr: string;
    dayNumber: number;
    formattedDate: string;
    studyMins: number;
    questions: number;
    score: number;
    x: number;
    y: number;
  } | null>(null);

  // Load all daily logs from IndexedDB
  const allLogs = useLiveQuery(() => db.dailyLogs.toArray()) || [];

  // Map of dateStr -> DailyLogEntry
  const logMap = useMemo(() => {
    const map = new Map<string, DailyLogEntry>();
    for (const log of allLogs) {
      map.set(log.date, log);
    }
    return map;
  }, [allLogs]);

  // Calculate score for a day: studyMinutes + 5 * questionsCount
  const getDayScore = (log?: DailyLogEntry): number => {
    if (!log) return 0;
    const study = log.studyMinutes || 0;
    const questions = log.questionsCount || 0;
    return study + 5 * questions;
  };

  // Color shade based on Part 2.D thresholds
  // 0: none (empty) -> black with subtle royal maroon border
  // 1: < 30 -> #0E4429
  // 2: < 90 -> #006D32
  // 3: < 180 -> #26A641
  // 4: >= 180 -> #39D353
  const getHeatmapColor = (score: number) => {
    if (score <= 0) return 'bg-[#000000] border border-[#1f1f1f] hover:border-[#84CC16]/50';
    if (score < 30) return 'bg-[#0E4429] border border-[#145A32]';
    if (score < 90) return 'bg-[#006D32] border border-[#0B843E]';
    if (score < 180) return 'bg-[#26A641] border border-[#2ECC71]';
    return 'bg-[#39D353] border border-[#48E362] shadow-[0_0_8px_rgba(57,211,83,0.5)]';
  };

  // Determine date range: Nov 1, 2026 is Day 1
  const dateRange = useMemo(() => {
    // Nov 1, 2026 is month index 10 (0-indexed)
    const baseDate = new Date(2026, 10, 1);

    switch (viewMode) {
      case 'year1': // Nov 1, 2026 to Oct 31, 2027 (365 days)
        return {
          startDate: new Date(2026, 10, 1),
          totalDays: 365,
          startDayNumber: 1,
          label: 'Year 1: 01 Nov 2026 – 31 Oct 2027',
        };
      case 'year2': // Nov 1, 2027 to Oct 31, 2028 (366 days, 2028 is leap year)
        return {
          startDate: new Date(2027, 10, 1),
          totalDays: 366,
          startDayNumber: 366,
          label: 'Year 2: 01 Nov 2027 – 31 Oct 2028',
        };
      case 'year3': // Nov 1, 2028 to Oct 31, 2029 (365 days)
        return {
          startDate: new Date(2028, 10, 1),
          totalDays: 365,
          startDayNumber: 732,
          label: 'Year 3: 01 Nov 2028 – 31 Oct 2029',
        };
      case 'year4': // Nov 1, 2029 to Oct 31, 2030 (365 days)
        return {
          startDate: new Date(2029, 10, 1),
          totalDays: 365,
          startDayNumber: 1097,
          label: 'Year 4: 01 Nov 2029 – 31 Oct 2030',
        };
      case 'all': // All 4 years: Nov 1, 2026 to Oct 31, 2030 (1,461 days)
        return {
          startDate: new Date(2026, 10, 1),
          totalDays: 1461,
          startDayNumber: 1,
          label: 'All 4 Years (1,461 Days): Nov 2026 – Oct 2030',
        };
    }
  }, [viewMode]);

  // Build grid columns (weeks of 7 days)
  const { weeks, monthHeaders } = useMemo(() => {
    const { startDate, totalDays, startDayNumber } = dateRange;
    const current = new Date(startDate);
    const weeksList: HeatmapDayCell[][] = [];
    const months: { label: string; weekIndex: number }[] = [];

    let currentWeek: HeatmapDayCell[] = [];
    let lastMonth = -1;

    // Nov 1, 2026 is Sunday (dayOfWeek = 0), so it aligns on row 0
    const initialDayOfWeek = current.getDay();
    for (let i = 0; i < initialDayOfWeek; i++) {
      currentWeek.push({
        dateStr: '',
        dayNumber: 0,
        formattedDate: '',
        dayOfWeek: i,
        score: -1,
      });
    }

    for (let i = 0; i < totalDays; i++) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const d = String(current.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      const monthIndex = current.getMonth();
      if (monthIndex !== lastMonth) {
        months.push({
          label: current.toLocaleDateString('en-US', { month: 'short' }),
          weekIndex: weeksList.length,
        });
        lastMonth = monthIndex;
      }

      const log = logMap.get(dateStr);
      const score = getDayScore(log);
      const dayOfWeek = current.getDay();

      const formatted = current.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      currentWeek.push({
        dateStr,
        dayNumber: startDayNumber + i,
        formattedDate: formatted,
        dayOfWeek,
        log,
        score,
      });

      if (dayOfWeek === 6 || i === totalDays - 1) {
        weeksList.push(currentWeek);
        currentWeek = [];
      }

      current.setDate(current.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeksList.push(currentWeek);
    }

    return { weeks: weeksList, monthHeaders: months };
  }, [dateRange, logMap]);

  // Compute streaks accurately from actual data
  const { currentStreak, longestStreak } = useMemo(() => {
    let current = 0;
    let max = 0;
    let temp = 0;

    const todayStr = getTodayDateString();
    const sortedDates = Array.from(logMap.keys())
      .filter((d) => getDayScore(logMap.get(d)) > 0)
      .sort();

    if (sortedDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Check if studied today
    const studiedToday = getDayScore(logMap.get(todayStr)) > 0;
    if (studiedToday) {
      current = 1;
      let checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - 1);

      while (true) {
        const y = checkDate.getFullYear();
        const m = String(checkDate.getMonth() + 1).padStart(2, '0');
        const d = String(checkDate.getDate()).padStart(2, '0');
        const str = `${y}-${m}-${d}`;
        if (getDayScore(logMap.get(str)) > 0) {
          current++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Longest streak
    for (let i = 0; i < sortedDates.length; i++) {
      temp++;
      if (temp > max) max = temp;
      if (i < sortedDates.length - 1) {
        const curr = new Date(sortedDates[i]);
        const next = new Date(sortedDates[i + 1]);
        const diffDays = Math.round((next.getTime() - curr.getTime()) / (1000 * 3600 * 24));
        if (diffDays !== 1) {
          temp = 0;
        }
      }
    }

    return { currentStreak: current, longestStreak: Math.max(max, current) };
  }, [logMap]);

  return (
    <div className="p-5 sm:p-6 rounded-3xl card-maroon-gold shadow-2xl relative">
      {/* Header with Title, Streaks & Range Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[#1f1f1f]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#39D353] shadow-sm shadow-[#39D353]" />
            <h2 className="font-serif text-2xl font-bold text-white">
              Daily Activity Heatmap
            </h2>
          </div>
          <p className="text-xs text-[#B8B0AA] font-sans mt-0.5">
            Starts <strong className="text-shiny-gold">November 1, 2026 (Day 1)</strong>. Completely empty until you record study sessions or solve problems.
          </p>
        </div>

        {/* View mode toggle + Streak pill */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black border border-[#84CC16]/45 text-xs font-sans shadow-inner">
            <span className="text-shiny-gold font-bold">🔥 {currentStreak}</span>
            <span className="text-[#A3E635]/80">streak (max: {longestStreak})</span>
          </div>

          <div className="flex items-center rounded-xl bg-black border border-[#84CC16]/40 p-0.5 shadow-sm">
            {[
              { id: 'year1', label: 'Year 1' },
              { id: 'year2', label: 'Year 2' },
              { id: 'year3', label: 'Year 3' },
              { id: 'year4', label: 'Year 4' },
              { id: 'all', label: 'All 4 Years' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id as HeatmapViewMode)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  viewMode === tab.id
                    ? 'btn-shiny-gold shadow-md font-bold'
                    : 'text-[#B8B0AA] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Range Info Label */}
      <div className="mb-3 flex items-center justify-between text-xs text-[#B8B0AA]">
        <span className="text-shiny-gold font-bold font-sans">{dateRange.label}</span>
        <span className="text-[11px] text-[#A3E635]/70 font-medium">Hover any square for date & points</span>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-3">
        <div className="min-w-[760px] p-4 rounded-2xl bg-black border border-[#84CC16]/20">
          {/* Month labels along the top */}
          <div className="flex ml-7 mb-2 text-[10px] text-[#A09D95] font-sans font-medium relative h-4 select-none">
            {monthHeaders.map((m, idx) => (
              <span
                key={idx}
                style={{
                  position: 'absolute',
                  left: `${(m.weekIndex / weeks.length) * 100}%`,
                }}
                className="text-[#84CC16]"
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Days of Week (Sun, Tue, Thu, Sat) + Columns */}
          <div className="flex gap-1.5">
            {/* Days labels */}
            <div className="flex flex-col justify-between text-[9px] font-sans text-[#A09D95] pr-1.5 select-none py-0.5 w-6">
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-1 flex-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1 flex-1">
                  {week.map((cell, dIdx) => {
                    if (cell.score === -1) {
                      return <div key={dIdx} className="w-full aspect-square opacity-0 pointer-events-none" />;
                    }

                    return (
                      <motion.button
                        key={cell.dateStr}
                        whileHover={{ scale: 1.4 }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredDay({
                            dateStr: cell.dateStr,
                            dayNumber: cell.dayNumber,
                            formattedDate: cell.formattedDate,
                            studyMins: cell.log?.studyMinutes || 0,
                            questions: cell.log?.questionsCount || 0,
                            score: cell.score,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-full aspect-square rounded-[3px] transition-colors ${getHeatmapColor(cell.score)}`}
                        aria-label={`${cell.formattedDate}: ${cell.score} points`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend & Score Formula */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4 pt-3 border-t border-[#84CC16]/15 text-xs text-[#A09D95]">
        <div className="text-[11px]">
          <span className="text-[#84CC16] font-semibold">Score Formula:</span> study minutes + 5 × questions solved
        </div>

        <div className="flex items-center gap-2 text-[11px] self-end sm:self-auto">
          <span>Empty (0)</span>
          <div className="w-3.5 h-3.5 rounded-[3px] bg-[#121024] border border-[#231F3D]" title="0 points (Empty)" />
          <div className="w-3.5 h-3.5 rounded-[3px] bg-[#0E4429] border border-[#145A32]" title="< 30 points" />
          <div className="w-3.5 h-3.5 rounded-[3px] bg-[#006D32] border border-[#0B843E]" title="30-89 points" />
          <div className="w-3.5 h-3.5 rounded-[3px] bg-[#26A641] border border-[#2ECC71]" title="90-179 points" />
          <div className="w-3.5 h-3.5 rounded-[3px] bg-[#39D353] border border-[#48E362]" title="180+ points" />
          <span>High (180+)</span>
        </div>
      </div>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoveredDay && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              left: `${hoveredDay.x}px`,
              top: `${hoveredDay.y - 70}px`,
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
              zIndex: 100,
            }}
            className="px-3.5 py-2 rounded-xl bg-[#121212] border border-[#84CC16] text-white text-xs shadow-2xl font-sans text-center"
          >
            <p className="font-bold text-[#84CC16]">
              {hoveredDay.formattedDate} <span className="text-[#A09D95] text-[10px] font-normal">(Day {hoveredDay.dayNumber})</span>
            </p>
            <p className="text-[#F9F6EE] text-[11px] mt-0.5">
              {hoveredDay.score > 0
                ? `${hoveredDay.studyMins}m studied • ${hoveredDay.questions} questions (${hoveredDay.score} pts)`
                : 'No study recorded yet'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
