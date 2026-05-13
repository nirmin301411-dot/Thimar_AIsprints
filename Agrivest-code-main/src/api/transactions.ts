// src/api/transactions.ts
// Wallet and transaction API calls.
// Maps to Flask blueprint: /investor

import request from "./client";

export interface Transaction {
  id: number;
  user_id: number;
  type: "deposit" | "allocation" | "return" | "withdrawal";
  amount_egp: number;
  deal_id: number | null;
  status: string;
  note: string | null;
  created_at: string;
}

export interface WalletBalance {
  user_id: number;
  balance_egp: number;
}

// GET /investor/transactions?user_id=X — list all transactions for a user
export const getTransactions = (userId: number) =>
  request<Transaction[]>("/investor/transactions", {
    params: { user_id: userId },
  });

// GET /investor/wallet?user_id=X — get current wallet balance
export const getWalletBalance = (userId: number) =>
  request<WalletBalance>("/investor/wallet", {
    params: { user_id: userId },
  });

// POST /investor/deposit — top up wallet
export const deposit = (userId: number, amountEgp: number) =>
  request<Transaction>("/investor/deposit", {
    method: "POST",
    body: { user_id: userId, amount_egp: amountEgp },
  });

// POST /investor/withdraw — withdraw from wallet
export const withdraw = (userId: number, amountEgp: number) =>
  request<Transaction>("/investor/withdraw", {
    method: "POST",
    body: { user_id: userId, amount_egp: amountEgp },
  });
