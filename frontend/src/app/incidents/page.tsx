"use client";

import { useState, useEffect } from "react";
import {
  Flame,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Plus,
  Lock,
  RotateCcw,
  FileText
} from "lucide-react";
import { api } from "@/lib/api";
import { getSeverityBadge, formatDate } from "@/lib/utils";

const STAGES = [
  "1. Detection",
  "2. Triage",
  "3. Investigation",
  "4. Containment",
  "5. Eradication",
  "6. Recovery",
  "7. Lessons Learned"
];

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const data = await api.getIncidents();
      setIncidents(data);
      if (data.length > 0 && !selectedIncident) {
        setSelectedIncident(data[0]);
      } else if (selectedIncident) {
        const updated = data.find((i: any) => i.id === selectedIncident.id);
        if (updated) setSelectedIncident(updated);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleAdvanceStage = async () => {
    if (!selectedIncident) return;
    const currentIndex = STAGES.findIndex((s) => s.toLowerCase().includes(selectedIncident.stage.toLowerCase()));
    if (currentIndex < STAGES.length - 1) {
      const nextStageName = STAGES[currentIndex + 1].split(". ")[1];
      setActionLoading(true);
      try {
        await api.updateIncident(selectedIncident.id, { stage: nextStageName });
        await api.addTimelineEntry(selectedIncident.id, {
          action: `Incident stage transitioned to ${nextStageName}`,
          stage: nextStageName,
          analyst: "Surya (Analyst)"
        });
        await fetchIncidents();
      } catch (e) {
        console.error(e);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleTriggerAction = async (actionText: string) => {
    if (!selectedIncident) return;
    setActionLoading(true);
    try {
      let currentActions: string[] = [];
      try {
        currentActions = JSON.parse(selectedIncident.actions_json || "[]");
      } catch (e) {}
      if (!currentActions.includes(actionText)) {
        currentActions.push(actionText);
      }
      await api.updateIncident(selectedIncident.id, { actions_json: JSON.stringify(currentActions) });
      await api.addTimelineEntry(selectedIncident.id, {
        action: `Containment action executed: ${actionText}`,
        stage: selectedIncident.stage,
        analyst: "Surya (Analyst)"
      });
      await fetchIncidents();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  let timeline: any[] = [];
  let actionsList: string[] = [];
  try {
    timeline = JSON.parse(selectedIncident?.timeline_json || "[]");
    actionsList = JSON.parse(selectedIncident?.actions_json || "[]");
  } catch (e) {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-rose-500" />
            <span>7-Stage Incident Response Workflow</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured NIST SP 800-61 / SANS blue team incident lifecycle management.
          </p>
        </div>
      </div>

      {/* Main Grid: Incident List & Active Incident Lifecycle */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Incidents List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active Enterprise Incidents ({incidents.length})
          </div>

          <div className="space-y-2.5">
            {incidents.map((inc) => {
              const badge = getSeverityBadge(inc.severity);
              const isSelected = selectedIncident?.id === inc.id;
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-4 rounded-xl bg-soc-panel border cursor-pointer transition ${
                    isSelected ? "border-cyan-500 bg-soc-card shadow-lg" : "border-soc-border hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}>
                      {inc.severity}
                    </span>
                    <span className="text-[10px] font-mono-code text-cyan-400 font-bold">
                      Stage: {inc.stage}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-100 leading-snug">
                    INC-{inc.id}: {inc.title}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 font-mono-code">
                    <span>Host: {inc.affected_host || "N/A"}</span>
                    <span className="text-amber-400 font-semibold">{inc.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: 7-Stage Incident Lifecycle & Actions */}
        {selectedIncident && (
          <div className="lg:col-span-8 rounded-xl bg-soc-panel border border-soc-border p-6 space-y-6">
            {/* Top Details */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-soc-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadge(selectedIncident.severity).bg}`}>
                    {selectedIncident.severity}
                  </span>
                  <span className="text-xs font-mono-code text-slate-400 font-semibold">INCIDENT #{selectedIncident.id}</span>
                </div>
                <h2 className="text-base font-bold text-slate-100 mt-1">
                  {selectedIncident.title}
                </h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {selectedIncident.summary}
                </p>
              </div>

              <button
                onClick={handleAdvanceStage}
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition"
              >
                <span>Advance Stage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 7-Stage Visual Step Progress Bar */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">NIST SP 800-61 Lifecycle Stages</div>
              <div className="grid grid-cols-7 gap-1">
                {STAGES.map((st, i) => {
                  const stageKeyword = st.split(". ")[1].toLowerCase();
                  const currentKeyword = selectedIncident.stage.toLowerCase();
                  const isCurrent = currentKeyword.includes(stageKeyword);
                  const isPassed = i < STAGES.findIndex((s) => s.toLowerCase().includes(currentKeyword));
                  return (
                    <div
                      key={st}
                      className={`p-2 rounded text-center border text-[10px] font-bold font-mono-code ${
                        isCurrent
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500"
                          : isPassed
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-soc-card text-slate-600 border-soc-border"
                      }`}
                    >
                      {st}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Simulated Containment Action Buttons */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Simulated Containment & Eradication Controls</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleTriggerAction(`Isolate Endpoint (${selectedIncident.affected_host})`)}
                  disabled={actionLoading}
                  className="p-3 rounded-lg bg-soc-card border border-soc-border hover:border-rose-500 text-left transition space-y-1 group"
                >
                  <div className="text-xs font-bold text-slate-200 group-hover:text-rose-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                    <span>Isolate Host via EDR</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono-code">Sever endpoint TCP/IP stack</div>
                </button>

                <button
                  onClick={() => handleTriggerAction("Apply Perimeter Firewall Drop Rule")}
                  disabled={actionLoading}
                  className="p-3 rounded-lg bg-soc-card border border-soc-border hover:border-amber-500 text-left transition space-y-1 group"
                >
                  <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Block Attacker IP</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono-code">Edge WAN boundary drop</div>
                </button>

                <button
                  onClick={() => handleTriggerAction(`Revoke AD Kerberos Tickets & Reset Password (${selectedIncident.affected_user || 'user'})`)}
                  disabled={actionLoading}
                  className="p-3 rounded-lg bg-soc-card border border-soc-border hover:border-cyan-500 text-left transition space-y-1 group"
                >
                  <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Reset User Credentials</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono-code">Revoke Active Directory sessions</div>
                </button>
              </div>
            </div>

            {/* Actions Taken Log */}
            {actionsList.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase">Containment Actions Applied</div>
                <div className="p-3 rounded-lg bg-soc-card border border-soc-border space-y-1 font-mono-code text-xs">
                  {actionsList.map((act, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline Audit Trail */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Incident Timeline & Audit Trail</div>
              <div className="p-3.5 rounded-lg bg-slate-950 border border-soc-border space-y-2.5 font-mono-code text-xs max-h-48 overflow-y-auto">
                {timeline.map((t, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-slate-300">
                    <span className="text-slate-500 text-[11px] shrink-0">{t.timestamp}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 text-[10px]">{t.stage || "Action"}</span>
                    <span className="text-slate-200">{t.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
