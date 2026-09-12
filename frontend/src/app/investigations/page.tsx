"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ArrowRight,
  ShieldAlert,
  Activity,
  User,
  Server,
  Network,
  Fingerprint,
  Layers,
  Flame,
  Clock,
  Plus,
  Save,
  CheckCircle2
} from "lucide-react";
import { api } from "@/lib/api";

export default function InvestigationsPage() {
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [selectedInv, setSelectedInv] = useState<any | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getInvestigations();
        setInvestigations(data);
        if (data.length > 0) {
          setSelectedInv(data[0]);
          setNotes(data[0].notes || "");
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const handleSelect = (inv: any) => {
    setSelectedInv(inv);
    setNotes(inv.notes || "");
  };

  const handleSaveNotes = async () => {
    if (!selectedInv) return;
    setSaving(true);
    try {
      await api.updateInvestigation(selectedInv.id, { notes });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // Parse nodes and edges
  let nodes: any[] = [];
  let timeline: any[] = [];
  try {
    nodes = JSON.parse(selectedInv?.nodes_json || "[]");
    timeline = JSON.parse(selectedInv?.timeline_json || "[]");
  } catch (e) {
    // fallback
  }

  const getNodeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "ALERT": return ShieldAlert;
      case "EVENT": return Activity;
      case "USER": return User;
      case "HOST": return Server;
      case "IP": return Network;
      case "IOC": return Fingerprint;
      case "MITRE": return Layers;
      case "INCIDENT": return Flame;
      default: return Search;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <Search className="w-6 h-6 text-purple-400" />
            <span>Visual Investigation Workspace</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Trace entities, correlate alerts with artifacts, and reconstruct end-to-end attack timelines.
          </p>
        </div>

        {/* Case selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Case:</span>
          <select
            value={selectedInv?.id || ""}
            onChange={(e) => {
              const found = investigations.find((i) => i.id === Number(e.target.value));
              if (found) handleSelect(found);
            }}
            className="bg-soc-card border border-soc-border rounded-lg px-3 py-1.5 text-xs text-slate-100 font-semibold focus:outline-none focus:border-cyan-500"
          >
            {investigations.map((inv) => (
              <option key={inv.id} value={inv.id}>
                INV-{inv.id}: {inv.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Correlation Chain Diagram */}
      <div className="rounded-xl bg-soc-panel border border-soc-border p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Entity Correlation Chain (Alert → Event → User → Host → IP → IOC → MITRE → Incident)</span>
          </div>
          <span className="text-[11px] font-mono-code text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
            {nodes.length} CORRELATED ENTITIES
          </span>
        </div>

        {/* Dynamic Nodes Visual Flow */}
        <div className="p-4 rounded-xl bg-soc-card/60 border border-soc-border overflow-x-auto">
          <div className="flex items-center justify-between min-w-[900px] gap-2 py-3">
            {nodes.map((n, idx) => {
              const Icon = getNodeIcon(n.type);
              return (
                <div key={n.id} className="flex items-center gap-2 flex-1">
                  <div className="rounded-xl bg-soc-panel border border-soc-border hover:border-cyan-500/60 p-3.5 flex flex-col items-center text-center w-full transition-all group shadow-md">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 mb-2 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {n.type}
                    </span>
                    <span className="text-xs font-bold text-slate-200 mt-1 line-clamp-1 max-w-[120px] font-mono-code" title={n.label}>
                      {n.label.split(": ")[1] || n.label}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded mt-1.5 uppercase ${
                      n.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' :
                      n.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {n.severity || "INFO"}
                    </span>
                  </div>
                  {idx < nodes.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Column Section: Chronological Timeline & Analyst Notebook */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Visual Attack Timeline */}
        <div className="lg:col-span-7 rounded-xl bg-soc-panel border border-soc-border p-5 space-y-4">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Chronological Attack Execution Timeline</span>
          </h2>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-soc-border">
            {timeline.length === 0 ? (
              <div className="text-xs text-slate-500 py-6">No timeline events recorded yet.</div>
            ) : (
              timeline.map((step: any, index: number) => (
                <div key={index} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-soc-panel border-2 border-cyan-400 group-hover:scale-125 transition-transform" />
                  <div className="p-3 rounded-lg bg-soc-card border border-soc-border hover:border-slate-600 transition space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200 font-mono-code">{step.event}</span>
                      <span className="text-[11px] font-mono-code text-cyan-400">{step.time}</span>
                    </div>
                    <div className="text-xs text-slate-400 leading-relaxed font-mono-code">
                      {step.detail}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Analyst Case Notes */}
        <div className="lg:col-span-5 rounded-xl bg-soc-panel border border-soc-border p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Analyst Evidence Notebook
              </h2>
              {saved && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              Record forensic hypotheses, timeline notes, evidence artifacts, and containment rationales.
            </p>

            <textarea
              rows={12}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Document IOCs found, lateral movement observations, and containment steps..."
              className="w-full flex-1 bg-soc-card border border-soc-border rounded-lg p-3 text-xs text-slate-200 font-mono-code focus:outline-none focus:border-cyan-500 leading-relaxed resize-none"
            />
          </div>

          <button
            onClick={handleSaveNotes}
            disabled={saving}
            className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Notes..." : "Save Investigation Findings"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
