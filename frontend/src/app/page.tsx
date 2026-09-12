import Link from "next/link";
import {
  ShieldAlert,
  Terminal,
  Search,
  GraduationCap,
  Flame,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  FileText
} from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto space-y-10 py-4">
      {/* Hero Section */}
      <div className="relative rounded-2xl bg-gradient-to-b from-soc-panel to-soc-card border border-soc-border p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono-code font-semibold tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>BLUE TEAM & INCIDENT RESPONSE SIMULATOR</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            SentinelLab — <span className="text-cyan-400">SOC L1</span> Training Platform
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            A portfolio-ready, interactive cybersecurity home lab platform for students. Practice realistic alert triage, SIEM query analysis, IOC extraction, 7-stage incident response workflows, and 7 hands-on attack scenarios in an authorized safe sandbox.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <span>Launch Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/labs"
              className="px-5 py-2.5 rounded-lg bg-soc-panel hover:bg-soc-hover text-slate-200 border border-soc-border font-semibold text-sm flex items-center gap-2 transition-all"
            >
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>Explore 7 Learning Labs</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl bg-soc-panel border border-soc-border p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-100">Live Alert Triage</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Manage alerts across New, Investigating, Escalated, Resolved, and False Positive states. Correlate detection rules with MITRE ATT&CK techniques.
          </p>
          <Link href="/alerts" className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline pt-2 font-medium">
            Open Alerts <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="rounded-xl bg-soc-panel border border-soc-border p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Terminal className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-100">Simulated SIEM Explorer</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Analyze authentic Windows Event Logs, Linux Syslog, Firewall connection drops, DNS queries, and Apache/Nginx web logs with deep multi-field filtering.
          </p>
          <Link href="/siem" className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline pt-2 font-medium">
            Open SIEM <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="rounded-xl bg-soc-panel border border-soc-border p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Flame className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-100">7-Stage Incident Response</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Work through full NIST/SANS stages: Detection, Triage, Investigation, Containment, Eradication, Recovery, and Lessons Learned with automated report generation.
          </p>
          <Link href="/incidents" className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline pt-2 font-medium">
            View Incidents <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 7 Hands-on Labs Overview */}
      <div className="rounded-xl bg-soc-panel border border-soc-border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-100">7 Interactive Learning Labs</h2>
            <p className="text-xs text-slate-400">
              Each lab supports 3 modes: <span className="text-cyan-300 font-semibold">Beginner</span> (guided explanations), <span className="text-amber-300 font-semibold">Practice</span> (hands-on scenario), and <span className="text-rose-300 font-semibold">Assessment</span> (scored examination).
            </p>
          </div>
          <Link href="/labs" className="px-3 py-1.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/25 transition">
            View All Labs
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {[
            { num: "01", title: "Brute Force Detection", tag: "Identity", href: "/labs/1" },
            { num: "02", title: "Port Scan Reconnaissance", tag: "Network", href: "/labs/2" },
            { num: "03", title: "Suspicious PowerShell", tag: "Endpoint", href: "/labs/3" },
            { num: "04", title: "Phishing Header Analysis", tag: "Email", href: "/labs/4" },
            { num: "05", title: "Malware IOC Extraction", tag: "Threat Intel", href: "/labs/5" },
            { num: "06", title: "Web SQL Injection", tag: "AppSec", href: "/labs/6" },
            { num: "07", title: "DDoS Traffic Anomaly", tag: "Infrastructure", href: "/labs/7" },
          ].map((lab) => (
            <Link
              key={lab.num}
              href={lab.href}
              className="p-3.5 rounded-lg bg-soc-card border border-soc-border hover:border-cyan-500/50 hover:bg-soc-hover transition-all group"
            >
              <div className="flex items-center justify-between text-[11px] font-mono-code text-slate-500 mb-1.5">
                <span className="text-cyan-400 font-bold">LAB {lab.num}</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">{lab.tag}</span>
              </div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                {lab.title}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
