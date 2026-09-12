"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Flame,
  XCircle,
  Clock,
  ArrowUpDown,
  BookOpen
} from "lucide-react";
import { api } from "@/lib/api";
import { getSeverityBadge, formatDate } from "@/lib/utils";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [analystName, setAnalystName] = useState("Surya (Analyst)");
  const [noteText, setNoteText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (severityFilter !== "ALL") params.severity = severityFilter;
      const data = await api.getAlerts(params);
      setAlerts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter, severityFilter]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedAlert) return;
    setActionLoading(true);
    try {
      const updated = await api.updateAlert(selectedAlert.id, {
        status: newStatus,
        assigned_analyst: analystName,
        notes: noteText || undefined
      });
      setSelectedAlert(updated);
      setNoteText("");
      await fetchAlerts();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (!selectedAlert) return;
    setActionLoading(true);
    try {
      const escalated = await api.escalateAlert(selectedAlert.id);
      setSelectedAlert(escalated);
      alert(`Alert escalated to Incident #${escalated.incident_id}!`);
      await fetchAlerts();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.detection_rule.toLowerCase().includes(q) ||
      (a.source_ip && a.source_ip.toLowerCase().includes(q)) ||
      (a.username && a.username.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <span>Alert Triage & Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Triaging inbound rule violations, evaluating attack signatures, and escalating verified compromises.
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 rounded-xl bg-soc-panel border border-soc-border flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, rule, IP, username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <span className="text-slate-400 font-medium">Status:</span>
          {["ALL", "New", "Investigating", "Escalated", "Resolved", "False Positive"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                statusFilter === st
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-soc-card text-slate-400 hover:text-slate-200 border border-soc-border"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Severity Filter */}
          <span className="text-slate-400 font-medium">Severity:</span>
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                severityFilter === sev
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-soc-card text-slate-400 hover:text-slate-200 border border-soc-border"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Alert Table + Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Alerts Table */}
        <div className={`rounded-xl bg-soc-panel border border-soc-border overflow-hidden ${selectedAlert ? "lg:col-span-7" : "lg:col-span-12"}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-soc-card/70 border-b border-soc-border text-[11px] text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Alert Title</th>
                  <th className="py-3 px-4">Detection Rule</th>
                  <th className="py-3 px-4">Source / Dest</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soc-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">Loading alerts from database...</td>
                  </tr>
                ) : filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">No matching alerts found.</td>
                  </tr>
                ) : (
                  filteredAlerts.map((a) => {
                    const badge = getSeverityBadge(a.severity);
                    const isSelected = selectedAlert?.id === a.id;
                    return (
                      <tr
                        key={a.id}
                        onClick={() => setSelectedAlert(a)}
                        className={`hover:bg-soc-hover cursor-pointer transition ${isSelected ? "bg-soc-card border-l-2 border-l-cyan-400" : ""}`}
                      >
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}>
                            {a.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-100 max-w-[200px] truncate">
                          {a.title}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono-code text-[11px] max-w-[150px] truncate">
                          {a.detection_rule}
                        </td>
                        <td className="py-3 px-4 font-mono-code text-slate-300 text-[11px]">
                          <div>{a.source_ip || a.source_host || "N/A"}</div>
                          <div className="text-[10px] text-slate-500">→ {a.destination_ip || a.destination_host || "N/A"}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono-code text-[11px] whitespace-nowrap">
                          {formatDate(a.timestamp)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            {a.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAlert(a);
                            }}
                            className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold transition"
                          >
                            Triage
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alert Triage Drawer (Right Column) */}
        {selectedAlert && (
          <div className="lg:col-span-5 rounded-xl bg-soc-panel border border-soc-border p-5 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-soc-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadge(selectedAlert.severity).bg}`}>
                      {selectedAlert.severity}
                    </span>
                    <span className="text-[11px] font-mono-code text-slate-400">ALERT #{selectedAlert.id}</span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-100 mt-1.5 leading-snug">
                    {selectedAlert.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-slate-400 hover:text-slate-200 text-sm p-1"
                >
                  ✕
                </button>
              </div>

              {/* Core Attributes */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded bg-soc-card border border-soc-border">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Detection Rule</div>
                  <div className="text-cyan-300 font-mono-code mt-0.5 truncate">{selectedAlert.detection_rule}</div>
                </div>
                <div className="p-2.5 rounded bg-soc-card border border-soc-border">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">MITRE Technique</div>
                  <div className="text-amber-300 font-mono-code mt-0.5 truncate">{selectedAlert.mitre_technique || "Unmapped"}</div>
                </div>
                <div className="p-2.5 rounded bg-soc-card border border-soc-border">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Source IP / Host</div>
                  <div className="text-slate-200 font-mono-code mt-0.5">{selectedAlert.source_ip || selectedAlert.source_host || "N/A"}</div>
                </div>
                <div className="p-2.5 rounded bg-soc-card border border-soc-border">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Target IP / Host</div>
                  <div className="text-slate-200 font-mono-code mt-0.5">{selectedAlert.destination_ip || selectedAlert.destination_host || "N/A"}</div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase">Alert Narrative</div>
                <div className="p-3 rounded bg-soc-card/70 border border-soc-border text-xs text-slate-300 leading-relaxed font-mono-code">
                  {selectedAlert.description}
                </div>
              </div>

              {/* Notes History */}
              {selectedAlert.notes && (
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Analyst Log</div>
                  <div className="p-2.5 rounded bg-slate-900 border border-soc-border text-xs text-slate-300 whitespace-pre-wrap font-mono-code">
                    {selectedAlert.notes}
                  </div>
                </div>
              )}

              {/* Add Note Input */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase">Add Investigation Note</div>
                <textarea
                  rows={2}
                  placeholder="Record initial findings, false positive justification, or escalation details..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full bg-soc-card border border-soc-border rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Analyst Action Toolbar */}
            <div className="pt-4 border-t border-soc-border space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Triage Action Decision</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleUpdateStatus("Investigating")}
                  disabled={actionLoading}
                  className="px-3 py-2 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Acknowledge / Investigate</span>
                </button>
                <button
                  onClick={handleEscalate}
                  disabled={actionLoading}
                  className="px-3 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Escalate to Incident</span>
                </button>
                <button
                  onClick={() => handleUpdateStatus("False Positive")}
                  disabled={actionLoading}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <XCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mark False Positive</span>
                </button>
                <button
                  onClick={() => handleUpdateStatus("Resolved")}
                  disabled={actionLoading}
                  className="px-3 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Resolve Alert</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
