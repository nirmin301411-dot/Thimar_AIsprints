// src/api/auth.ts
// All authentication-related API calls.
// Maps to Flask blueprint: /auth

import request from "./client";

export interface LoginPayload {
  phone: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  phone: string;
  national_id: string;
  password: string;
  role: "investor" | "farmer" | "admin";
  governorate?: string;
}

export interface UserResponse {
  user_id: number;
  name: string;
  role: string;
  governorate: string | null;
  investor_profile: string | null;
  message?: string;
}

// POST /auth/login — authenticate with phone + password
export const login = (payload: LoginPayload) =>
  request<UserResponse>("/auth/login", { method: "POST", body: payload });

// POST /auth/register — create a new account
export const register = (payload: RegisterPayload) =>
  request<UserResponse>("/auth/register", { method: "POST", body: payload });

// POST /auth/logout — clear the session
export const logout = () =>
  request<{ message: string }>("/auth/logout", { method: "POST" });

// GET /auth/me?user_id=X — get full user object by ID
export const getMe = (userId: number) =>
  request<UserResponse>("/auth/me", { params: { user_id: userId } });

// POST /auth/onboarding — submit quiz answers and set investor profile
export const submitOnboarding = (userId: number, answers: Record<string, string>) =>
  request<{ message: string; user_id: number }>("/auth/onboarding", {
    method: "POST",
    body: { user_id: userId, answers },
  });
