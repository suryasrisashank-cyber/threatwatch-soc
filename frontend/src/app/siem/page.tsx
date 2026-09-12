"use client";

import { useState, useEffect } from "react";
import {
  Terminal,
  Search,
  Filter,
  RefreshCw,
  Copy,
  Check,
  Code2,
  Calendar,
  Layers,
  ChevronRight
} from "lucide-react";
import { api } from "@/lib/api";
import { getSeverityBadge, formatDate } from "@/lib/utils";

export default function SiemPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("ALL");
  const [severity, setSeverity] = useState("ALL");
  const [username, setUsername] = useState("");
  const [sourceIp, setSourceIp] = useState("");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (search) params.search = search;
      if (source !== "ALL") params.source = source;
      if (severity !== "ALL") params.severity = severity;
      if (username) params.username = username;
      if (sourceIp) params.source_ip = sourceIp;

      const data = await api.getEvents(params);
      setEvents(data);
      if (data.length > 0 && !selectedEvent) {
        setSelectedEvent(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [source, severity]);

  const handleCopyRaw = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <Terminal className="w-6 h-6 text-cyan-400" />
            <span>Simulated SIEM Log Explorer</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Query across enterprise Windows Security Event Logs, Firewall traffic, DNS lookups, and Web access logs.
          </p>
        </div>

        <button
          onClick={fetchEvents}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-soc-card border border-soc-border hover:bg-soc-hover text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Execute Query</span>
        </button>
      </div>

      {/* Query Bar */}
      <div className="p-4 rounded-xl bg-soc-panel border border-soc-border space-y-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search keyword in syslog message, process, or raw log (e.g. 'EventID 4625', 'UNION SELECT', 'powershell')..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchEvents()}
              className="w-full bg-soc-card border border-soc-border rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 font-mono-code focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            onClick={fetchEvents}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition text-xs"
          >
            Search
          </button>
        </div>

        {/* Source Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-slate-400 font-medium">Log Source:</span>
          {["ALL", "Windows", "Firewall", "DNS", "Web Server", "Authentication", "Endpoint"].map((s) => (
            <button
              key={s}
              onClick={() => setSource(s)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                source === s
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-soc-card text-slate-400 hover:text-slate-200 border border-soc-border"
              }`}
            >
              {s}
            </button>
          ))}

          <span className="text-slate-400 font-medium ml-3">Severity:</span>
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW", "INFORMATIONAL"].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverity(sev)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                severity === sev
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-soc-card text-slate-400 hover:text-slate-200 border border-soc-border"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Event Grid & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Log Grid */}
        <div className="lg:col-span-7 rounded-xl bg-soc-panel border border-soc-border flex flex-col h-[650px] overflow-hidden">
          <div className="p-3 border-b border-soc-border bg-soc-card/50 flex items-center justify-between text-xs text-slate-400 font-mono-code">
            <span>SHOWING {events.length} LOG EVENTS</span>
            <span>SORT: DESC (NEWEST FIRST)</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-soc-border font-mono-code text-xs">
            {loading ? (
              <div className="p-12 text-center text-slate-500">Querying simulated SIEM index...</div>
            ) : events.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No events matched query filter.</div>
            ) : (
              events.map((evt) => {
                const badge = getSeverityBadge(evt.severity);
                const isSelected = selectedEvent?.id === evt.id;
                return (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className={`p-3 hover:bg-soc-hover cursor-pointer transition flex items-start justify-between gap-3 ${
                      isSelected ? "bg-soc-card border-l-4 border-l-cyan-400" : ""
                    }`}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-slate-500">{formatDate(evt.timestamp)}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                          {evt.source}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded font-bold border ${badge.bg}`}>
                          {evt.severity}
                        </span>
                        <span className="text-slate-400 font-semibold">{evt.event_type}</span>
                      </div>
                      <div className="text-slate-200 text-xs truncate">
                        {evt.message}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        <span>SRC: {evt.source_ip || evt.source_host || "N/A"}</span>
                        <span>DST: {evt.destination_ip || evt.destination_host || "N/A"}</span>
                        {evt.username && <span className="text-cyan-400">USER: {evt.username}</span>}
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-600 mt-1 shrink-0 ${isSelected ? "text-cyan-400" : ""}`} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Event Detail Inspector */}
        <div className="lg:col-span-5 rounded-xl bg-soc-panel border border-soc-border p-5 flex flex-col h-[650px] overflow-y-auto space-y-4">
          {selectedEvent ? (
            <>
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-soc-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadge(selectedEvent.severity).bg}`}>
                      {selectedEvent.severity}
                    </span>
                    <span className="text-xs font-mono-code text-cyan-400 font-bold">{selectedEvent.source} EVENT</span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-100 mt-1 font-mono-code">
                    {selectedEvent.event_type}
                  </h2>
                </div>
                <span className="text-[11px] font-mono-code text-slate-500">{formatDate(selectedEvent.timestamp)}</span>
              </div>

              {/* Parsed Fields Table */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase">Parsed Log Schema</div>
                <div className="rounded-lg bg-soc-card border border-soc-border overflow-hidden text-xs font-mono-code divide-y divide-soc-border">
                  <div className="p-2.5 flex justify-between">
                    <span className="text-slate-500">Event ID</span>
                    <span className="text-slate-200 font-bold">{selectedEvent.id}</span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span className="text-slate-500">Source IP</span>
                    <span className="text-cyan-300 font-bold">{selectedEvent.source_ip || "None"}</span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span className="text-slate-500">Target IP</span>
                    <span className="text-slate-200 font-bold">{selectedEvent.destination_ip || "None"}</span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span className="text-slate-500">Source Host</span>
                    <span className="text-slate-300">{selectedEvent.source_host || "None"}</span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span className="text-slate-500">Target Host</span>
                    <span className="text-slate-300">{selectedEvent.destination_host || "None"}</span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span className="text-slate-500">User Identity</span>
                    <span className="text-amber-300 font-bold">{selectedEvent.username || "None"}</span>
                  </div>
                  {selectedEvent.process && (
                    <div className="p-2.5 flex flex-col gap-1">
                      <span className="text-slate-500">Process Path</span>
                      <span className="text-rose-300 text-[11px] break-all">{selectedEvent.process}</span>
                    </div>
                  )}
                  {selectedEvent.mitre_technique && (
                    <div className="p-2.5 flex justify-between">
                      <span className="text-slate-500">MITRE Technique</span>
                      <span className="text-purple-400 font-bold">{selectedEvent.mitre_technique}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Message Summary */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase">Normalized Event Message</div>
                <div className="p-3 rounded-lg bg-soc-card border border-soc-border text-xs text-slate-200 font-mono-code leading-relaxed">
                  {selectedEvent.message}
                </div>
              </div>

              {/* Raw Syslog / Windows XML Log */}
              <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Raw Event Payload</span>
                  </span>
                  <button
                    onClick={() => handleCopyRaw(selectedEvent.raw_log)}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied" : "Copy Raw Log"}</span>
                  </button>
                </div>
                <pre className="flex-1 p-3 rounded-lg bg-slate-950 border border-soc-border text-[11px] text-slate-300 font-mono-code overflow-x-auto whitespace-pre-wrap select-all leading-normal">
                  {selectedEvent.raw_log}
                </pre>
              </div>
            </>
          ) : (
            <div className="text-center py-24 text-slate-500 text-xs">
              Select an event from the left explorer to inspect detailed payload telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
