// src/api/investments.ts
// Investor portfolio API calls — investing in deals and tracking returns.
// Maps to Flask blueprint: /investor

import request from "./client";

export interface Investment {
  id: number;
  investor_id: number;
  deal_id: number;
  amount_egp: number;
  status: string;
  invested_at: string;
  expected_return_date: string | null;
  actual_return_egp: number | null;
}

export interface InvestPayload {
  investor_id: number;
  deal_id: number;
  amount_egp: number;
}

export interface PortfolioSummary {
  total_invested: number;
  current_value: number;
  total_roi_pct: number;
  active_deals: number;
  investments: Investment[];
}

// POST /investor/invest — place an investment in a deal
export const invest = (payload: InvestPayload) =>
  request<Investment>("/investor/invest", { method: "POST", body: payload });

// GET /investor/portfolio?investor_id=X — get full portfolio summary for an investor
export const getPortfolio = (investorId: number) =>
  request<PortfolioSummary>("/investor/portfolio", {
    params: { investor_id: investorId },
  });

// GET /investor/investments?investor_id=X — list all investments for an investor
export const getInvestments = (investorId: number) =>
  request<Investment[]>("/investor/investments", {
    params: { investor_id: investorId },
  });

// GET /investor/investments/:id — get a single investment by ID
export const getInvestmentById = (investmentId: number) =>
  request<Investment>(`/investor/investments/${investmentId}`);
