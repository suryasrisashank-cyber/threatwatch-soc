"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  Terminal,
  Search,
  Network,
  Cpu,
  Mail,
  Fingerprint,
  Flame,
  GraduationCap,
  Layers,
  BookOpen,
  FileText,
  Settings,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Alerts", href: "/alerts", icon: ShieldAlert },
  { label: "SIEM", href: "/siem", icon: Terminal },
  { label: "Investigations", href: "/investigations", icon: Search },
  { label: "Network Analysis", href: "/network", icon: Network },
  { label: "Windows Security", href: "/windows", icon: Cpu },
  { label: "Phishing Analysis", href: "/phishing", icon: Mail },
  { label: "IOC Manager", href: "/iocs", icon: Fingerprint },
  { label: "Incident Response", href: "/incidents", icon: Flame },
  { label: "Learning Labs", href: "/labs", icon: GraduationCap },
  { label: "MITRE ATT&CK", href: "/mitre", icon: Layers },
  { label: "SOC Playbooks", href: "/playbooks", icon: BookOpen },
  { label: "Incident Reports", href: "/reports", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-soc-panel border-r border-soc-border flex flex-col h-screen fixed top-0 left-0 z-30 select-none">
      {/* Platform Branding */}
      <div className="p-4 border-b border-soc-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-100 tracking-wide text-sm font-mono-code">THREAT</span>
            <span className="text-cyan-400 font-bold text-sm tracking-wide font-mono-code">WATCH</span>
          </div>
          <p className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">SOC L1 Academy</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 group",
                isActive
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-soc-card/70 border border-transparent"
              )}
            >
              <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300")} />
              <span>{item.label}</span>
              {item.label === "Alerts" && (
                <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-mono-code bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  LIVE
                </span>
              )}
              {item.label === "Learning Labs" && (
                <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-mono-code bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  7 Labs
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Status & Safety Banner */}
      <div className="p-3 border-t border-soc-border bg-soc-card/40 space-y-2">
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-lab-beacon shadow-sm shadow-emerald-500/50" />
            <span className="text-emerald-400 font-bold text-[11px] tracking-wider font-mono-code">LAB ONLINE</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono-code">v1.0.0</span>
        </div>

        <div className="px-2 py-1.5 rounded bg-amber-500/10 border border-amber-500/25 flex items-center gap-2 text-amber-400 text-[10px] font-semibold tracking-wide">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span className="leading-tight">AUTHORIZED LAB ENVIRONMENT ONLY</span>
        </div>
      </div>
    </aside>
  );
}
