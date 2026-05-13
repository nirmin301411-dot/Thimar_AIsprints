// src/api/admin.ts
// Admin dashboard API calls — alerts, deal management, and user oversight.
// Maps to Flask blueprint: /admin

import request from "./client";

export interface Alert {
  id: number;
  deal_id: number;
  flag_reason: string;
  severity: string;
  status: string;
  ai_reasoning: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface AdminStats {
  total_users: number;
  total_farms: number;
  total_deals: number;
  total_invested_egp: number;
  open_alerts: number;
  pending_farms: number;
}

// GET /admin/alerts — list all open AI-generated alerts
export const getAlerts = () =>
  request<Alert[]>("/admin/alerts");

// PATCH /admin/alerts/:id/resolve — mark an alert as resolved
export const resolveAlert = (alertId: number) =>
  request<Alert>(`/admin/alerts/${alertId}/resolve`, { method: "PATCH" });

// PATCH /admin/alerts/:id/override — override an alert (dismiss without action)
export const overrideAlert = (alertId: number) =>
  request<Alert>(`/admin/alerts/${alertId}/override`, { method: "PATCH" });

// GET /admin/stats — platform-wide aggregate stats for admin dashboard
export const getAdminStats = () =>
  request<AdminStats>("/admin/stats");

// GET /admin/users — list all registered users
export const getAllUsers = () =>
  request<{ id: number; name: string; role: string; phone: string; created_at: string }[]>(
    "/admin/users"
  );

// PATCH /admin/farms/:id/approve — approve a pending farm
export const approveFarm = (farmId: number) =>
  request<{ message: string }>(`/admin/farms/${farmId}/approve`, { method: "PATCH" });

// PATCH /admin/farms/:id/reject — reject a pending farm
export const rejectFarm = (farmId: number) =>
  request<{ message: string }>(`/admin/farms/${farmId}/reject`, { method: "PATCH" });

/** Platform post result from n8n workflow trigger */
export interface PlatformPostResult {
  message: string;
  title: string;
  target_audience: string;
}

/** POST /admin/platform-post — publish an announcement via n8n workflow */
export const publishPlatformPost = (
  title: string,
  content: string,
  author?: string,
  targetAudience?: string
) =>
  request<PlatformPostResult>("/admin/platform-post", {
    method: "POST",
    body: {
      title,
      content,
      author: author || "Keheilan Admin",
      target_audience: targetAudience || "all",
    },
  });

/** POST /admin/deals/:id/simulate-funded — simulate a deal reaching full funding (test tool) */
export const simulateDealFunded = (dealId: number) =>
  request<{ message: string }>(`/admin/deals/${dealId}/simulate-funded`, {
    method: "POST",
  });

/** Commodity price entry from the market-prices endpoint */
export interface MarketPrice {
  crop: string;
  price_egp_per_ton: number;
  change_pct: number;
}

/** GET /admin/market-prices — live Egyptian commodity prices */
export const getMarketPrices = () =>
  request<MarketPrice[]>("/admin/market-prices");
