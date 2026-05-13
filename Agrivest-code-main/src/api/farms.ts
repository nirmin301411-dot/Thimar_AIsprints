// src/api/farms.ts
// Farm browsing and management API calls.
// Maps to Flask blueprint: /farmer (farm CRUD)

import request from "./client";

export interface Farm {
  id: number;
  operator_id: number;
  name: string;
  governorate: string;
  crop_type: string;
  land_size_feddans: number;
  water_source: string;
  land_status: string;
  status: string;
  sustainability_score: number;
  photo_urls: string[] | null;
  created_at: string;
}

export interface CreateFarmPayload {
  operator_id: number;
  name: string;
  governorate: string;
  crop_type: string;
  land_size_feddans: number;
  water_source: string;
  land_status: string;
}

// GET /farmer/farms — list all approved/active farms for browsing
export const getFarms = () =>
  request<Farm[]>("/farmer/farms");

// GET /farmer/farms/:id — get a single farm by ID
export const getFarmById = (farmId: number) =>
  request<Farm>(`/farmer/farms/${farmId}`);

// POST /farmer/farms — farmer registers a new farm
export const createFarm = (payload: CreateFarmPayload) =>
  request<Farm>("/farmer/farms", { method: "POST", body: payload });

// GET /farmer/farms?operator_id=X — list farms owned by a specific farmer
export const getFarmsByOperator = (operatorId: number) =>
  request<Farm[]>("/farmer/farms", { params: { operator_id: operatorId } });

// PATCH /farmer/farms/:id/status — admin approves or rejects a farm
export const updateFarmStatus = (farmId: number, status: string) =>
  request<Farm>(`/farmer/farms/${farmId}/status`, {
    method: "PATCH",
    body: { status },
  });
