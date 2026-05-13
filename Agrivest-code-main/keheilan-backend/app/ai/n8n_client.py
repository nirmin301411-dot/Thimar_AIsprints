# =============================================================================
# app/ai/n8n_client.py
# Fire-and-forget webhook client for n8n workflow automations.
#
# Workflows:
#   1. revenue-anomaly   → triggered when AI detects anomalies in a deal
#   2. kyc-alert         → triggered when a new user registers (KYC submitted)
#   3. deal-funded       → triggered when a deal reaches its funding goal
#   4. deal-closed       → triggered when a deal status changes to "closed"
#   5. platform-post     → triggered when admin publishes an announcement
#
# All calls are fire-and-forget: we POST to n8n and don't block the response.
# If n8n is unreachable, we log a warning and continue — the main operation
# always succeeds regardless of n8n availability.
# =============================================================================

import threading
import requests
from flask import current_app


def _get_base_url():
    """Return the n8n webhook base URL from config, or None if not set."""
    return current_app.config.get("N8N_WEBHOOK_BASE_URL")


def _fire_webhook(path: str, payload: dict):
    """
    POST to an n8n webhook in a background thread (fire-and-forget).
    This ensures the main Flask response is never delayed by n8n latency.
    """
    base_url = _get_base_url()
    if not base_url:
        current_app.logger.debug(f"N8N_WEBHOOK_BASE_URL not set — skipping {path}")
        return

    url = f"{base_url}/{path}"

    def _send():
        try:
            resp = requests.post(url, json=payload, timeout=10)
            # Log silently — n8n returns 200 if workflow ran
            if resp.status_code == 200:
                print(f"[N8N] ✓ {path} → 200 OK")
            else:
                print(f"[N8N] ⚠ {path} → {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            print(f"[N8N] ✗ {path} failed: {e}")

    thread = threading.Thread(target=_send, daemon=True)
    thread.start()


# ─────────────────────────────────────────────────
# 1. REVENUE ANOMALY
#    Fired when AI anomaly detector finds issues in a deal.
# ─────────────────────────────────────────────────
def notify_revenue_anomaly(deal_id: int, farm_name: str, anomalies: list,
                           risk_level: str, recommendation: str):
    _fire_webhook("revenue-anomaly", {
        "deal_id": deal_id,
        "farm_name": farm_name,
        "anomalies": anomalies,
        "risk_level": risk_level,
        "recommendation": recommendation,
        "source": "keheilan-ai",
    })


# ─────────────────────────────────────────────────
# 2. KYC ALERT
#    Fired when a new user registers on the platform.
# ─────────────────────────────────────────────────
def notify_kyc_submitted(user_id: int, name: str, phone: str,
                         national_id: str, role: str, governorate: str | None):
    _fire_webhook("kyc-alert", {
        "user_id": user_id,
        "name": name,
        "phone": phone,
        "national_id": national_id,
        "role": role,
        "governorate": governorate or "unknown",
        "source": "keheilan-auth",
    })


# ─────────────────────────────────────────────────
# 3. DEAL FUNDED
#    Fired when an investment causes a deal to reach its funding goal.
# ─────────────────────────────────────────────────
def notify_deal_funded(deal_id: int, farm_name: str, goal_egp: float,
                       funded_egp: float, num_investors: int):
    _fire_webhook("deal-funded", {
        "deal_id": deal_id,
        "farm_name": farm_name,
        "goal_egp": goal_egp,
        "funded_egp": funded_egp,
        "num_investors": num_investors,
        "funding_pct": round(funded_egp / goal_egp * 100, 1) if goal_egp else 0,
        "source": "keheilan-investor",
    })


# ─────────────────────────────────────────────────
# 4. DEAL CLOSED
#    Fired when a deal status changes to "closed".
# ─────────────────────────────────────────────────
def notify_deal_closed(deal_id: int, farm_name: str, goal_egp: float,
                       funded_egp: float, expected_return_pct: float,
                       duration_months: int):
    _fire_webhook("deal-closed", {
        "deal_id": deal_id,
        "farm_name": farm_name,
        "goal_egp": goal_egp,
        "funded_egp": funded_egp,
        "expected_return_pct": expected_return_pct,
        "duration_months": duration_months,
        "source": "keheilan-deals",
    })


# ─────────────────────────────────────────────────
# 5. PLATFORM POST
#    Fired when admin publishes an announcement / platform post.
# ─────────────────────────────────────────────────
def notify_platform_post(title: str, content: str, author: str,
                         target_audience: str = "all"):
    _fire_webhook("platform-post", {
        "title": title,
        "content": content,
        "author": author,
        "target_audience": target_audience,
        "source": "keheilan-admin",
    })
