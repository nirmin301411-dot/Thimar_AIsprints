# =============================================================================
# app/routes/ai.py
# All AI-powered endpoints — 8 features using Gemini 1.5 Flash + Groq Whisper.
#
# Features:
#   1. Risk Profiler          POST /ai/classify-investor
#   2. Deal Feed Ranker       POST /ai/rank-deals
#   3. Deal Explainer         POST /ai/explain-deal
#   4. Portfolio Narrator     POST /ai/narrate-portfolio
#   5. Voice Transcription    POST /ai/transcribe         (Groq Whisper)
#   5b.Text Rewriter          POST /ai/rewrite-text       (post-transcription)
#   6. Deal Viability Checker POST /ai/score-deal
#   7. Revenue Anomaly Det.   POST /ai/detect-anomalies
#   8. In-App AI Helper       POST /ai/chat
#
# All routes return graceful fallbacks when API keys are not configured.
# =============================================================================

from flask import Blueprint, request, jsonify
from app.config.database import db
from app.models.deal import Deal
from app.models.farm import Farm
from app.models.milestone import Milestone
from app.models.investment import Investment
from app.models.alert import Alert
from app.models.user import User
from app.models.transaction import Transaction
from app.ai import gemini_client, groq_client

ai_bp = Blueprint("ai_bp", __name__, url_prefix="/ai")


# ─────────────────────────────────────────────────
# 1. RISK PROFILER
#    Classify investor into conservative/balanced/growth from quiz answers.
# ─────────────────────────────────────────────────
@ai_bp.route("/classify-investor", methods=["POST"])
def classify_investor():
    data = request.get_json()
    user_id = data.get("user_id")
    answers = data.get("answers", {})

    if not user_id:
        return jsonify({"error": "'user_id' is required"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    prompt = f"""You are classifying an investor profile for an Egyptian agricultural investment platform.

Quiz answers from the investor:
{answers}

Based on these answers, classify the investor as exactly one of:
- conservative (prefers low risk, stable returns, shorter horizons)
- balanced (moderate risk, diversified approach)
- growth (higher risk tolerance, seeks maximum returns)

Return ONLY valid JSON:
{{"profile": "conservative|balanced|growth", "reasoning": "one sentence explaining why"}}"""

    result = gemini_client.generate_json(prompt, max_tokens=512, model="gemini-2.5-flash")

    if result:
        profile = result.get("profile", "balanced")
        reasoning = result.get("reasoning", "AI-classified based on quiz answers.")
    else:
        profile = "balanced"
        reasoning = "AI classification not available — defaulting to balanced. Set GEMINI_API_KEY to enable."

    user.investor_profile = profile
    db.session.commit()

    return jsonify({
        "user_id": user.id,
        "investor_profile": profile,
        "reasoning": reasoning,
    }), 200


# ─────────────────────────────────────────────────
# 2. DEAL FEED RANKER
#    Re-rank available deals based on investor profile + preferences.
# ─────────────────────────────────────────────────
@ai_bp.route("/rank-deals", methods=["POST"])
def rank_deals():
    data = request.get_json()
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "'user_id' is required"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    deals = Deal.query.filter(Deal.status.in_(["fundraising", "active"])).all()
    if not deals:
        return jsonify({"ranked_deal_ids": [], "reasoning": "No active deals found."}), 200

    deals_summary = []
    for d in deals:
        farm = Farm.query.get(d.farm_id)
        deals_summary.append({
            "id": d.id,
            "crop": farm.crop_type if farm else "unknown",
            "roi": d.expected_return_pct,
            "duration": d.duration_months,
            "goal": d.goal_egp,
            "funded_pct": round((d.funded_egp or 0) / d.goal_egp * 100, 1) if d.goal_egp else 0,
            "sustainability": farm.sustainability_score if farm else 0,
        })

    prompt = f"""You are a deal ranking AI for an agricultural investment platform.

Investor profile: {user.investor_profile or 'balanced'}
Investor governorate: {user.governorate or 'unknown'}

Available deals:
{deals_summary}

Rank these deals from best to worst match for this investor.
Consider: risk tolerance (profile), ROI, sustainability score, funding progress.

Return ONLY valid JSON:
{{"ranked_deal_ids": [3, 1, 5, 2, 4], "reasoning": "brief explanation of ranking logic"}}"""

    result = gemini_client.generate_json(prompt, max_tokens=1024, model="gemini-2.5-flash-lite")

    if result and "ranked_deal_ids" in result:
        return jsonify(result), 200

    # Fallback: sort by ROI
    sorted_ids = [d.id for d in sorted(deals, key=lambda x: x.expected_return_pct, reverse=True)]
    return jsonify({
        "ranked_deal_ids": sorted_ids,
        "reasoning": "Ranked by highest ROI (AI unavailable — set GEMINI_API_KEY).",
    }), 200


# ─────────────────────────────────────────────────
# 3. DEAL EXPLAINER
#    Explain a deal in plain, investor-friendly language.
# ─────────────────────────────────────────────────
@ai_bp.route("/explain-deal", methods=["POST"])
def explain_deal():
    data = request.get_json()
    deal_id = data.get("deal_id")

    if not deal_id:
        return jsonify({"error": "'deal_id' is required"}), 400

    deal = Deal.query.get(deal_id)
    if not deal:
        return jsonify({"error": "Deal not found"}), 404

    farm = Farm.query.get(deal.farm_id)

    prompt = f"""You are an agricultural investment advisor explaining a deal to a new investor.

Deal details:
- Farm: {farm.name if farm else 'Unknown'} in {farm.governorate if farm else 'Unknown'}
- Crop: {farm.crop_type if farm else 'Unknown'}
- Investment model: {deal.model_type}
- Funding goal: EGP {deal.goal_egp:,.0f}
- Currently funded: {((deal.funded_egp or 0) / deal.goal_egp * 100):.0f}%
- Expected ROI: {deal.expected_return_pct}%
- Duration: {deal.duration_months} months
- Season: {deal.season or 'not specified'}
- Sustainability score: {farm.sustainability_score if farm else 'N/A'}/100

Write a clear, friendly 3-4 sentence explanation of this deal for a non-expert investor.
Include: what the farm grows, what the money is used for, expected timeline, and what makes it interesting.
Write in simple English. No jargon."""

    explanation = gemini_client.generate(prompt, max_tokens=300, model="gemini-2.0-flash-lite")

    if not explanation:
        explanation = (
            f"This deal involves {farm.crop_type if farm else 'agricultural'} farming at "
            f"{farm.name if farm else 'a verified farm'} in {farm.governorate if farm else 'Egypt'}. "
            f"The goal is EGP {deal.goal_egp:,.0f} with an expected return of {deal.expected_return_pct}% "
            f"over {deal.duration_months} months."
        )

    return jsonify({
        "deal_id": deal.id,
        "explanation": explanation,
    }), 200


# ─────────────────────────────────────────────────
# 4. PORTFOLIO NARRATOR
#    Summarize portfolio performance in natural language.
# ─────────────────────────────────────────────────
@ai_bp.route("/narrate-portfolio", methods=["POST"])
def narrate_portfolio():
    data = request.get_json()
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "'user_id' is required"}), 400

    investments = Investment.query.filter_by(investor_id=int(user_id)).all()
    total = sum(i.amount_egp for i in investments)
    active = [i for i in investments if i.status == "active"]

    # Build context
    inv_details = []
    for inv in investments:
        deal = Deal.query.get(inv.deal_id)
        farm = Farm.query.get(deal.farm_id) if deal else None
        inv_details.append({
            "amount": inv.amount_egp,
            "crop": farm.crop_type if farm else "unknown",
            "farm": farm.name if farm else "unknown",
            "roi": deal.expected_return_pct if deal else 0,
            "status": inv.status,
        })

    prompt = f"""You are a portfolio advisor for an Egyptian agricultural investment platform.

Investor portfolio:
- Total invested: EGP {total:,.0f}
- Active deals: {len(active)}
- Investments: {inv_details}

Write a 3-4 sentence portfolio summary in a warm, professional tone.
Mention: total exposure, diversification, best-performing crop, and a forward-looking note.
Use EGP as currency."""

    narrative = gemini_client.generate(prompt, max_tokens=300, model="gemini-2.0-flash-lite")

    if not narrative:
        narrative = (
            f"You have EGP {total:,.0f} invested across {len(active)} active deal(s). "
            f"Your portfolio is {'well-diversified' if len(active) > 2 else 'concentrated'}. "
            f"Continue monitoring your milestones for updates."
        )

    return jsonify({
        "user_id": int(user_id),
        "narrative": narrative,
    }), 200


# ─────────────────────────────────────────────────
# 5. VOICE TRANSCRIPTION (Groq Whisper)
# ─────────────────────────────────────────────────
@ai_bp.route("/transcribe", methods=["POST"])
def transcribe_voice():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file — send as multipart/form-data with key 'audio'"}), 400

    audio_file = request.files["audio"]
    transcript = groq_client.transcribe(audio_file)

    if transcript is None:
        return jsonify({"error": "Transcription failed — check GROQ_API_KEY"}), 503

    return jsonify({"transcript": transcript}), 200


# ─────────────────────────────────────────────────
# 5b. TEXT REWRITER (post-transcription cleanup)
#     Takes raw farmer text/transcript and produces professional investor update.
# ─────────────────────────────────────────────────
@ai_bp.route("/rewrite-text", methods=["POST"])
def rewrite_text():
    data = request.get_json()
    raw_text = data.get("raw_text", "")
    milestone_id = data.get("milestone_id")

    if not raw_text:
        return jsonify({"error": "'raw_text' is required"}), 400

    prompt = f"""You are an assistant for an agricultural investment platform.

A farmer submitted this raw update (may be in Arabic or informal English):
\"{raw_text}\"

Convert it into a professional, concise English update for investors (2-3 sentences max).
Keep factual details. Do not add information that wasn't in the original.
Return only the rewritten text, nothing else."""

    rewritten = gemini_client.generate(prompt, max_tokens=200, model="gemini-2.0-flash-lite")

    if not rewritten:
        rewritten = f"[Auto-formatted] {raw_text}"

    # If milestone_id provided, persist the AI text
    if milestone_id:
        milestone = Milestone.query.get(milestone_id)
        if milestone:
            milestone.ai_converted_text = rewritten
            db.session.commit()

    return jsonify({
        "original": raw_text,
        "rewritten": rewritten,
        "milestone_id": milestone_id,
    }), 200


# ─────────────────────────────────────────────────
# 6. DEAL VIABILITY CHECKER
#    Score a deal's risk and set ai_viability_flag.
# ─────────────────────────────────────────────────
@ai_bp.route("/score-deal", methods=["POST"])
def score_deal():
    data = request.get_json()
    deal_id = data.get("deal_id")

    if not deal_id:
        return jsonify({"error": "'deal_id' is required"}), 400

    deal = Deal.query.get(deal_id)
    if not deal:
        return jsonify({"error": "Deal not found"}), 404

    farm = Farm.query.get(deal.farm_id)

    prompt = f"""You are an agricultural investment risk analyst for an Egyptian/African market platform.

Analyze this deal and return a JSON object:

Deal data:
- Farm: {farm.name if farm else 'Unknown'} in {farm.governorate if farm else 'Unknown'}
- Crop: {farm.crop_type if farm else 'Unknown'}
- Model: {deal.model_type}
- Goal: EGP {deal.goal_egp:,.0f}
- Expected ROI: {deal.expected_return_pct}%
- Duration: {deal.duration_months} months
- Sustainability score: {farm.sustainability_score if farm else 'N/A'}/100
- Water source: {farm.water_source if farm else 'N/A'}
- Land status: {farm.land_status if farm else 'N/A'}

Return ONLY valid JSON:
{{"flag": "green|yellow|red", "note": "2-sentence analysis", "sentiment": "bull|bear|neutral", "opening_bid_egp": 0.0}}"""

    result = gemini_client.generate_json(prompt, max_tokens=512, model="gemini-2.0-flash")

    if not result:
        score = farm.sustainability_score if farm else 50
        flag = "green" if score >= 85 else ("yellow" if score >= 65 else "red")
        result = {
            "flag": flag,
            "note": f"Rule-based: sustainability score {score}/100. Set GEMINI_API_KEY for AI analysis.",
            "sentiment": "bull" if score >= 85 else ("neutral" if score >= 65 else "bear"),
            "opening_bid_egp": round(deal.goal_egp * 0.18, 2),
        }

    # Persist
    deal.ai_viability_flag = result.get("flag")
    deal.ai_viability_note = result.get("note")
    deal.sentiment = result.get("sentiment", deal.sentiment)
    deal.opening_bid_egp = result.get("opening_bid_egp")

    # Auto-alert on red
    if result.get("flag") == "red":
        alert = Alert(
            deal_id=deal.id,
            flag_reason=result.get("note", "AI flagged as high risk"),
            severity="high",
            ai_reasoning=result.get("note"),
        )
        db.session.add(alert)

    db.session.commit()

    return jsonify({
        "deal_id": deal.id,
        "flag": deal.ai_viability_flag,
        "note": deal.ai_viability_note,
        "opening_bid_egp": deal.opening_bid_egp,
        "sentiment": deal.sentiment,
    }), 200


# ─────────────────────────────────────────────────
# 7. REVENUE ANOMALY DETECTOR
#    Analyze transactions for a deal and flag anomalies.
# ─────────────────────────────────────────────────
@ai_bp.route("/detect-anomalies", methods=["POST"])
def detect_anomalies():
    data = request.get_json()
    deal_id = data.get("deal_id")

    if not deal_id:
        return jsonify({"error": "'deal_id' is required"}), 400

    deal = Deal.query.get(deal_id)
    if not deal:
        return jsonify({"error": "Deal not found"}), 404

    farm = Farm.query.get(deal.farm_id)

    # Gather relevant data
    investments = Investment.query.filter_by(deal_id=deal_id).all()
    milestones = Milestone.query.filter_by(deal_id=deal_id).all()
    transactions = Transaction.query.filter_by(deal_id=deal_id).all()

    context = {
        "farm": farm.name if farm else "Unknown",
        "crop": farm.crop_type if farm else "Unknown",
        "deal_goal": deal.goal_egp,
        "funded": deal.funded_egp or 0,
        "expected_roi": deal.expected_return_pct,
        "duration_months": deal.duration_months,
        "num_investors": len(investments),
        "total_invested": sum(i.amount_egp for i in investments),
        "milestones_completed": sum(1 for m in milestones if m.status == "completed"),
        "milestones_total": len(milestones),
        "transactions": [{"type": t.type, "amount": t.amount_egp, "date": t.created_at.isoformat()} for t in transactions],
    }

    prompt = f"""You are a financial anomaly detection AI for an agricultural investment platform.

Analyze this deal for revenue anomalies, suspicious patterns, or red flags:
{context}

Check for:
- Unusually large single investments
- Funding exceeding the goal
- No milestones completed despite time passing
- Suspicious transaction patterns
- ROI promises that seem unrealistic (>50% is suspicious)

Return ONLY valid JSON:
{{"anomalies_found": true|false, "anomalies": ["description 1", "description 2"], "risk_level": "low|medium|high", "recommendation": "brief recommendation"}}"""

    result = gemini_client.generate_json(prompt, max_tokens=2048, model="gemini-2.5-flash")

    if not result:
        result = {
            "anomalies_found": False,
            "anomalies": [],
            "risk_level": "low",
            "recommendation": "AI anomaly detection unavailable — set GEMINI_API_KEY to enable.",
        }

    # Auto-create alert if anomalies found
    if result.get("anomalies_found") and result.get("risk_level") in ("medium", "high"):
        alert = Alert(
            deal_id=deal.id,
            flag_reason="; ".join(result.get("anomalies", ["Revenue anomaly detected"])),
            severity=result.get("risk_level", "medium"),
            ai_reasoning=result.get("recommendation"),
        )
        db.session.add(alert)
        db.session.commit()

        # Fire n8n revenue-anomaly workflow (async, non-blocking)
        from app.ai import n8n_client
        n8n_client.notify_revenue_anomaly(
            deal_id=deal.id,
            farm_name=farm.name if farm else "Unknown",
            anomalies=result.get("anomalies", []),
            risk_level=result.get("risk_level", "medium"),
            recommendation=result.get("recommendation", ""),
        )

    return jsonify({"deal_id": deal_id, **result}), 200


# ─────────────────────────────────────────────────
# 8. IN-APP AI HELPER (chatbot)
#    Answers investor/farmer questions about the platform.
# ─────────────────────────────────────────────────
@ai_bp.route("/chat", methods=["POST"])
def ai_chat():
    data = request.get_json()
    message = data.get("message", "")
    user_id = data.get("user_id")

    if not message:
        return jsonify({"error": "'message' is required"}), 400

    # Build user context if available
    user_context = ""
    if user_id:
        user = User.query.get(user_id)
        if user:
            inv_count = Investment.query.filter_by(investor_id=user.id).count()
            user_context = f"""
User context:
- Name: {user.name}
- Role: {user.role}
- Governorate: {user.governorate or 'unknown'}
- Investor profile: {user.investor_profile or 'not set'}
- Number of investments: {inv_count}"""

    system_prompt = f"""You are Keheilan AI, a helpful assistant for the Keheilan agricultural investment platform in Egypt.

The platform allows:
- Investors to browse and invest in verified farm deals (fractional investing)
- Farmers to register farms and submit progress updates
- Admins to approve farms and monitor risk alerts
- All amounts are in Egyptian Pounds (EGP)
{user_context}

Give a helpful, concise answer (2-4 sentences). Be friendly and professional.
If you don't know something specific, suggest they check the relevant section of the app."""

    # Use Groq (LLaMA 3.3 70B) for chat — 14,400 req/day free tier, independent of Gemini quota
    reply = groq_client.chat(system_prompt, message, max_tokens=512)

    if not reply:
        reply = (
            "I'm the Keheilan AI assistant, but I'm currently offline. "
            "Please check the Dashboard for stats, Explore Farms for investments, "
            "or contact support for help."
        )

    return jsonify({"reply": reply}), 200
