"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  RotateCcw,
  Play,
  Pause,
  Square,
  Zap,
  Server,
  Database,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [health, setHealth] = useState<any | null>(null);
  const [simStatus, setSimStatus] = useState<any | null>(null);
  const [difficulty, setDifficulty] = useState("BEGINNER");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const loadData = async () => {
    try {
      const [h, s] = await Promise.all([
        api.checkHealth(),
        api.getSimulationStatus()
      ]);
      setHealth(h);
      setSimStatus(s);
      if (s?.difficulty) setDifficulty(s.difficulty);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    setLoading(true);
    try {
      await api.startSimulation(difficulty);
      setMsg("Live simulation activated.");
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    setLoading(true);
    try {
      await api.pauseSimulation();
      setMsg("Simulation paused.");
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await api.stopSimulation();
      setMsg("Simulation stopped.");
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInjectSingle = async () => {
    setLoading(true);
    try {
      await api.generateSingleEvent();
      setMsg("Injected single synthetic security event into pipeline.");
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("This will erase current test state and restore 100+ pristine synthetic events, alerts, incidents, and labs. Proceed?")) return;
    setLoading(true);
    try {
      await api.resetSimulation();
      setMsg("Demo environment re-seeded successfully.");
      await loadData();
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-400" />
          <span>ThreatWatch Platform Settings & Controls</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure real-time simulation speeds, inject synthetic attacks, audit database health, and reset sandbox data.
        </p>
      </div>

      {msg && (
        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* Real-time Attack Simulation Controls */}
      <div className="rounded-2xl bg-soc-panel border border-soc-border p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-soc-border">
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Security Event Stream Simulator</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Generates benign and malicious event telemetry to test rule triggers and alert workflows.
            </p>
          </div>

          <span className={`px-2.5 py-1 rounded text-xs font-mono-code font-bold ${
            simStatus?.is_running && !simStatus?.is_paused ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" :
            simStatus?.is_paused ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" :
            "bg-slate-800 text-slate-400 border border-slate-700"
          }`}>
            {simStatus?.is_running ? (simStatus?.is_paused ? "STATUS: PAUSED" : "STATUS: RUNNING") : "STATUS: STOPPED"}
          </span>
        </div>

        {/* Difficulty Selector */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-300">Simulation Velocity & Difficulty:</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "BEGINNER", label: "Beginner (6.0s delay)", desc: "Slow stream for steady analysis" },
              { id: "INTERMEDIATE", label: "Intermediate (3.5s delay)", desc: "Moderate SOC triage pace" },
              { id: "ADVANCED", label: "Advanced (1.8s delay)", desc: "Fast-paced alert barrage" },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDifficulty(d.id)}
                className={`p-3 rounded-xl border text-left transition ${
                  difficulty === d.id
                    ? "bg-cyan-500/15 border-cyan-500 text-cyan-300 font-bold"
                    : "bg-soc-card border-soc-border text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="text-xs font-bold">{d.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleStart}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Simulation</span>
          </button>

          <button
            onClick={handlePause}
            disabled={loading || !simStatus?.is_running}
            className="px-4 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
            <span>Pause Stream</span>
          </button>

          <button
            onClick={handleStop}
            disabled={loading || !simStatus?.is_running}
            className="px-4 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop Stream</span>
          </button>

          <button
            onClick={handleInjectSingle}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-soc-card hover:bg-soc-hover border border-soc-border text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition ml-auto"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Inject Single Event</span>
          </button>
        </div>
      </div>

      {/* Reset Demo Environment */}
      <div className="rounded-2xl bg-soc-panel border border-soc-border p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Reset Demo Sandbox Environment</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Restores database to default state with 100+ events, 20+ alerts, 5 incidents, and 7 pristine labs.
            </p>
          </div>

          <button
            onClick={handleReset}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Environment</span>
          </button>
        </div>
      </div>

      {/* System Health Audit */}
      <div className="rounded-2xl bg-soc-panel border border-soc-border p-6 space-y-4 shadow-xl text-xs font-mono-code">
        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <span>Backend Security Engine Health Status</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-soc-card border border-soc-border">
            <div className="text-[10px] text-slate-500">ENGINE STATUS</div>
            <div className="text-emerald-400 font-bold text-sm mt-0.5">{health?.status?.toUpperCase() || "UNKNOWN"}</div>
          </div>
          <div className="p-3 rounded-lg bg-soc-card border border-soc-border">
            <div className="text-[10px] text-slate-500">DATABASE LAYER</div>
            <div className="text-cyan-400 font-bold text-sm mt-0.5">{health?.database?.toUpperCase() || "SQLITE"}</div>
          </div>
          <div className="p-3 rounded-lg bg-soc-card border border-soc-border">
            <div className="text-[10px] text-slate-500">TOTAL EVENTS INDEXED</div>
            <div className="text-slate-100 font-bold text-sm mt-0.5">{health?.events_count || 0}</div>
          </div>
          <div className="p-3 rounded-lg bg-soc-card border border-soc-border">
            <div className="text-[10px] text-slate-500">ALERTS TRIGGERED</div>
            <div className="text-amber-400 font-bold text-sm mt-0.5">{health?.alerts_count || 0}</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{health?.lab_status || "AUTHORIZED LAB ENVIRONMENT ONLY"} • Localhost Sandbox</span>
        </div>
      </div>
    </div>
  );
}
