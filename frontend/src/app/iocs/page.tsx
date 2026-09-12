"use client";

import { useState, useEffect } from "react";
import {
  Fingerprint,
  Plus,
  Search,
  Trash2,
  ExternalLink,
  Shield,
  Layers,
  Filter,
  CheckCircle2
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function IOCsPage() {
  const [iocs, setIocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);

  // New IOC Form state
  const [newValue, setNewValue] = useState("");
  const [newType, setNewType] = useState("IP");
  const [newConfidence, setNewConfidence] = useState(90);
  const [newSource, setNewSource] = useState("Manual Analyst Submission");
  const [newNotes, setNewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchIOCs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (typeFilter !== "ALL") params.ioc_type = typeFilter;
      if (search) params.search = search;
      const data = await api.getIOCs(params);
      setIocs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIOCs();
  }, [typeFilter]);

  const handleAddIOC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue) return;
    setSubmitting(true);
    try {
      await api.createIOC({
        value: newValue.trim(),
        ioc_type: newType,
        confidence: Number(newConfidence),
        source: newSource,
        notes: newNotes
      });
      setShowAddModal(false);
      setNewValue("");
      setNewNotes("");
      await fetchIOCs();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteIOC = async (id: number) => {
    if (!confirm("Remove this indicator from ThreatWatch threat intel database?")) return;
    try {
      await api.deleteIOC(id);
      await fetchIOCs();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = iocs.filter((i) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return i.value.toLowerCase().includes(q) || (i.notes && i.notes.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <Fingerprint className="w-6 h-6 text-purple-400" />
            <span>Indicators of Compromise (IOC) Manager</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Document and catalog suspicious IP addresses, C2 domains, hashes, malicious attachments, and compromised user identities.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-cyan-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Threat Indicator</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-soc-panel border border-soc-border flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search indicator by value, hash, domain, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono-code focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-medium mr-1">Type:</span>
          {["ALL", "IP", "Domain", "URL", "Hash", "Filename", "Email", "Username"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                typeFilter === t
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                  : "bg-soc-card text-slate-400 hover:text-slate-200 border border-soc-border"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* IOC Table */}
      <div className="rounded-xl bg-soc-panel border border-soc-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-code">
            <thead className="bg-soc-card/70 border-b border-soc-border text-[11px] text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Indicator Value</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Origin / Source</th>
                <th className="py-3 px-4">Context Notes</th>
                <th className="py-3 px-4">First Observed</th>
                <th className="py-3 px-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soc-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">Loading indicators...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">No indicators match criteria.</td>
                </tr>
              ) : (
                filtered.map((ioc) => (
                  <tr key={ioc.id} className="hover:bg-soc-hover transition">
                    <td className="py-3 px-4 font-bold text-slate-100 max-w-[240px] truncate select-all">
                      {ioc.value}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                        {ioc.ioc_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ioc.confidence >= 90 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                        ioc.confidence >= 75 ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" :
                        "bg-slate-800 text-slate-400"
                      }`}>
                        {ioc.confidence}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">{ioc.source}</td>
                    <td className="py-3 px-4 text-slate-300 max-w-[200px] truncate">{ioc.notes || "—"}</td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">{formatDate(ioc.first_seen)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteIOC(ioc.id)}
                        className="p-1.5 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                        title="Delete Indicator"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Indicator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl bg-soc-panel border border-soc-border p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-soc-border">
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-cyan-400" />
                <span>Document Indicator of Compromise</span>
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddIOC} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Indicator Value</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 45.33.32.156, bad-domain.com, or hash"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full bg-soc-card border border-soc-border rounded-lg p-2.5 text-xs text-slate-100 font-mono-code focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Indicator Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-soc-card border border-soc-border rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-semibold"
                  >
                    {["IP", "Domain", "URL", "Hash", "Filename", "Email", "Username"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Confidence (%)</label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={newConfidence}
                    onChange={(e) => setNewConfidence(Number(e.target.value))}
                    className="w-full bg-soc-card border border-soc-border rounded-lg p-2.5 text-xs text-slate-100 font-mono-code focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Context / Threat Intel Notes</label>
                <textarea
                  rows={3}
                  placeholder="Observed in PowerShell download cradle on WORKSTATION-CEO..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-soc-card border border-soc-border rounded-lg p-2.5 text-xs text-slate-100 font-mono-code focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-soc-card hover:bg-soc-hover text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{submitting ? "Saving..." : "Add IOC"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
