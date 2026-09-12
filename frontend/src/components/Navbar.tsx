"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Play,
  Pause,
  Square,
  RotateCcw,
  Shield,
  Radio,
  User,
  Activity
} from "lucide-react";
import { api } from "@/lib/api";

export default function Navbar({ onSimulationUpdate }: { onSimulationUpdate?: () => void }) {
  const [simStatus, setSimStatus] = useState<any>({ is_running: false, is_paused: false, difficulty: "BEGINNER" });
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const status = await api.getSimulationStatus();
      setSimStatus(status);
    } catch (e) {
      // Backend may be warming up
    }
  };

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleStart = async () => {
    setLoading(true);
    try {
      await api.startSimulation(simStatus.difficulty || "BEGINNER");
      await fetchStatus();
      if (onSimulationUpdate) onSimulationUpdate();
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
      await fetchStatus();
      if (onSimulationUpdate) onSimulationUpdate();
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
      await fetchStatus();
      if (onSimulationUpdate) onSimulationUpdate();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset the demo environment and re-seed all default SOC events?")) {
      return;
    }
    setLoading(true);
    try {
      await api.resetSimulation();
      await fetchStatus();
      if (onSimulationUpdate) onSimulationUpdate();
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="h-14 border-b border-soc-border bg-soc-panel/90 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Search & Scope */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-soc-card border border-soc-border text-xs text-slate-300">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-200">Enclave:</span>
          <span className="text-cyan-300 font-mono-code">SOC-DEFENSE-ALPHA</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] font-semibold text-amber-300 tracking-wider">
          <span>AUTHORIZED LAB ENVIRONMENT ONLY</span>
        </div>
      </div>

      {/* Right: Simulation Controls & User Profile */}
      <div className="flex items-center gap-3">
        {/* Simulation Controls Toolbar */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-soc-card border border-soc-border">
          <div className="flex items-center gap-1.5 mr-2">
            <Radio className={`w-3.5 h-3.5 ${simStatus.is_running && !simStatus.is_paused ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="text-[11px] font-mono-code font-semibold text-slate-300">
              {simStatus.is_running ? (simStatus.is_paused ? "SIM PAUSED" : "SIM ACTIVE") : "SIM STOPPED"}
            </span>
          </div>

          {!simStatus.is_running || simStatus.is_paused ? (
            <button
              onClick={handleStart}
              disabled={loading}
              title="Start Live Event Simulation"
              className="p-1.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition text-xs flex items-center gap-1 font-medium"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="text-[10px]">Start</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              disabled={loading}
              title="Pause Simulation"
              className="p-1.5 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 transition text-xs flex items-center gap-1 font-medium"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span className="text-[10px]">Pause</span>
            </button>
          )}

          {simStatus.is_running && (
            <button
              onClick={handleStop}
              disabled={loading}
              title="Stop Simulation"
              className="p-1.5 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition text-xs flex items-center gap-1 font-medium"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span className="text-[10px]">Stop</span>
            </button>
          )}

          <button
            onClick={handleReset}
            disabled={loading}
            title="Reset Environment & Seed Default Data"
            className="p-1.5 rounded bg-slate-700/40 hover:bg-slate-700 text-slate-300 border border-slate-600/50 transition text-xs flex items-center gap-1 font-medium ml-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[10px]">Reset Data</span>
          </button>
        </div>

        {/* Analyst Profile Indicator */}
        <div className="flex items-center gap-2 pl-2 border-l border-soc-border">
          <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-xs font-bold">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-200">Surya (Analyst)</div>
            <div className="text-[10px] text-cyan-400 font-mono-code leading-none">Tier 1 SOC Ready</div>
          </div>
        </div>
      </div>
    </header>
  );
}
