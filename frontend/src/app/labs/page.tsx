"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Trophy,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Award,
  Zap
} from "lucide-react";
import { api } from "@/lib/api";

export default function LabsIndexPage() {
  const [labs, setLabs] = useState<any[]>([]);
  const [progress, setProgress] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [labsData, progData] = await Promise.all([
          api.getLabs(),
          api.getLabProgress()
        ]);
        setLabs(labsData);
        setProgress(progData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-400" />
            <span>SOC L1 Hands-On Learning Labs</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            7 real-world attack detection and triage challenges. Solve questions, extract IOCs, and achieve SOC L1 readiness.
          </p>
        </div>
      </div>

      {/* Progress & Skill Scorecard Card */}
      {progress && (
        <div className="rounded-2xl bg-gradient-to-r from-soc-panel to-soc-card border border-soc-border p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-soc-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-mono-code text-slate-400 uppercase font-semibold">Overall Mastery Rating</div>
                <div className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <span>{progress.overall_tier}</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono-code bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Avg Score: {progress.average_score}/100
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono-code text-slate-400">Completed Labs</div>
              <div className="text-lg font-bold font-mono-code text-cyan-400">
                {progress.completed_count} / {progress.total_labs} Labs Completed ({progress.completion_percentage}%)
              </div>
            </div>
          </div>

          {/* 10 Skill Competencies Bar Grid */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              <span>Blue Team Skill Proficiency Matrix</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
              {Object.entries(progress.skills || {}).map(([skill, val]: [string, any]) => (
                <div key={skill} className="p-3 rounded-lg bg-soc-card/70 border border-soc-border space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-medium truncate">{skill}</span>
                    <span className="font-mono-code font-bold text-cyan-400">{val}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7 Learning Labs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {labs.map((lab) => {
          let objectives: string[] = [];
          try {
            objectives = JSON.parse(lab.learning_objectives_json || "[]");
          } catch (e) {}

          return (
            <div
              key={lab.id}
              className="rounded-xl bg-soc-panel border border-soc-border hover:border-cyan-500/50 transition flex flex-col justify-between p-5 space-y-4 shadow-lg group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded font-mono-code text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    LAB {lab.lab_number.toString().padStart(2, "0")}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    lab.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {lab.difficulty}
                  </span>
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors leading-snug">
                    {lab.title.split(" — ")[1] || lab.title}
                  </h2>
                  <p className="text-[11px] text-cyan-400 font-mono-code mt-0.5">
                    Category: {lab.category}
                  </p>
                </div>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {lab.scenario}
                </p>

                {objectives.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-soc-border">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Core Skills Taught:</div>
                    <ul className="text-[11px] text-slate-300 space-y-0.5">
                      {objectives.slice(0, 2).map((obj, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 truncate">
                          <span className="text-cyan-400">•</span>
                          <span className="truncate">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-soc-border flex items-center justify-between">
                <div className="text-[10px] text-slate-500 font-mono-code">
                  3 Modes Available
                </div>
                <Link
                  href={`/labs/${lab.id}`}
                  className="px-4 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <span>Start Investigation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
