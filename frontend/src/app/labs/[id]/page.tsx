"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Shield,
  FileText,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import { api } from "@/lib/api";

export default function LabDetailPage() {
  const params = useParams();
  const router = useRouter();
  const labId = params?.id as string;

  const [lab, setLab] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"BEGINNER" | "PRACTICE" | "ASSESSMENT">("BEGINNER");
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getLab(labId);
        setLab(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (labId) load();
  }, [labId]);

  const handleRevealHint = (index: number) => {
    if (!revealedHints.includes(index)) {
      setRevealedHints([...revealedHints, index]);
      setHintsUsed(hintsUsed + 1);
    }
  };

  const handleAnswerChange = (questionId: string, val: string) => {
    setUserAnswers({ ...userAnswers, [questionId]: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const evaluation = await api.submitLab(labId, {
        mode,
        answers: userAnswers,
        hints_used: hintsUsed
      });
      setResult(evaluation);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetLab = () => {
    setUserAnswers({});
    setHintsUsed(0);
    setRevealedHints([]);
    setResult(null);
  };

  if (loading) {
    return <div className="text-center py-24 text-slate-400 font-mono-code text-xs">Loading laboratory scenario...</div>;
  }

  if (!lab) {
    return <div className="text-center py-24 text-rose-400 font-mono-code text-xs">Lab scenario not found.</div>;
  }

  let objectives: string[] = [];
  let evidence: any[] = [];
  let questions: any[] = [];
  let hints: string[] = [];
  try {
    objectives = JSON.parse(lab.learning_objectives_json || "[]");
    evidence = JSON.parse(lab.evidence_json || "[]");
    questions = JSON.parse(lab.questions_json || "[]");
    hints = JSON.parse(lab.hints_json || "[]");
  } catch (e) {}

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Navigation & Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/labs"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 font-medium transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Labs Catalog</span>
        </Link>

        {/* 3 Learning Modes Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-soc-panel border border-soc-border">
          <span className="text-[11px] text-slate-400 font-medium px-2">Mode:</span>
          {(["BEGINNER", "PRACTICE", "ASSESSMENT"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                handleResetLab();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                mode === m
                  ? m === "BEGINNER"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : m === "PRACTICE"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Description Banner */}
      <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
        mode === "BEGINNER" ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300" :
        mode === "PRACTICE" ? "bg-amber-500/10 border-amber-500/30 text-amber-300" :
        "bg-rose-500/10 border-rose-500/30 text-rose-300"
      }`}>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 shrink-0" />
          <span>
            {mode === "BEGINNER" && "BEGINNER MODE: Concepts and background mechanics are explained directly in each question."}
            {mode === "PRACTICE" && "PRACTICE MODE: Real-world scenario. Hints are accessible if you get stuck."}
            {mode === "ASSESSMENT" && "ASSESSMENT MODE: Formal blue-team examination. Answers & explanations revealed after grading."}
          </span>
        </div>
        <span className="text-[10px] font-mono-code font-bold uppercase">{mode}</span>
      </div>

      {/* Lab Header & Scenario */}
      <div className="rounded-2xl bg-soc-panel border border-soc-border p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full font-mono-code text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            LAB {lab.lab_number.toString().padStart(2, "0")} • {lab.category}
          </span>
          <span className="text-xs font-semibold text-slate-400">{lab.difficulty} Difficulty</span>
        </div>

        <h1 className="text-2xl font-black text-slate-100 tracking-tight">
          {lab.title}
        </h1>

        <div className="p-4 rounded-xl bg-soc-card border border-soc-border text-xs text-slate-300 leading-relaxed font-mono-code whitespace-pre-wrap">
          {lab.scenario}
        </div>

        {/* Objectives */}
        {objectives.length > 0 && (
          <div className="space-y-1.5 pt-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Learning Objectives:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
              {objectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Forensic Evidence Panel */}
      <div className="rounded-2xl bg-soc-panel border border-soc-border p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Forensic Evidence Telemetry</span>
          </h2>
          <span className="text-[11px] font-mono-code text-slate-500">Exhibit Artifacts</span>
        </div>

        <div className="rounded-xl bg-slate-950 border border-soc-border p-4 font-mono-code text-xs text-slate-300 overflow-x-auto max-h-72 overflow-y-auto">
          <pre className="leading-relaxed select-all">
            {JSON.stringify(evidence, null, 2)}
          </pre>
        </div>
      </div>

      {/* Hints Drawer */}
      {hints.length > 0 && mode !== "ASSESSMENT" && (
        <div className="rounded-2xl bg-soc-panel border border-soc-border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Investigation Hints ({hints.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono-code">{hintsUsed} hints unlocked</span>
          </div>

          <div className="space-y-2">
            {hints.map((hint, idx) => {
              const isRevealed = revealedHints.includes(idx);
              return (
                <div key={idx} className="p-3 rounded-lg bg-soc-card border border-soc-border text-xs">
                  {isRevealed ? (
                    <div className="text-amber-300 font-mono-code">{hint}</div>
                  ) : (
                    <button
                      onClick={() => handleRevealHint(idx)}
                      className="text-slate-400 hover:text-amber-300 transition text-xs font-semibold flex items-center gap-1.5"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Unlock Hint #{idx + 1}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Challenge Questions Form */}
      {!result ? (
        <form onSubmit={handleSubmit} className="rounded-2xl bg-soc-panel border border-soc-border p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-soc-border">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Analyst Investigation Questions ({questions.length})
            </h2>
            <span className="text-xs font-mono-code text-cyan-400">Total: 100 Points</span>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-4 rounded-xl bg-soc-card border border-soc-border space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-xs font-bold text-slate-100 leading-snug">
                    <span className="text-cyan-400 mr-2">Q{idx + 1}.</span>
                    {q.question}
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono-code text-slate-400 shrink-0">
                    {q.points} pts
                  </span>
                </div>

                {q.type === "choice" && q.options ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt: string) => (
                      <label
                        key={opt}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition flex items-center gap-2.5 ${
                          userAnswers[q.id] === opt
                            ? "bg-cyan-500/15 border-cyan-500 text-cyan-300 font-bold"
                            : "bg-soc-panel border-soc-border text-slate-300 hover:border-slate-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={userAnswers[q.id] === opt}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          className="text-cyan-500 focus:ring-cyan-500"
                        />
                        <span className="font-mono-code">{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Enter your investigation answer..."
                    value={userAnswers[q.id] || ""}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    className="w-full bg-soc-panel border border-soc-border rounded-lg px-3 py-2 text-xs text-slate-100 font-mono-code placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-soc-border flex items-center justify-between">
            <div className="text-xs text-slate-500 font-mono-code">
              Mode: <span className="text-slate-300 font-bold">{mode}</span>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-cyan-500/20"
            >
              <span>{submitting ? "Evaluating..." : "Submit Lab Answers for Grading"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        /* Evaluation Results Card */
        <div className="rounded-2xl bg-soc-panel border border-soc-border p-6 space-y-6 shadow-2xl">
          {/* Top Score Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-soc-border">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl font-mono-code ${
                result.score >= 85 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" :
                result.score >= 70 ? "bg-blue-500/20 text-blue-400 border border-blue-500/40" :
                "bg-amber-500/20 text-amber-400 border border-amber-500/40"
              }`}>
                {result.score}
              </div>
              <div>
                <div className="text-xs font-mono-code text-slate-400 uppercase font-semibold">Laboratory Assessment Score</div>
                <div className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <span>Rating: {result.tier}</span>
                  <span className="text-xs font-mono-code text-slate-400">({result.correct_count}/{result.total_questions} Correct)</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleResetLab}
              className="px-4 py-2 rounded-lg bg-soc-card hover:bg-soc-hover border border-soc-border text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Lab</span>
            </button>
          </div>

          {/* Question Breakdown and Explanations */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Detailed Question Breakdown & Forensic Explanations
            </div>

            <div className="space-y-3 font-mono-code text-xs">
              {result.questions_breakdown?.map((q: any, i: number) => (
                <div
                  key={q.question_id}
                  className={`p-4 rounded-xl border space-y-2 ${
                    q.is_correct
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-rose-500/10 border-rose-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-200 flex items-center gap-2">
                      {q.is_correct ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                      <span>Q{i + 1}: {q.question_text}</span>
                    </div>
                    <span className="font-bold text-slate-300">{q.points_earned} / {q.max_points} pts</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-slate-500">Your Answer: </span>
                      <span className={q.is_correct ? "text-emerald-300 font-bold" : "text-rose-300 font-bold"}>
                        {q.user_answer || "(Empty)"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Accepted Answer: </span>
                      <span className="text-slate-200 font-bold">
                        {Array.isArray(q.accepted_answers) ? q.accepted_answers.join(" / ") : q.accepted_answers}
                      </span>
                    </div>
                  </div>

                  {q.explanation && (
                    <div className="p-2.5 rounded bg-slate-950/70 text-slate-300 text-[11px] leading-relaxed pt-2">
                      <strong className="text-cyan-400">Forensic Explanation: </strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Next Lab Recommendation */}
          <div className="pt-4 border-t border-soc-border flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Recommended Next Practice: <span className="text-cyan-400 font-bold">Lab {result.recommended_next_lab}</span>
            </div>
            <Link
              href={`/labs/${result.recommended_next_lab}`}
              onClick={handleResetLab}
              className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <span>Proceed to Next Lab</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
