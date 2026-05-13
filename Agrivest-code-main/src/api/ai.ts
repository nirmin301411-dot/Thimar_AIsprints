// src/api/ai.ts
// AI feature API calls — all 9 AI features mapped to Flask /ai blueprint.
// Uses: Gemini 1.5 Flash (8 text features) + Groq Whisper (voice transcription)

import request from "./client";

// ─── Interfaces ───────────────────────────────────────────────────────

/** 1. Risk Profiler — classify investor from quiz answers */
export interface ProfileClassificationResult {
  user_id: number;
  investor_profile: "conservative" | "balanced" | "growth";
  reasoning: string;
}

/** 2. Deal Feed Ranker — AI-ranked deal IDs for a user */
export interface DealRankingResult {
  ranked_deal_ids: number[];
  reasoning: string;
}

/** 3. Deal Explainer — plain-language deal explanation */
export interface DealExplanationResult {
  deal_id: number;
  explanation: string;
}

/** 4. Portfolio Narrator — natural language portfolio summary */
export interface PortfolioNarrativeResult {
  user_id: number;
  narrative: string;
}

/** 5. Voice Transcription — Groq Whisper result */
export interface VoiceTranscriptResult {
  transcript: string;
}

/** 5b. Text Rewriter — post-transcription cleanup */
export interface TextRewriteResult {
  original: string;
  rewritten: string;
  milestone_id: number | null;
}

/** 6. Deal Viability Checker — risk scoring */
export interface ViabilityResult {
  deal_id: number;
  flag: "green" | "yellow" | "red";
  note: string;
  opening_bid_egp: number;
  sentiment: string;
}

/** 7. Revenue Anomaly Detector */
export interface AnomalyResult {
  deal_id: number;
  anomalies_found: boolean;
  anomalies: string[];
  risk_level: "low" | "medium" | "high";
  recommendation: string;
}

/** 8. In-App AI Helper — chatbot */
export interface ChatResult {
  reply: string;
}

// ─── API Functions ────────────────────────────────────────────────────

/** 1. Risk Profiler — POST /ai/classify-investor */
export const classifyInvestor = (userId: number, answers: Record<string, string>) =>
  request<ProfileClassificationResult>("/ai/classify-investor", {
    method: "POST",
    body: { user_id: userId, answers },
  });

/** 2. Deal Feed Ranker — POST /ai/rank-deals */
export const rankDeals = (userId: number) =>
  request<DealRankingResult>("/ai/rank-deals", {
    method: "POST",
    body: { user_id: userId },
  });

/** 3. Deal Explainer — POST /ai/explain-deal */
export const explainDeal = (dealId: number) =>
  request<DealExplanationResult>("/ai/explain-deal", {
    method: "POST",
    body: { deal_id: dealId },
  });

/** 4. Portfolio Narrator — POST /ai/narrate-portfolio */
export const narratePortfolio = (userId: number) =>
  request<PortfolioNarrativeResult>("/ai/narrate-portfolio", {
    method: "POST",
    body: { user_id: userId },
  });

/** 5. Voice Transcription — POST /ai/transcribe (multipart) */
export const transcribeVoice = (audioBlob: Blob) => {
  const formData = new FormData();
  formData.append("audio", audioBlob, "voice_note.webm");

  return fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"}/ai/transcribe`, {
    method: "POST",
    credentials: "include",
    body: formData, // no Content-Type header — browser sets multipart boundary automatically
  }).then((res) => res.json() as Promise<VoiceTranscriptResult>);
};

/** 5b. Text Rewriter — POST /ai/rewrite-text */
export const rewriteText = (rawText: string, milestoneId?: number) =>
  request<TextRewriteResult>("/ai/rewrite-text", {
    method: "POST",
    body: { raw_text: rawText, milestone_id: milestoneId },
  });

/** 6. Deal Viability Checker — POST /ai/score-deal */
export const scoreDeal = (dealId: number) =>
  request<ViabilityResult>("/ai/score-deal", {
    method: "POST",
    body: { deal_id: dealId },
  });

/** 7. Revenue Anomaly Detector — POST /ai/detect-anomalies */
export const detectAnomalies = (dealId: number) =>
  request<AnomalyResult>("/ai/detect-anomalies", {
    method: "POST",
    body: { deal_id: dealId },
  });

/** 8. In-App AI Helper — POST /ai/chat */
export const chatWithAI = (message: string, userId?: number) =>
  request<ChatResult>("/ai/chat", {
    method: "POST",
    body: { message, user_id: userId },
  });
