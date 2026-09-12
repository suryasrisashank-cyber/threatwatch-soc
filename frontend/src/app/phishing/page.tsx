"use client";

import { useState } from "react";
import {
  Mail,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  ShieldAlert,
  Search,
  ArrowRight
} from "lucide-react";

export default function PhishingPage() {
  const [showHeaders, setShowHeaders] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <Mail className="w-6 h-6 text-cyan-400" />
            <span>Phishing Email Triage & Header Analyzer</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspect suspicious inbound lures, evaluate SPF/DKIM verification results, and dissect weaponized attachment camouflage.
          </p>
        </div>
      </div>

      {/* Mock Mail Client Interface */}
      <div className="rounded-xl bg-soc-panel border border-soc-border overflow-hidden shadow-2xl">
        {/* Email Header Bar */}
        <div className="p-4 bg-soc-card border-b border-soc-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs font-mono-code text-slate-400 ml-2">Inbox &gt; Suspicious Flagged Queue &gt; Message #4490</span>
          </div>

          <button
            onClick={() => setShowHeaders(!showHeaders)}
            className="px-3 py-1 rounded bg-soc-panel hover:bg-soc-hover border border-soc-border text-xs font-semibold text-cyan-400 transition"
          >
            {showHeaders ? "Hide RFC 822 Headers" : "Inspect Raw Email Headers"}
          </button>
        </div>

        {/* Email Metadata Grid */}
        <div className="p-5 border-b border-soc-border space-y-2 text-xs font-mono-code">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 w-20">FROM:</span>
            <span className="text-slate-100 font-bold">&quot;ExampleBank Corporate Billing&quot; &lt;billing@examplebank-notice.com&gt;</span>
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
              ⚠️ Suspicious External Lure Domain
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500 w-20">TO:</span>
            <span className="text-slate-300">alex.executive@threatwatch.local</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500 w-20">DATE:</span>
            <span className="text-slate-400">September 12, 2026 at 09:12:30 AM UTC</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500 w-20">SUBJECT:</span>
            <span className="text-rose-400 font-bold">URGENT: Outstanding Overdue Invoice #INV-92842 - Immediate Wire Required</span>
          </div>
        </div>

        {/* Raw Header Drawer */}
        {showHeaders && (
          <div className="p-4 bg-slate-950 border-b border-soc-border font-mono-code text-xs text-slate-300 space-y-1.5 overflow-x-auto">
            <div className="text-cyan-400 font-bold text-[11px] uppercase mb-2">RFC 822 Gateway Audit Telemetry:</div>
            <div>Received: from mail-sender.bulletproof-host.xyz (185.220.101.5) by mail.threatwatch.local</div>
            <div>Return-Path: &lt;attacker-relay@185.220.101.5&gt;</div>
            <div className="text-rose-400 font-bold">
              Authentication-Results: spf=fail (sender IP 185.220.101.5 is not permitted by bankofamer1ca-notice.com); dkim=none
              Authentication-Results: spf=fail (sender IP 185.220.101.5 is not permitted by examplebank-notice.com); dkim=none
            </div>
            <div>Message-ID: &lt;202609120912.x9823h8f@examplebank-notice.com&gt;</div>
            <div>Content-Type: multipart/mixed; boundary=&quot;boundary_section_492&quot;</div>
          </div>
        )}

        {/* Email Body Content */}
        <div className="p-6 space-y-6 text-slate-200 text-sm leading-relaxed">
          <p>Dear Valued Client,</p>
          <p>
            Our accounts department has flagged an overdue balance of <strong>$48,920.00 USD</strong> associated with your enterprise merchant contract. Failure to submit remittance within 24 hours will result in legal escalation and suspension of active service credentials.
          </p>
          <p>
            Please inspect the attached billing verification breakdown and remit payment immediately via our encrypted portal:
          </p>

          <div className="p-3.5 rounded-lg bg-soc-card border border-soc-border inline-block text-xs font-mono-code text-cyan-300">
            Link: <span className="text-slate-400 hover:text-cyan-300 cursor-not-allowed">http://examplebank-notice.com/verify-account?token=928f</span>
          </div>

          <div className="p-4 rounded-xl bg-soc-card border border-soc-border flex items-center justify-between max-w-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200 font-mono-code">urgent_invoice_2026.pdf.exe</div>
                <div className="text-[10px] text-slate-500 font-mono-code">1.4 MB • Windows Executable Binary</div>
              </div>
            </div>

            <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
              Double Extension Deception (.pdf.exe)
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Sincerely,<br />
            ExampleBank Corporate Remittance Bureau
          </p>
        </div>
      </div>

      {/* Forensic Findings Matrix */}
      <div className="rounded-xl bg-soc-panel border border-soc-border p-5 space-y-3">
        <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>SOC L1 Phishing Indicator Checklist</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-soc-card border border-soc-border space-y-1">
            <div className="flex items-center gap-1.5 text-rose-400 font-bold">
              <XCircle className="w-4 h-4" />
              <span>SPF Authentication Fail</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Relay IP 185.220.101.5 is unauthorized to send mail for the claimed domain.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-soc-card border border-soc-border space-y-1">
            <div className="flex items-center gap-1.5 text-rose-400 font-bold">
              <XCircle className="w-4 h-4" />
              <span>Typosquatted Domain</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Domain &apos;bankofamer1ca-notice.com&apos; replaces &apos;i&apos; with digit &apos;1&apos; to deceive casual visual checks.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-soc-card border border-soc-border space-y-1">
            <div className="flex items-center gap-1.5 text-rose-400 font-bold">
              <XCircle className="w-4 h-4" />
              <span>Dangerous Attachment (.exe)</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Final extension is .exe; Windows ignores the fake .pdf prefix and executes binary code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
