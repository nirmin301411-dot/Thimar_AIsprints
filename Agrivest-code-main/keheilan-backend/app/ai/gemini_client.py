# =============================================================================
# app/ai/gemini_client.py
# Renamed but repurposed: all AI text generation now runs on Groq open-source
# models (LLaMA 3.3 70B + LLaMA 3.1 8B) instead of Google Gemini.
#
# Function signatures are identical to the original so no routes need changing.
# Models used:
#   llama-3.3-70b-versatile  → complex reasoning (risk, anomaly, ranking)
#   llama-3.1-8b-instant     → fast text tasks (explainer, narrator, rewriter)
# Both are free-tier on Groq with separate daily quota pools.
# =============================================================================

import json
import re
from flask import current_app


# Default models — routes can override via the `model` parameter
GROQ_HEAVY = "llama-3.3-70b-versatile"   # 14,400 req/day free tier
GROQ_FAST  = "llama-3.1-8b-instant"      # separate quota pool, very fast


def _get_groq_client():
    """Return a Groq client using GROQ_API_KEY, or None if not configured."""
    api_key = current_app.config.get("GROQ_API_KEY")
    if not api_key:
        current_app.logger.error("GROQ_API_KEY not set — AI features unavailable.")
        return None
    try:
        from groq import Groq
        return Groq(api_key=api_key)
    except ImportError:
        current_app.logger.error("groq package not installed. Run: pip install groq")
        return None


def generate(prompt: str, max_tokens: int = 1024, model: str = GROQ_FAST) -> str | None:
    """Send a text prompt to a Groq open-source model and return the response.

    model parameter maps:
      "gemini-2.0-flash-lite"  → llama-3.1-8b-instant  (fast tasks)
      "gemini-2.0-flash"       → llama-3.1-8b-instant
      "gemini-2.5-flash-lite"  → llama-3.3-70b-versatile
      "gemini-2.5-flash"       → llama-3.3-70b-versatile  (complex tasks)
      any other value          → used as-is (pass a real Groq model name)
    """
    # Translate legacy Gemini model names → Groq equivalents
    groq_model = _resolve_model(model)

    client = _get_groq_client()
    if not client:
        return None
    try:
        completion = client.chat.completions.create(
            model=groq_model,
            messages=[
                {"role": "system", "content": "You are a helpful AI assistant for an agricultural investment platform called Keheilan operating in Egypt and East Africa. Be concise and professional."},
                {"role": "user",   "content": prompt},
            ],
            max_tokens=max_tokens,
            temperature=0.4,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        current_app.logger.error(f"Groq [{groq_model}] error: {e}")
        return None


def generate_json(prompt: str, max_tokens: int = 2048, model: str = GROQ_HEAVY) -> dict | None:
    """Send a prompt expecting JSON, robustly parse and return as dict."""
    json_prompt = (
        prompt
        + "\n\nCRITICAL: Your entire response must be ONLY a valid JSON object. "
          "No markdown fences, no explanation, no text before or after the JSON."
    )
    raw = generate(json_prompt, max_tokens, model=model)
    if not raw:
        return None

    # Strategy 1: direct parse
    try:
        return json.loads(raw.strip())
    except json.JSONDecodeError:
        pass

    # Strategy 2: extract from ```json ... ``` block
    match = re.search(r"```(?:json)?\s*(\{[\s\S]*?\})\s*```", raw)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # Strategy 3: find largest {...} block anywhere in response
    match = re.search(r"\{[\s\S]*\}", raw)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    current_app.logger.error(f"JSON parse failed. Full response:\n{raw}")
    return None


def _resolve_model(model: str) -> str:
    """Map legacy Gemini model names to Groq open-source equivalents."""
    mapping = {
        "gemini-2.0-flash-lite":  GROQ_FAST,
        "gemini-2.0-flash":       GROQ_FAST,
        "gemini-2.0-flash-001":   GROQ_FAST,
        "gemini-2.5-flash-lite":  GROQ_HEAVY,
        "gemini-2.5-flash":       GROQ_HEAVY,
        "gemini-2.5-pro":         GROQ_HEAVY,
        "gemini-1.5-flash":       GROQ_FAST,
    }
    return mapping.get(model, model)  # unknown names pass through as-is
