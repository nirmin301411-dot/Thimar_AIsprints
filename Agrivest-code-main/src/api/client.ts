// src/api/client.ts
// Base HTTP client for all backend requests.
// All API files import from here — change the BASE_URL once to switch environments.

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string | number>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, params } = options;

  // Build URL with optional query params
  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, val]) =>
      url.searchParams.append(key, String(val))
    );
  }

  const res = await fetch(url.toString(), {
    method,
    credentials: "include", // send Flask session cookie
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }

  return data as T;
}

export default request;
