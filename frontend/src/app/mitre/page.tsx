"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Shield,
  Search,
  ExternalLink,
  BookOpen,
  GraduationCap,
  ArrowRight
} from "lucide-react";
import { api } from "@/lib/api";

export default function MitrePage() {
  const [techniques, setTechniques] = useState<any[]>([]);
  const [selectedTech, setSelectedTech] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getMitreTechniques();
        setTechniques(data);
        if (data.length > 0) setSelectedTech(data[0]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = techniques.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.technique_id.toLowerCase().includes(q) ||
      t.tactic.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-400" />
            <span>MITRE ATT&CK® Defensive Framework</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Defensive taxonomy mapping enterprise tactics to telemetry detection rules, simulated labs, and response playbooks.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-xl bg-soc-panel border border-soc-border flex items-center gap-2 text-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by technique ID (T1110, T1059), name, or tactic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono-code focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Grid: Matrix Cards & Selected Technique Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Technique Cards */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[650px] overflow-y-auto pr-1">
          {filtered.map((t) => {
            const isSelected = selectedTech?.id === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTech(t)}
                className={`p-4 rounded-xl bg-soc-panel border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                  isSelected ? "border-purple-500 bg-soc-card shadow-lg" : "border-soc-border hover:border-slate-600"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono-code text-slate-400">
                    <span className="text-purple-400 font-bold">{t.technique_id}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold">
                      {t.tactic}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 mt-1 leading-snug">
                    {t.name}
                  </h3>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {t.description}
                </p>

                <div className="pt-2 border-t border-soc-border flex items-center justify-between text-[10px] font-mono-code text-slate-500">
                  <span>Audit: {t.data_sources?.split(",")[0]}</span>
                  <span className="text-cyan-400 font-semibold flex items-center gap-0.5">
                    Inspect <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Technique Details Inspector */}
        {selectedTech && (
          <div className="lg:col-span-6 rounded-xl bg-soc-panel border border-soc-border p-6 space-y-5">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-soc-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold font-mono-code bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    {selectedTech.technique_id}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Tactic: {selectedTech.tactic}
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-100 mt-2">
                  {selectedTech.name}
                </h2>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Technique Description</div>
              <div className="p-3.5 rounded-lg bg-soc-card border border-soc-border text-xs text-slate-300 leading-relaxed font-mono-code">
                {selectedTech.description}
              </div>
            </div>

            {/* Defensive Detection Approach */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Blue Team Detection Strategy</span>
              </div>
              <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 leading-relaxed font-mono-code">
                {selectedTech.detection_approach}
              </div>
            </div>

            {/* Data Sources */}
            <div className="p-3 rounded-lg bg-soc-card border border-soc-border flex items-center justify-between text-xs font-mono-code">
              <span className="text-slate-400">Required Telemetry Sources:</span>
              <span className="text-slate-200 font-bold">{selectedTech.data_sources}</span>
            </div>

            {/* Related Hands-on Lab and Playbooks */}
            <div className="pt-2 border-t border-soc-border flex flex-wrap items-center gap-3">
              <Link
                href="/labs"
                className="px-4 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Practice in Hands-On Lab</span>
              </Link>
              <Link
                href="/playbooks"
                className="px-4 py-2 rounded-lg bg-soc-card hover:bg-soc-hover border border-soc-border text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <BookOpen className="w-4 h-4" />
                <span>View Defensive Playbook</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
