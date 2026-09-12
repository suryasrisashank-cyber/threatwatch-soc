"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  CheckSquare,
  Shield,
  Clock,
  AlertTriangle,
  Flame,
  FileCheck,
  ChevronRight
} from "lucide-react";
import { api } from "@/lib/api";

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [selectedPlaybook, setSelectedPlaybook] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getPlaybooks();
        setPlaybooks(data);
        if (data.length > 0) setSelectedPlaybook(data[0]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  let steps: string[] = [];
  let checklist: string[] = [];
  try {
    steps = JSON.parse(selectedPlaybook?.steps_json || "[]");
    checklist = JSON.parse(selectedPlaybook?.evidence_checklist_json || "[]");
  } catch (e) {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            <span>Defensive SOC Standard Operating Procedures (Playbooks)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Procedural triage checklists, evidence collection workflows, escalation criteria, and containment recommendations.
          </p>
        </div>
      </div>

      {/* Grid: Playbook Selector & Active Playbook Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Playbook List */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Blue Team Playbooks ({playbooks.length})
          </div>

          {playbooks.map((pb) => {
            const isSelected = selectedPlaybook?.id === pb.id;
            return (
              <div
                key={pb.id}
                onClick={() => setSelectedPlaybook(pb)}
                className={`p-4 rounded-xl bg-soc-panel border cursor-pointer transition flex items-center justify-between ${
                  isSelected ? "border-cyan-500 bg-soc-card shadow-lg" : "border-soc-border hover:border-slate-600"
                }`}
              >
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono-code bg-slate-800 text-cyan-400 border border-slate-700">
                    {pb.category}
                  </span>
                  <h3 className="text-xs font-bold text-slate-200 mt-1.5 leading-snug">
                    {pb.title}
                  </h3>
                </div>
                <ChevronRight className={`w-4 h-4 text-slate-600 shrink-0 ${isSelected ? "text-cyan-400" : ""}`} />
              </div>
            );
          })}
        </div>

        {/* Right Column: Full Playbook Specification */}
        {selectedPlaybook && (
          <div className="lg:col-span-8 rounded-xl bg-soc-panel border border-soc-border p-6 space-y-6 shadow-xl">
            {/* Playbook Header */}
            <div className="pb-4 border-b border-soc-border">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold font-mono-code bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                CATEGORY: {selectedPlaybook.category.toUpperCase()}
              </span>
              <h2 className="text-xl font-black text-slate-100 mt-2">
                {selectedPlaybook.title}
              </h2>
            </div>

            {/* Trigger Condition & Initial Validation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-code">
              <div className="p-3.5 rounded-xl bg-soc-card border border-soc-border space-y-1">
                <div className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Alert Trigger Condition</span>
                </div>
                <div className="text-slate-300 text-xs leading-relaxed">
                  {selectedPlaybook.trigger_condition}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-soc-card border border-soc-border space-y-1">
                <div className="text-[10px] font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Initial Validation Rule</span>
                </div>
                <div className="text-slate-300 text-xs leading-relaxed">
                  {selectedPlaybook.initial_validation}
                </div>
              </div>
            </div>

            {/* Step-by-Step Procedure */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Step-by-Step Investigation Procedure</span>
              </div>

              <div className="space-y-2 font-mono-code text-xs">
                {steps.map((step, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-soc-card/70 border border-soc-border text-slate-200 leading-relaxed flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded bg-cyan-500/15 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence Checklist & Escalation Criteria */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-code">
              <div className="p-4 rounded-xl bg-soc-card border border-soc-border space-y-2">
                <div className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Evidence To Collect</span>
                </div>
                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                  {checklist.map((c, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-soc-card border border-soc-border space-y-2">
                <div className="text-[10px] font-bold text-rose-400 uppercase flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Escalation Criteria</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {selectedPlaybook.escalation_criteria}
                </p>
              </div>
            </div>

            {/* Containment Recommendations */}
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-1.5 font-mono-code text-xs">
              <div className="text-[10px] font-bold text-rose-400 uppercase">Containment Recommendations</div>
              <p className="text-slate-200 leading-relaxed">
                {selectedPlaybook.containment_actions}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
