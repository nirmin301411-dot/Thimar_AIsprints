import { useState, useRef } from "react";
import {
  Brain, ShieldCheck, TrendingUp, Mic, MicOff,
  AlertTriangle, BarChart3, FileText,
  Sparkles, RefreshCw, CheckCircle2, Loader2,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  classifyInvestor, rankDeals, explainDeal, narratePortfolio,
  transcribeVoice, rewriteText, scoreDeal, detectAnomalies, chatWithAI
} from "../api/ai";

type Tab = "profiler" | "scorer" | "ranker" | "explainer" | "narrator" | "voice" | "anomaly";

const tabs: { id: Tab; label: string; icon: typeof Brain; color: string }[] = [
  { id: "profiler", label: "Risk Profiler", icon: ShieldCheck, color: "#8b5cf6" },
  { id: "scorer", label: "Deal Scorer", icon: TrendingUp, color: "#10b981" },
  { id: "ranker", label: "Deal Ranker", icon: BarChart3, color: "#06b6d4" },
  { id: "explainer", label: "Explainer", icon: FileText, color: "#f59e0b" },
  { id: "narrator", label: "Portfolio", icon: Sparkles, color: "#ec4899" },
  { id: "voice", label: "Voice Notes", icon: Mic, color: "#14b8a6" },
  { id: "anomaly", label: "Anomalies", icon: AlertTriangle, color: "#f43f5e" },
];

export default function AiInsights() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profiler");
  const [loading, setLoading] = useState(false);

  // ── Profiler state ──
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [profileResult, setProfileResult] = useState<{ profile: string; reasoning: string } | null>(null);

  // ── Scorer state ──
  const [scoreDealId, setScoreDealId] = useState("");
  const [scoreResult, setScoreResult] = useState<{ flag: string; note: string; sentiment: string } | null>(null);

  // ── Ranker state ──
  const [rankResult, setRankResult] = useState<{ ranked_deal_ids: number[]; reasoning: string } | null>(null);

  // ── Explainer state ──
  const [explainDealId, setExplainDealId] = useState("");
  const [explainResult, setExplainResult] = useState<string | null>(null);

  // ── Narrator state ──
  const [narrativeResult, setNarrativeResult] = useState<string | null>(null);

  // ── Voice state ──
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [rewritten, setRewritten] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // ── Anomaly state ──
  const [anomalyDealId, setAnomalyDealId] = useState("");
  const [anomalyResult, setAnomalyResult] = useState<{
    anomalies_found: boolean; anomalies: string[]; risk_level: string; recommendation: string;
  } | null>(null);


  const [error, setError] = useState<string | null>(null);

  async function runAction(fn: () => Promise<void>) {
    setLoading(true);
    setError(null);
    try { await fn(); } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally { setLoading(false); }
  }

  // ── Handlers ──
  const handleClassify = () => runAction(async () => {
    if (!user) return;
    const res = await classifyInvestor(user.user_id, quizAnswers);
    setProfileResult({ profile: res.investor_profile, reasoning: res.reasoning });
  });

  const handleScore = () => runAction(async () => {
    const res = await scoreDeal(Number(scoreDealId));
    setScoreResult({ flag: res.flag, note: res.note, sentiment: res.sentiment });
  });

  const handleRank = () => runAction(async () => {
    if (!user) return;
    const res = await rankDeals(user.user_id);
    setRankResult(res);
  });

  const handleExplain = () => runAction(async () => {
    const res = await explainDeal(Number(explainDealId));
    setExplainResult(res.explanation);
  });

  const handleNarrate = () => runAction(async () => {
    if (!user) return;
    const res = await narratePortfolio(user.user_id);
    setNarrativeResult(res.narrative);
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunks.current = [];
      recorder.ondataavailable = (e) => audioChunks.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        setLoading(true);
        try {
          const res = await transcribeVoice(blob);
          setTranscript(res.transcript);
          const rw = await rewriteText(res.transcript);
          setRewritten(rw.rewritten);
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : "Transcription failed");
        } finally { setLoading(false); }
      };
      recorder.start();
      mediaRecorder.current = recorder;
      setIsRecording(true);
    } catch {
      setError("Microphone access denied");
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  const handleAnomaly = () => runAction(async () => {
    const res = await detectAnomalies(Number(anomalyDealId));
    setAnomalyResult(res);
  });



  const flagColors: Record<string, string> = {
    green: "#22c55e", yellow: "#f59e0b", red: "#ef4444",
  };

  const profileColors: Record<string, string> = {
    conservative: "#06b6d4", balanced: "#f59e0b", growth: "#10b981",
  };

  const quizQuestions = [
    { key: "horizon", q: "What is your investment horizon?", opts: ["< 6 months", "6-12 months", "1-2 years", "2+ years"] },
    { key: "loss", q: "How would you react to a 20% loss?", opts: ["Sell immediately", "Wait and see", "Buy more"] },
    { key: "goal", q: "What is your primary goal?", opts: ["Capital preservation", "Steady income", "Maximum growth"] },
  ];

  return (
    <div className="animate-fade-in font-sans">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-textMain tracking-tight mb-2">AI Command Center</h2>
        <p className="text-textSecondary">9 AI-powered features — LLaMA 3.3 70B + Groq Whisper</p>
      </div>

      {/* Status Banner */}
      <div className="flex items-center gap-4 p-5 mb-8 bg-gradient-to-r from-primary/10 to-accent-blue/10 border border-primary/20 rounded-2xl animate-pulse-glow">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent-blue flex items-center justify-center text-background shrink-0">
          <Brain size={24} />
        </div>
        <div className="flex-1">
          <strong className="block text-lg text-textMain mb-1">Thimar AI Engine Active</strong>
          <span className="text-sm text-textMuted">Groq LLaMA Models · 8 text features &nbsp;|&nbsp; Whisper · voice transcription</span>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold bg-success/20 text-success border border-success/30 uppercase tracking-widest shadow-[0_0_15px_rgba(0,255,102,0.3)]">
          Live
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 border ${
              activeTab === t.id 
                ? "bg-surfaceHighlight border-primary text-primary shadow-[0_0_10px_rgba(0,255,102,0.2)]" 
                : "bg-surface border-white/10 text-textSecondary hover:border-white/30 hover:text-textMain"
            }`}
            onClick={() => { setActiveTab(t.id); setError(null); }}
          >
            <t.icon size={16} color={activeTab === t.id ? t.color : "currentColor"} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm font-medium">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {/* Content */}
      <div className="min-h-[400px]">

        {/* ── 1. Risk Profiler ── */}
        {activeTab === "profiler" && (
          <div className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center">
                <ShieldCheck size={24} color="#8b5cf6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-textMain">Investor Risk Profiler</h3>
                <p className="text-sm text-textMuted">Answer 3 questions to classify your risk tolerance</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-6 mb-8">
              {quizQuestions.map((q) => (
                <div key={q.key} className="flex flex-col gap-3">
                  <label className="text-sm font-bold text-textMain">{q.q}</label>
                  <div className="flex flex-wrap gap-2">
                    {q.opts.map((o) => (
                      <button key={o}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                          quizAnswers[q.key] === o 
                            ? "bg-[#8b5cf6]/20 border-[#8b5cf6] text-[#8b5cf6]" 
                            : "bg-surface border-white/10 text-textSecondary hover:border-white/30"
                        }`}
                        onClick={() => setQuizAnswers((p) => ({ ...p, [q.key]: o }))}
                      >{o}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={handleClassify} 
              disabled={loading || Object.keys(quizAnswers).length < 3}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Brain size={18} />}
              Classify My Profile
            </button>
            
            {profileResult && (
              <div className="mt-6 p-6 rounded-xl bg-black/20 border-l-4" style={{ borderLeftColor: profileColors[profileResult.profile] || "#8b5cf6" }}>
                <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold text-white mb-3 tracking-widest uppercase" style={{ background: profileColors[profileResult.profile] || "#8b5cf6" }}>
                  {profileResult.profile}
                </div>
                <p className="text-textSecondary leading-relaxed">{profileResult.reasoning}</p>
              </div>
            )}
          </div>
        )}

        {/* ── 6. Deal Scorer ── */}
        {activeTab === "scorer" && (
          <div className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp size={24} className="text-success" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-textMain">Deal Viability Checker</h3>
                <p className="text-sm text-textMuted">Run AI risk analysis on any deal</p>
              </div>
            </div>
            
            <div className="flex gap-4 mb-6">
              <input type="number" placeholder="Enter Deal ID (e.g. 1)" value={scoreDealId}
                onChange={(e) => setScoreDealId(e.target.value)} 
                className="flex-1 bg-surfaceHighlight/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-textMain focus:outline-none focus:border-primary transition-colors placeholder:text-textMuted" 
              />
              <button 
                className="flex items-center gap-2 bg-success hover:bg-success/80 text-background px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)] disabled:opacity-50" 
                onClick={handleScore} 
                disabled={loading || !scoreDealId}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                Score Deal
              </button>
            </div>
            
            {scoreResult && (
              <div className="mt-6 p-6 rounded-xl bg-black/20 border-l-4" style={{ borderLeftColor: flagColors[scoreResult.flag] }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="px-4 py-1 rounded-full text-xs font-bold text-white uppercase tracking-widest" style={{ background: flagColors[scoreResult.flag] }}>
                    {scoreResult.flag}
                  </div>
                  <span className="text-sm text-textMuted">Sentiment: <strong className="text-textMain">{scoreResult.sentiment}</strong></span>
                </div>
                <p className="text-textSecondary leading-relaxed">{scoreResult.note}</p>
              </div>
            )}
          </div>
        )}

        {/* ── 2. Deal Ranker ── */}
        {activeTab === "ranker" && (
          <div className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-accent-blue/10 flex items-center justify-center">
                <BarChart3 size={24} className="text-accent-blue" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-textMain">AI Deal Ranker</h3>
                <p className="text-sm text-textMuted">Get personalized deal rankings based on your profile</p>
              </div>
            </div>
            
            <button 
              className="flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/80 text-background px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50" 
              onClick={handleRank} 
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              Rank Deals For Me
            </button>
            
            {rankResult && (
              <div className="mt-8 p-6 rounded-xl bg-black/20 border border-white/5">
                <h4 className="text-lg font-bold text-textMain mb-4">Recommended Order</h4>
                <div className="flex flex-col gap-3">
                  {rankResult.ranked_deal_ids.map((id, i) => (
                    <div key={id} className="flex items-center gap-4 p-3 rounded-xl bg-surfaceHighlight/30 border border-white/5 hover:border-accent-blue/50 transition-colors">
                      <span className="text-accent-blue font-bold text-lg min-w-[30px]">#{i + 1}</span>
                      <span className="text-textMain font-medium flex-1">Deal {id}</span>
                      <ChevronRight size={18} className="text-textMuted" />
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-sm text-textSecondary leading-relaxed">{rankResult.reasoning}</p>
              </div>
            )}
          </div>
        )}

        {/* ── 3. Deal Explainer ── */}
        {activeTab === "explainer" && (
          <div className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-accent-amber/10 flex items-center justify-center">
                <FileText size={24} className="text-accent-amber" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-textMain">Deal Explainer</h3>
                <p className="text-sm text-textMuted">Get a plain-language explanation of any deal</p>
              </div>
            </div>
            
            <div className="flex gap-4 mb-6">
              <input type="number" placeholder="Enter Deal ID" value={explainDealId}
                onChange={(e) => setExplainDealId(e.target.value)} 
                className="flex-1 bg-surfaceHighlight/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-textMain focus:outline-none focus:border-primary transition-colors placeholder:text-textMuted" 
              />
              <button 
                className="flex items-center gap-2 bg-accent-amber hover:bg-accent-amber/80 text-background px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50" 
                onClick={handleExplain} 
                disabled={loading || !explainDealId}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                Explain
              </button>
            </div>
            
            {explainResult && (
              <div className="mt-6 p-6 rounded-xl bg-black/20 border-l-4 border-accent-amber">
                <p className="text-textSecondary leading-relaxed whitespace-pre-line">{explainResult}</p>
              </div>
            )}
          </div>
        )}

        {/* ── 4. Portfolio Narrator ── */}
        {activeTab === "narrator" && (
          <div className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-accent-rose/10 flex items-center justify-center">
                <Sparkles size={24} className="text-accent-rose" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-textMain">Portfolio Narrator</h3>
                <p className="text-sm text-textMuted">AI-generated summary of your investment portfolio</p>
              </div>
            </div>
            
            <button 
              className="flex items-center gap-2 bg-accent-rose hover:bg-accent-rose/80 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] disabled:opacity-50" 
              onClick={handleNarrate} 
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              Generate Summary
            </button>
            
            {narrativeResult && (
              <div className="mt-8 p-6 rounded-xl bg-black/20 border-l-4 border-accent-rose">
                <p className="text-textSecondary leading-relaxed whitespace-pre-line">{narrativeResult}</p>
              </div>
            )}
          </div>
        )}

        {/* ── 5. Voice Notes ── */}
        {activeTab === "voice" && (
          <div className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
                <Mic size={24} className="text-accent-cyan" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-textMain">Voice Notes</h3>
                <p className="text-sm text-textMuted">Record a farmer voice note → Transcribe (Groq Whisper) → Rewrite (LLaMA)</p>
              </div>
            </div>
            
            <div className="flex gap-4 mb-6">
              {!isRecording ? (
                <button 
                  className="flex items-center gap-2 bg-accent-cyan hover:bg-accent-cyan/80 text-background px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] disabled:opacity-50" 
                  onClick={startRecording} 
                  disabled={loading}
                >
                  <Mic size={18} /> Start Recording
                </button>
              ) : (
                <button 
                  className="flex items-center gap-2 bg-danger hover:bg-danger/80 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]" 
                  onClick={stopRecording}
                >
                  <MicOff size={18} className="animate-pulse" /> Stop Recording
                </button>
              )}
            </div>
            
            {loading && (
              <div className="flex items-center gap-3 text-accent-cyan font-medium py-4">
                <Loader2 size={20} className="animate-spin" /> Transcribing & rewriting…
              </div>
            )}
            
            {transcript && (
              <div className="mt-6 flex flex-col gap-6">
                <div className="p-6 rounded-xl bg-black/20 border-l-4 border-accent-cyan">
                  <h4 className="text-accent-cyan font-bold mb-2">Raw Transcript (Whisper)</h4>
                  <p className="text-textSecondary leading-relaxed">{transcript}</p>
                </div>
                {rewritten && (
                  <div className="p-6 rounded-xl bg-black/20 border-l-4 border-success">
                    <h4 className="text-success font-bold mb-2">Rewritten (LLaMA)</h4>
                    <p className="text-textSecondary leading-relaxed">{rewritten}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── 7. Anomaly Detector ── */}
        {activeTab === "anomaly" && (
          <div className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-danger/10 flex items-center justify-center">
                <AlertTriangle size={24} className="text-danger" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-textMain">Revenue Anomaly Detector</h3>
                <p className="text-sm text-textMuted">Scan a deal for suspicious patterns and red flags</p>
              </div>
            </div>
            
            <div className="flex gap-4 mb-6">
              <input type="number" placeholder="Enter Deal ID" value={anomalyDealId}
                onChange={(e) => setAnomalyDealId(e.target.value)} 
                className="flex-1 bg-surfaceHighlight/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-textMain focus:outline-none focus:border-primary transition-colors placeholder:text-textMuted" 
              />
              <button 
                className="flex items-center gap-2 bg-danger hover:bg-danger/80 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] disabled:opacity-50" 
                onClick={handleAnomaly} 
                disabled={loading || !anomalyDealId}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <AlertTriangle size={18} />}
                Scan
              </button>
            </div>
            
            {anomalyResult && (
              <div className="mt-6 p-6 rounded-xl bg-black/20 border-l-4" style={{ borderLeftColor: anomalyResult.anomalies_found ? "#ef4444" : "#22c55e" }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="px-4 py-1 rounded-full text-xs font-bold text-white uppercase tracking-widest" style={{
                    background: anomalyResult.risk_level === "high" ? "#ef4444" : anomalyResult.risk_level === "medium" ? "#f59e0b" : "#22c55e"
                  }}>
                    {anomalyResult.risk_level} RISK
                  </div>
                  <span className={`text-sm font-bold ${anomalyResult.anomalies_found ? "text-danger" : "text-success"}`}>
                    {anomalyResult.anomalies_found ? "⚠️ Anomalies Found" : "✅ Clean"}
                  </span>
                </div>
                
                {anomalyResult.anomalies.length > 0 && (
                  <ul className="list-disc list-inside text-textSecondary mb-4 space-y-1">
                    {anomalyResult.anomalies.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                )}
                <p className="text-sm text-textMuted border-t border-white/5 pt-4 mt-2">
                  <strong className="text-textMain block mb-1">AI Recommendation:</strong> 
                  {anomalyResult.recommendation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── 8. AI Chat ── */}
        {activeTab === "chat" && (
          <div className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl flex flex-col h-[600px] shadow-xl overflow-hidden">
            <div className="flex items-center gap-4 p-6 border-b border-white/5 bg-surfaceHighlight/20">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <MessageCircle size={24} className="text-indigo-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-textMain">Thimar AI Assistant</h3>
                <p className="text-sm text-textMuted">Ask anything about the platform, deals, or your portfolio</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {chatMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-textMuted gap-4">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                    <Bot size={40} className="text-white/20" />
                  </div>
                  <p>Start a conversation with Thimar AI</p>
                </div>
              )}
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-surfaceHighlight text-textSecondary" : "bg-indigo-500/20 text-indigo-500"}`}>
                    {m.role === "user" ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user" 
                      ? "bg-primary text-background rounded-tr-none shadow-[0_0_15px_rgba(0,255,102,0.2)]" 
                      : "bg-surfaceHighlight/50 text-textSecondary rounded-tl-none border border-white/5"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
                    <Bot size={18} />
                  </div>
                  <div className="max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed bg-surfaceHighlight/50 text-textSecondary rounded-tl-none border border-white/5 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-indigo-500" /> Thinking…
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-surfaceHighlight/30 border-t border-white/5">
              <div className="relative flex items-center gap-3">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleChat()}
                  placeholder="Ask Thimar AI…"
                  className="flex-1 bg-background border border-white/10 rounded-full py-4 pl-6 pr-4 text-sm text-textMain focus:outline-none focus:border-primary transition-colors placeholder:text-textMuted"
                />
                <button 
                  className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-background hover:scale-105 hover:shadow-[0_0_15px_rgba(0,255,102,0.4)] transition-all disabled:opacity-50 disabled:hover:scale-100" 
                  onClick={handleChat} 
                  disabled={loading || !chatInput.trim()}
                >
                  <Send size={18} className="mr-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
