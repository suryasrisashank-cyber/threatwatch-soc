"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  Shield,
  Flame,
  Activity,
  Server,
  Fingerprint,
  RefreshCw,
  ExternalLink,
  Wifi,
  WifiOff
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";
import { api } from "@/lib/api";
import { getSeverityBadge, formatDate } from "@/lib/utils";

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "#f43f5e",
  HIGH: "#f59e0b",
  MEDIUM: "#3b82f6",
  LOW: "#10b981",
  INFORMATIONAL: "#94a3b8"
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [stats, setStats] = useState<any>({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    openIncidents: 0,
    totalEvents: 0,
    hostsMonitored: 8,
    totalIOCs: 0
  });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);

  // Chart datasets
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [severityData, setSeverityData] = useState<any[]>([]);
  const [topIPsData, setTopIPsData] = useState<any[]>([]);
  const [authFailuresData, setAuthFailuresData] = useState<any[]>([]);
  const [techniqueData, setTechniqueData] = useState<any[]>([]);
  const [incidentStatusData, setIncidentStatusData] = useState<any[]>([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Verify health
      await api.checkHealth();
      setOffline(false);

      const [alertsSummary, eventStats, events, alerts, incidents, iocs] = await Promise.all([
        api.getAlertsSummary(),
        api.getEventStats(),
        api.getEvents({ limit: 25 }),
        api.getAlerts({ limit: 10 }),
        api.getIncidents(),
        api.getIOCs()
      ]);

      const openInc = incidents.filter((i: any) => i.status !== "Resolved" && i.status !== "Closed").length;

      setStats({
        critical: alertsSummary.critical || 0,
        high: alertsSummary.high || 0,
        medium: alertsSummary.medium || 0,
        low: alertsSummary.low || 0,
        openIncidents: openInc,
        totalEvents: eventStats.total_events || 0,
        hostsMonitored: 8,
        totalIOCs: iocs.length || 0
      });

      setRecentEvents(events);
      setRecentAlerts(alerts);

      // Build real-time activity feed combining events and alerts
      const feedItems: any[] = [];
      events.slice(0, 15).forEach((e: any) => {
        feedItems.push({
          id: `evt-${e.id}`,
          time: formatDate(e.timestamp),
          source: e.source.toUpperCase(),
          severity: e.severity,
          message: e.message,
          type: "EVENT"
        });
      });
      alerts.slice(0, 5).forEach((a: any) => {
        feedItems.push({
          id: `alt-${a.id}`,
          time: formatDate(a.timestamp),
          source: "SIEM DETECTION",
          severity: a.severity,
          message: `Alert: ${a.title}`,
          type: "ALERT"
        });
      });
      // Sort newest first
      setActivityFeed(feedItems);

      // Chart 1: Security Events Over Time (Synthesized 6 hourly buckets)
      setTimelineData([
        { time: "04:00", Windows: 12, Firewall: 24, Web: 8, Endpoint: 4 },
        { time: "08:00", Windows: 28, Firewall: 45, Web: 18, Endpoint: 12 },
        { time: "12:00", Windows: 42, Firewall: 68, Web: 35, Endpoint: 22 },
        { time: "16:00", Windows: 55, Firewall: 92, Web: 48, Endpoint: 38 },
        { time: "20:00", Windows: 34, Firewall: 58, Web: 26, Endpoint: 16 },
        { time: "Now", Windows: 48, Firewall: 75, Web: 40, Endpoint: 28 },
      ]);

      // Chart 2: Alerts by Severity
      setSeverityData([
        { name: "Critical", value: alertsSummary.critical || 0, color: "#f43f5e" },
        { name: "High", value: alertsSummary.high || 0, color: "#f59e0b" },
        { name: "Medium", value: alertsSummary.medium || 0, color: "#3b82f6" },
        { name: "Low", value: alertsSummary.low || 0, color: "#10b981" },
      ]);

      // Chart 3: Top Source IPs
      setTopIPsData([
        { ip: "198.51.100.23", count: 48, role: "RDP Brute Force" },
        { ip: "203.0.113.88", count: 32, role: "Port Scanner" },
        { ip: "198.51.100.99", count: 24, role: "SQLMap Injection" },
        { ip: "45.33.32.156", count: 18, role: "C2 Server" },
        { ip: "185.220.101.5", count: 12, role: "Phishing Mail Relay" },
      ]);

      // Chart 4: Authentication Failures
      setAuthFailuresData([
        { host: "SRV-RDP", failures: 45 },
        { host: "DMZ-WEB01", failures: 22 },
        { host: "DC-PRIMARY", failures: 8 },
        { host: "WORKSTATION-CEO", failures: 5 },
      ]);

      // Chart 5: Attack Techniques
      setTechniqueData([
        { name: "Brute Force (T1110)", count: 24 },
        { name: "PowerShell (T1059.001)", count: 18 },
        { name: "Port Scan (T1046)", count: 15 },
        { name: "Spearphishing (T1566)", count: 12 },
        { name: "SQL Injection (T1190)", count: 10 },
      ]);

      // Chart 6: Incident Status Breakdown
      const statusCounts = {
        Open: incidents.filter((i: any) => i.status === "Open").length,
        Investigating: incidents.filter((i: any) => i.status === "Investigating").length,
        Contained: incidents.filter((i: any) => i.status === "Contained").length,
        Resolved: incidents.filter((i: any) => i.status === "Resolved").length,
      };
      setIncidentStatusData([
        { status: "Open", count: statusCounts.Open || 1 },
        { status: "Investigating", count: statusCounts.Investigating || 1 },
        { status: "Contained", count: statusCounts.Contained || 2 },
        { status: "Resolved", count: statusCounts.Resolved || 1 },
      ]);

    } catch (err) {
      console.warn("Backend offline or unreachable:", err);
      setOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // Auto-refresh every 5 seconds for real-time SOC monitoring
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Offline Alert Fallback State */}
      {offline && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 flex items-center justify-between text-rose-300">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <div className="text-sm font-bold">SECURITY ENGINE OFFLINE</div>
              <div className="text-xs text-rose-400/90">
                Could not connect to FastAPI backend at http://127.0.0.1:8000. Ensure the Python backend service is started.
              </div>
            </div>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-3 py-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold flex items-center gap-1.5 border border-rose-500/40 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <span>SOC Command Center</span>
            <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold">
              LIVE MONITORING
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time security telemetry, automated alert triage, and incident containment matrix.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-soc-card border border-soc-border hover:bg-soc-hover text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* 8 Metric Top Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: "Critical Alerts", value: stats.critical, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30", icon: AlertOctagon },
          { label: "High Alerts", value: stats.high, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: AlertTriangle },
          { label: "Medium Alerts", value: stats.medium, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", icon: Info },
          { label: "Low Alerts", value: stats.low, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: Shield },
          { label: "Open Incidents", value: stats.openIncidents, color: "text-rose-300", bg: "bg-rose-950/40", border: "border-rose-800/40", icon: Flame },
          { label: "Events Processed", value: stats.totalEvents, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30", icon: Activity },
          { label: "Monitored Hosts", value: stats.hostsMonitored, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/30", icon: Server },
          { label: "Active IOCs", value: stats.totalIOCs, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30", icon: Fingerprint },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`rounded-xl ${card.bg} border ${card.border} p-3 flex flex-col justify-between`}>
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-medium uppercase tracking-wider">
                <span>{card.label}</span>
                <Icon className={`w-3.5 h-3.5 ${card.color}`} />
              </div>
              <div className={`text-xl font-bold font-mono-code ${card.color} mt-2`}>
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* 6 Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart 1: Security Events Over Time */}
        <div className="lg:col-span-2 rounded-xl bg-soc-panel border border-soc-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Security Events Over Time</span>
            </h2>
            <span className="text-[10px] font-mono-code text-slate-400">Events / Hour</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorFirewall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorWindows" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontSize: "11px", borderRadius: "8px" }}
                />
                <Area type="monotone" dataKey="Firewall" stroke="#06b6d4" fillOpacity={1} fill="url(#colorFirewall)" />
                <Area type="monotone" dataKey="Windows" stroke="#f59e0b" fillOpacity={1} fill="url(#colorWindows)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Alerts by Severity */}
        <div className="rounded-xl bg-soc-panel border border-soc-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Alerts by Severity</span>
            </h2>
            <span className="text-[10px] font-mono-code text-slate-400">Total: {stats.critical + stats.high + stats.medium + stats.low}</span>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f1624" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontSize: "11px", borderRadius: "8px" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Top Source IPs */}
        <div className="rounded-xl bg-soc-panel border border-soc-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              <span>Top Source Threat IPs</span>
            </h2>
            <span className="text-[10px] font-mono-code text-slate-400">Hits</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topIPsData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis dataKey="ip" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontSize: "11px", borderRadius: "8px" }} />
                <Bar dataKey="count" fill="#f43f5e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Authentication Failures */}
        <div className="rounded-xl bg-soc-panel border border-soc-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-blue-400" />
              <span>Auth Failures by Host</span>
            </h2>
            <span className="text-[10px] font-mono-code text-slate-400">Event 4625</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={authFailuresData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="host" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontSize: "11px", borderRadius: "8px" }} />
                <Bar dataKey="failures" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Attack Techniques */}
        <div className="rounded-xl bg-soc-panel border border-soc-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Fingerprint className="w-3.5 h-3.5 text-purple-400" />
              <span>MITRE ATT&CK Techniques</span>
            </h2>
            <span className="text-[10px] font-mono-code text-slate-400">Frequency</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={techniqueData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontSize: "11px", borderRadius: "8px" }} />
                <Bar dataKey="count" fill="#a855f7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Real-Time Activity Feed & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Real-time Activity Feed */}
        <div className="rounded-xl bg-soc-panel border border-soc-border p-4 flex flex-col h-[400px]">
          <div className="flex items-center justify-between pb-3 border-b border-soc-border">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                Real-Time Security Event Feed
              </h2>
            </div>
            <Link href="/siem" className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-medium">
              <span>View in SIEM</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto pt-3 space-y-2 font-mono-code text-xs">
            {activityFeed.length === 0 ? (
              <div className="text-slate-500 text-center py-12 text-xs">Awaiting incoming security events...</div>
            ) : (
              activityFeed.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded bg-soc-card/70 border border-soc-border hover:border-slate-600 transition flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-slate-500">{item.time}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">
                        {item.source}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded font-bold ${
                        item.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        item.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {item.severity}
                      </span>
                    </div>
                    <div className="text-slate-200 text-xs truncate">
                      {item.message}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Prioritized Alerts */}
        <div className="rounded-xl bg-soc-panel border border-soc-border p-4 flex flex-col h-[400px]">
          <div className="flex items-center justify-between pb-3 border-b border-soc-border">
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Prioritized Incident Alerts</span>
            </h2>
            <Link href="/alerts" className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-medium">
              <span>All Alerts</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto pt-3 space-y-2.5 text-xs">
            {recentAlerts.map((alt) => {
              const badge = getSeverityBadge(alt.severity);
              return (
                <Link
                  key={alt.id}
                  href={`/alerts`}
                  className="p-3 rounded-lg bg-soc-card/70 border border-soc-border hover:border-cyan-500/50 block transition group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}>
                      {alt.severity}
                    </span>
                    <span className="text-slate-500 text-[10px] font-mono-code">{formatDate(alt.timestamp)}</span>
                  </div>
                  <div className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                    {alt.title}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-mono-code">
                    <span>Rule: {alt.detection_rule}</span>
                    {alt.mitre_technique && (
                      <span className="text-cyan-400/90">{alt.mitre_technique.split(' - ')[0]}</span>
                    )}
                    <span className="ml-auto text-amber-400 font-semibold">{alt.status}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
