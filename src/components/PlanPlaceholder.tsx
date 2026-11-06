import React from 'react';
import { motion } from 'framer-motion';
import { CalendarRange, Sparkles } from 'lucide-react';

export const PlanPlaceholder: React.FC = () => {
  const PRESET_LANES = [
    { track: 'Track 0: Introduction', dates: 'Nov 1 – Nov 3, 2026', progress: 'Ready to Start', parallel: false },
    { track: 'Track 1: Python (Main Language)', dates: 'Nov 3, 2026 – Feb 15, 2027', progress: 'Upcoming', parallel: true },
    { track: 'Track 2: DSA (Striver A2Z + LeetCode)', dates: 'Nov 3, 2026 – 2030 (Continuous)', progress: 'Parallel Lane', parallel: true },
    { track: 'Track 3: Git & GitHub', dates: 'Nov 10 – Nov 13, 2026', progress: 'Parallel Lane', parallel: true },
    { track: 'Track 4: Linux Skills', dates: 'Flexible (Unscheduled)', progress: 'Queue', parallel: false },
    { track: 'Track 5: Frontend Skills (React)', dates: 'Feb 1 – Mar 3, 2027', progress: 'Upcoming', parallel: true },
    { track: 'Track 6: Backend Skills (Node/PG)', dates: 'Mar 3 – May 3, 2027', progress: 'Upcoming', parallel: false },
  ];

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-4xl mx-auto">
      <div className="pt-2">
        <span className="text-xs uppercase tracking-widest text-[#00F0FF] font-semibold flex items-center gap-1.5 mb-1 font-sans">
          <CalendarRange className="w-3.5 h-3.5" /> 4-Year Timeline Architecture
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#F9F6EE]">
          Plan & Parallel Tracks
        </h1>
        <p className="text-xs sm:text-sm text-[#A09D95] font-sans mt-0.5">
          Gantt-style sequencing with multi-lane parallel blocks (Stage 5 builder ready)
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-[#121212] border border-[#00F0FF]/30 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#00F0FF] shrink-0 mt-0.5" />
        <p className="text-xs text-[#A09D95] leading-relaxed">
          The starting preset from your notebook is pre-loaded. In Stage 5, the interactive Gantt drag-to-resize timeline with multi-lane parallel blocks, "I'm behind shift", and exam week pause will activate here.
        </p>
      </div>

      <div className="space-y-3">
        {PRESET_LANES.map((lane) => (
          <div
            key={lane.track}
            className="p-4 sm:p-5 rounded-2xl bg-[#121212] border border-[#00F0FF]/25 hover:border-[#00F0FF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-sm"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />
                <h3 className="font-serif text-lg font-bold text-[#F9F6EE]">
                  {lane.track}
                </h3>
                {lane.parallel && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-black text-[#00F0FF] border border-[#00F0FF]/30 font-semibold">
                    Parallel Lane
                  </span>
                )}
              </div>
              <p className="text-xs text-[#A09D95] font-sans">
                {lane.dates}
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <span className="text-xs px-3 py-1 rounded-xl bg-black border border-[#00F0FF]/30 text-[#00F0FF] font-semibold">
                {lane.progress}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
