// src/api/milestones.ts
// Farm milestone (progress update) API calls.
// Maps to Flask blueprint: /farmer

import request from "./client";

export interface Milestone {
  id: number;
  farm_id: number;
  deal_id: number | null;
  type: string;
  status: string;
  raw_input: string | null;
  ai_converted_text: string | null;
  photo_url: string | null;
  submitted_at: string;
  verified_at: string | null;
}

export interface SubmitMilestonePayload {
  farm_id: number;
  deal_id?: number;
  type: string;
  raw_input: string;
  photo_url?: string;
}

// GET /farmer/milestones?farm_id=X — list all milestones for a farm
export const getMilestones = (farmId: number) =>
  request<Milestone[]>("/farmer/milestones", { params: { farm_id: farmId } });

// POST /farmer/milestones — farmer submits a new progress update
export const submitMilestone = (payload: SubmitMilestonePayload) =>
  request<Milestone>("/farmer/milestones", { method: "POST", body: payload });

// PATCH /farmer/milestones/:id/verify — admin verifies a milestone
export const verifyMilestone = (milestoneId: number) =>
  request<Milestone>(`/farmer/milestones/${milestoneId}/verify`, {
    method: "PATCH",
  });

// GET /farmer/milestones/:id — get a single milestone
export const getMilestoneById = (milestoneId: number) =>
  request<Milestone>(`/farmer/milestones/${milestoneId}`);
