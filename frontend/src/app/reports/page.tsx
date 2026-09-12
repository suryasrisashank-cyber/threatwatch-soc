"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Printer,
  Download,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Flame,
  Fingerprint,
  Layers,
  Sparkles
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reps, incs] = await Promise.all([
        api.getReports(),
        api.getIncidents()
      ]);
      setReports(reps);
      setIncidents(incs);
      if (reps.length > 0) {
        setSelectedReport(reps[0]);
      }
      if (incs.length > 0) {
        setSelectedIncidentId(incs[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedIncidentId) return;
    setGenerating(true);
    try {
      const rep = await api.generateReport(selectedIncidentId);
      setSelectedReport(rep);
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    if (!selectedReport) return;
    const content = `
# ${selectedReport.title}
**Platform:** ThreatWatch — SOC L1 Incident Response Platform
**Classification:** Authorized Lab Security Audit • Internal Use Only
**Generated:** ${selectedReport.created_at}

## 1. Executive Summary
${selectedReport.executive_summary}

## 2. Technical Investigation Details
${selectedReport.technical_details}

## 3. Findings
${selectedReport.findings}

## 4. Remediation Actions Taken
${selectedReport.actions_taken}

## 5. Defensive Recommendations
${selectedReport.recommendations}

## 6. Incident Conclusion
${selectedReport.conclusion}
    `;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `incident-report-${selectedReport.incident_id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Parse JSON sections safely
  let assets: any[] = [];
  let timeline: any[] = [];
  let iocs: any[] = [];
  let mitre: string[] = [];
  try {
    assets = JSON.parse(selectedReport?.affected_assets_json || "[]");
    timeline = JSON.parse(selectedReport?.timeline_json || "[]");
    iocs = JSON.parse(selectedReport?.iocs_json || "[]");
    mitre = JSON.parse(selectedReport?.mitre_mapping_json || "[]");
  } catch (e) {}

  return (
    <div className="space-y-6">
      {/* Header (Hidden during Print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            <span>Incident Report Generator</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated executive and technical post-incident debrief reports formatted for portfolio demonstration.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadMarkdown}
            className="px-3 py-1.5 rounded-lg bg-soc-card border border-soc-border hover:bg-soc-hover text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Markdown</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Report Generator Controls Bar (Hidden in Print) */}
      <div className="print:hidden p-4 rounded-xl bg-soc-panel border border-soc-border flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-medium">Generate Report for Incident:</span>
          <select
            value={selectedIncidentId || ""}
            onChange={(e) => setSelectedIncidentId(Number(e.target.value))}
            className="bg-soc-card border border-soc-border rounded-lg px-3 py-1.5 text-xs text-slate-100 font-semibold focus:outline-none focus:border-cyan-500"
          >
            {incidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                INC-{inc.id}: {inc.title}
              </option>
            ))}
          </select>
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="px-4 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{generating ? "Compiling Report..." : "Generate New Report"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">View Stored Report:</span>
          <select
            value={selectedReport?.id || ""}
            onChange={(e) => {
              const r = reports.find((x) => x.id === Number(e.target.value));
              if (r) setSelectedReport(r);
            }}
            className="bg-soc-card border border-soc-border rounded-lg px-3 py-1.5 text-xs text-slate-100 font-semibold focus:outline-none focus:border-cyan-500"
          >
            {reports.map((rep) => (
              <option key={rep.id} value={rep.id}>
                REP-{rep.id}: {rep.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clean Formal Printable Report Document Canvas */}
      {selectedReport && (
        <div className="rounded-2xl bg-soc-panel border border-soc-border p-8 sm:p-12 space-y-8 shadow-2xl print:bg-white print:text-black print:p-0 print:border-none print:shadow-none font-mono-code text-xs">
          {/* Formal Letterhead */}
          <div className="flex items-center justify-between pb-6 border-b border-soc-border print:border-gray-300">
            <div>
              <div className="text-lg font-black tracking-tight text-slate-100 print:text-black">
                THREATWATCH BLUE TEAM SOC
              </div>
              <div className="text-[11px] text-cyan-400 print:text-gray-600 uppercase font-semibold">
                Formal Cyber Incident Investigation & Containment Report
              </div>
            </div>

            <div className="text-right text-[11px] text-slate-400 print:text-gray-500 space-y-0.5">
              <div>REPORT ID: SL-IR-{selectedReport.id.toString().padStart(4, "0")}</div>
              <div>DATE: {formatDate(selectedReport.created_at)}</div>
              <div className="text-emerald-400 print:text-green-700 font-bold">STATUS: CONTAINED & RESOLVED</div>
            </div>
          </div>

          {/* Title and Classification */}
          <div>
            <div className="text-[10px] text-amber-400 print:text-amber-700 font-bold uppercase tracking-wider">
              AUTHORIZED LAB SECURITY AUDIT • CONFIDENTIAL BLUE TEAM MEMO
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 print:text-black mt-1">
              {selectedReport.title}
            </h1>
          </div>

          {/* 1. Executive Summary */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-cyan-400 print:text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>1.0 Executive Summary</span>
            </h2>
            <div className="p-4 rounded-xl bg-soc-card print:bg-gray-50 border border-soc-border print:border-gray-200 text-slate-200 print:text-gray-800 leading-relaxed text-xs">
              {selectedReport.executive_summary}
            </div>
          </div>

          {/* 2. Technical Details & Affected Assets */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-cyan-400 print:text-blue-700 uppercase tracking-wider">
              2.0 Technical Attack Vector Analysis
            </h2>
            <p className="text-slate-300 print:text-gray-700 leading-relaxed text-xs">
              {selectedReport.technical_details}
            </p>

            {assets.length > 0 && (
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left border border-soc-border print:border-gray-300 text-xs">
                  <thead className="bg-soc-card print:bg-gray-100 font-bold text-[10px] uppercase text-slate-400 print:text-gray-600">
                    <tr>
                      <th className="p-2.5">Asset Category</th>
                      <th className="p-2.5">Target Identifier</th>
                      <th className="p-2.5">Remediation Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-soc-border print:divide-gray-200">
                    {assets.map((ast: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-2.5 text-slate-300 print:text-gray-800">{ast.type}</td>
                        <td className="p-2.5 font-bold text-cyan-300 print:text-black">{ast.identifier}</td>
                        <td className="p-2.5 text-emerald-400 print:text-green-700 font-bold">{ast.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 3. Indicators of Compromise Extracted */}
          {iocs.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-cyan-400 print:text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5" />
                <span>3.0 Documented Indicators of Compromise (IOCs)</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border border-soc-border print:border-gray-300 text-xs">
                  <thead className="bg-soc-card print:bg-gray-100 font-bold text-[10px] uppercase text-slate-400 print:text-gray-600">
                    <tr>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Indicator Value</th>
                      <th className="p-2.5">Confidence</th>
                      <th className="p-2.5">Telemetry Origin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-soc-border print:divide-gray-200">
                    {iocs.map((ioc: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-2.5 text-purple-400 print:text-purple-700 font-bold">{ioc.type}</td>
                        <td className="p-2.5 font-bold text-slate-200 print:text-black select-all">{ioc.value}</td>
                        <td className="p-2.5 text-slate-400 print:text-gray-600">{ioc.confidence}</td>
                        <td className="p-2.5 text-slate-400 print:text-gray-600">{ioc.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. Attack Timeline */}
          {timeline.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-cyan-400 print:text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>4.0 Incident Event Chronology</span>
              </h2>
              <div className="p-4 rounded-xl bg-soc-card print:bg-gray-50 border border-soc-border print:border-gray-200 space-y-2 text-xs">
                {timeline.map((step: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-slate-500 print:text-gray-500 w-36 shrink-0">{step.timestamp}</span>
                    <span className="font-bold text-cyan-400 print:text-blue-800 w-24 shrink-0">[{step.stage || "ACTION"}]</span>
                    <span className="text-slate-200 print:text-gray-800">{step.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Findings & Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-cyan-400 print:text-blue-700 uppercase tracking-wider">
                5.0 Investigation Findings
              </h2>
              <div className="p-4 rounded-xl bg-soc-card print:bg-gray-50 border border-soc-border print:border-gray-200 text-slate-300 print:text-gray-800 leading-relaxed text-xs">
                {selectedReport.findings}
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xs font-bold text-cyan-400 print:text-blue-700 uppercase tracking-wider">
                6.0 Containment Actions Taken
              </h2>
              <div className="p-4 rounded-xl bg-soc-card print:bg-gray-50 border border-soc-border print:border-gray-200 text-slate-300 print:text-gray-800 leading-relaxed text-xs">
                {selectedReport.actions_taken}
              </div>
            </div>
          </div>

          {/* 7. Remediation Recommendations */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-cyan-400 print:text-blue-700 uppercase tracking-wider">
              7.0 Defensive Hardening & Remediation Recommendations
            </h2>
            <div className="p-4 rounded-xl bg-soc-card print:bg-gray-50 border border-soc-border print:border-gray-200 text-slate-300 print:text-gray-800 whitespace-pre-line leading-relaxed text-xs">
              {selectedReport.recommendations}
            </div>
          </div>

          {/* 8. Conclusion & Sign-off */}
          <div className="space-y-2 pt-4 border-t border-soc-border print:border-gray-300">
            <h2 className="text-xs font-bold text-cyan-400 print:text-blue-700 uppercase tracking-wider">
              8.0 Incident Conclusion
            </h2>
            <p className="text-slate-300 print:text-gray-800 leading-relaxed text-xs">
              {selectedReport.conclusion}
            </p>

            <div className="pt-8 flex items-center justify-between text-[11px] text-slate-500 print:text-gray-500">
              <div>
                Lead Blue Team Analyst: <strong className="text-slate-200 print:text-black">Surya (SOC L1)</strong>
              </div>
              <div>
                Platform Verification: <strong className="text-cyan-400 print:text-blue-800">ThreatWatch Educational Enclave</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
