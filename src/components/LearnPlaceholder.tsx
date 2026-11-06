import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

export const LearnPlaceholder: React.FC = () => {
  const TRACKS = [
    { id: 0, title: 'Track 0: Introduction', desc: 'FDE Glossary, Roles & Responsibilities, FDE Tiers' },
    { id: 1, title: 'Track 1: Computer Science Basics', desc: 'Python (main), JS/TS, Java/Scala, Go, Rust, C++' },
    { id: 2, title: 'Track 2: DSA & System Design', desc: 'Striver A2Z 19 Steps, NeetCode 150, High-Scale System Design' },
    { id: 3, title: 'Track 3: Git & GitHub', desc: 'Git CLI, branches, merge, rebase, PR reviews, commit hygiene' },
    { id: 4, title: 'Track 4: Linux Skills', desc: 'Hierarchy, permissions, processes, networking, Bash scripting' },
    { id: 5, title: 'Track 5: Frontend Skills', desc: 'HTML, CSS, JavaScript, React, 8 Frontend Projects' },
    { id: 6, title: 'Track 6: Backend Skills', desc: 'Node.js, SQL, PostgreSQL, APIs Design, NoSQL DBs, GraphQL' },
    { id: 7, title: 'Track 7: Data Engineering Skills', desc: 'Data Modeling, Data Pipelines, Warehouses, Spark, Airflow' },
    { id: 8, title: 'Track 8: AI Engineering', desc: '8.1 to 8.15: LLMs, Prompt & Context Eng, MCP, RAG, Agents' },
    { id: 9, title: 'Track 9: DevOps & Cloud Skills', desc: 'Docker, AWS, Terraform, CI/CD, Kubernetes, GCP, Azure' },
    { id: 10, title: 'Track 10: Production AI Systems', desc: 'Observability & Eval Pipelines, Security, MLOps lifecycle' },
    { id: 11, title: 'Track 11: Customer Delivery & Field Skills', desc: 'Discovery & Scoping, Business Acumen, Executive Writing' },
  ];

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-4xl mx-auto">
      <div className="pt-2">
        <span className="text-xs uppercase tracking-widest text-[#FF5500] font-semibold flex items-center gap-1.5 mb-1 font-sans">
          <BookOpen className="w-3.5 h-3.5" /> 4-Year Full Curriculum
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#F9F6EE]">
          Learn & Curriculum
        </h1>
        <p className="text-xs sm:text-sm text-[#A09D95] font-sans mt-0.5">
          12 comprehensive tracks from first-year basics to elite Forward Deployed Engineering
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-[#121212] border border-[#FF5500]/30 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#FF5500] shrink-0 mt-0.5" />
        <p className="text-xs text-[#A09D95] leading-relaxed">
          Stage 2 will seed the full curriculum strictly adhering to your Source of Truth (Part 3) with full subtopic checkboxes, resource links, video badges, notes, and coverage report.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TRACKS.map((t) => (
          <div
            key={t.id}
            className="p-4 rounded-2xl bg-[#121212] border border-[#FF5500]/25 hover:border-[#FF5500] flex items-start gap-3.5 transition-colors shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-black border border-[#FF5500]/40 flex items-center justify-center text-[#FF5500] shrink-0 font-serif font-bold text-sm">
              {t.id}
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#F9F6EE]">
                {t.title}
              </h3>
              <p className="text-xs text-[#A09D95] mt-1 font-sans line-clamp-2">
                {t.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
