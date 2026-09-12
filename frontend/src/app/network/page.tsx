"use client";

import { useState, useEffect } from "react";
import {
  Network,
  Shield,
  Activity,
  Filter,
  Flame,
  ArrowRight,
  Radio
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function NetworkPage() {
  const [networkLogs, setNetworkLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getEvents({ source: "Firewall", limit: 30 });
        setNetworkLogs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const portDistribution = [
    { port: "Port 21 (FTP)", drops: 18 },
    { port: "Port 22 (SSH)", drops: 35 },
    { port: "Port 80 (HTTP)", drops: 85 },
    { port: "Port 443 (HTTPS)", drops: 42 },
    { port: "Port 3389 (RDP)", drops: 64 },
    { port: "Port 445 (SMB)", drops: 29 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <Network className="w-6 h-6 text-cyan-400" />
            <span>Network Traffic & Reconnaissance Analysis</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Perimeter firewall drop telemetry, vertical/horizontal port scan tracking, and SYN flood rate metrics.
          </p>
        </div>
      </div>

      {/* Top Network Telemetry Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-4 rounded-xl bg-soc-panel border border-soc-border space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase">Reconnaissance Scanners</span>
            <Shield className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono-code text-rose-400">3 Active Sources</div>
          <div className="text-[11px] text-slate-400 font-mono-code">203.0.113.88 • 198.51.100.23 • 185.190.140.22</div>
        </div>

        <div className="p-4 rounded-xl bg-soc-panel border border-soc-border space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase">Firewall Packet Drop Rate</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono-code text-amber-400">142 Drops / min</div>
          <div className="text-[11px] text-slate-400 font-mono-code">Default Deny Inbound WAN Rule</div>
        </div>

        <div className="p-4 rounded-xl bg-soc-panel border border-soc-border space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase">Edge Gateway Flood Anomaly</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono-code text-cyan-400">Normal (Nominal)</div>
          <div className="text-[11px] text-slate-400 font-mono-code">SYN Cookies Active • Latency 14ms</div>
        </div>
      </div>

      {/* Scanned Port Distribution Chart */}
      <div className="rounded-xl bg-soc-panel border border-soc-border p-5 space-y-3">
        <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Firewall Packet Drops by Targeted Port</span>
        </h2>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={portDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="port" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontSize: "11px", borderRadius: "8px" }} />
              <Bar dataKey="drops" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real-Time Firewall Drop Logs Table */}
      <div className="rounded-xl bg-soc-panel border border-soc-border p-5 space-y-3">
        <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-rose-400" />
          <span>Inbound Perimeter Firewall Reject Telemetry</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-code">
            <thead className="bg-soc-card/70 border-b border-soc-border text-[11px] text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Attacker Origin IP</th>
                <th className="py-2.5 px-3">Target Subnet</th>
                <th className="py-2.5 px-3">Protocol</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Raw Packet Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soc-border">
              {networkLogs.map((log) => (
                <tr key={log.id} className="hover:bg-soc-hover transition">
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{formatDate(log.timestamp)}</td>
                  <td className="py-2.5 px-3 text-rose-300 font-bold">{log.source_ip || "203.0.113.88"}</td>
                  <td className="py-2.5 px-3 text-slate-300">{log.destination_ip || "192.168.1.10"}</td>
                  <td className="py-2.5 px-3 text-cyan-300 font-semibold">TCP / SYN</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                      DROP
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px] max-w-xs truncate">
                    {log.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
