// src/api/deals.ts
// Deal (investment opportunity) API calls.
// Maps to Flask blueprint: /investor (deal listing & detail)

import request from "./client";

export interface Deal {
  id: number;
  farm_id: number;
  model_type: string;
  goal_egp: number;
  funded_egp: number;
  min_ticket_egp: number;
  expected_return_pct: number;
  duration_months: number;
  season: string | null;
  status: string;
  sentiment: string;
  opening_bid_egp: number | null;
  ai_viability_flag: string | null;
  ai_viability_note: string | null;
  created_at: string;
}

export interface CreateDealPayload {
  farm_id: number;
  model_type: string;
  goal_egp: number;
  min_ticket_egp: number;
  expected_return_pct: number;
  duration_months: number;
  season?: string;
}

// GET /investor/deals — list all open fundraising deals
export const getDeals = () =>
  request<Deal[]>("/investor/deals");

// GET /investor/deals/:id — get a single deal with full details
export const getDealById = (dealId: number) =>
  request<Deal>(`/investor/deals/${dealId}`);

// GET /investor/deals?farm_id=X — list deals for a specific farm
export const getDealsByFarm = (farmId: number) =>
  request<Deal[]>("/investor/deals", { params: { farm_id: farmId } });

// POST /investor/deals — create a new deal (admin/farmer)
export const createDeal = (payload: CreateDealPayload) =>
  request<Deal>("/investor/deals", { method: "POST", body: payload });

// PATCH /investor/deals/:id/status — update deal status (admin)
export const updateDealStatus = (dealId: number, status: string) =>
  request<Deal>(`/investor/deals/${dealId}/status`, {
    method: "PATCH",
    body: { status },
  });
