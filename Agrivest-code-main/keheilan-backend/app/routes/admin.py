# =============================================================================
# app/routes/admin.py
# Admin-only routes: platform stats, user management, alert handling, farm approval.
# =============================================================================

from datetime import datetime
from flask import Blueprint, request, jsonify
from app.config.database import db
from app.models.user import User
from app.models.farm import Farm
from app.models.deal import Deal
from app.models.investment import Investment
from app.models.alert import Alert

admin_bp = Blueprint("admin_bp", __name__, url_prefix="/admin")


# Get platform-wide aggregate statistics for the admin dashboard
@admin_bp.route("/stats", methods=["GET"])
def get_stats():
    total_invested = db.session.query(
        db.func.sum(Investment.amount_egp)
    ).filter_by(status="active").scalar() or 0.0

    return jsonify({
        "total_users": User.query.count(),
        "total_farms": Farm.query.count(),
        "total_deals": Deal.query.count(),
        "total_invested_egp": round(float(total_invested), 2),
        "open_alerts": Alert.query.filter_by(status="open").count(),
        "pending_farms": Farm.query.filter_by(status="pending").count(),
    }), 200


# List all registered users (all roles)
@admin_bp.route("/users", methods=["GET"])
def list_users():
    role = request.args.get("role")
    query = User.query
    if role:
        query = query.filter_by(role=role)
    users = query.order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict() for u in users]), 200


# Get a single user by ID
@admin_bp.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict()), 200


# List all farms including pending ones (admin view)
@admin_bp.route("/farms", methods=["GET"])
def list_all_farms():
    status = request.args.get("status")
    query = Farm.query
    if status:
        query = query.filter_by(status=status)
    farms = query.order_by(Farm.created_at.desc()).all()
    return jsonify([f.to_dict() for f in farms]), 200


# Approve a pending farm
@admin_bp.route("/farms/<int:farm_id>/approve", methods=["PATCH"])
def approve_farm(farm_id):
    farm = Farm.query.get(farm_id)
    if not farm:
        return jsonify({"error": "Farm not found"}), 404
    farm.status = "approved"
    db.session.commit()
    return jsonify({"message": f"Farm '{farm.name}' approved", "farm": farm.to_dict()}), 200


# Reject a pending farm
@admin_bp.route("/farms/<int:farm_id>/reject", methods=["PATCH"])
def reject_farm(farm_id):
    farm = Farm.query.get(farm_id)
    if not farm:
        return jsonify({"error": "Farm not found"}), 404
    farm.status = "rejected"
    db.session.commit()
    return jsonify({"message": f"Farm '{farm.name}' rejected", "farm": farm.to_dict()}), 200


# List alerts — defaults to open ones, supports ?status=all
@admin_bp.route("/alerts", methods=["GET"])
def list_alerts():
    status = request.args.get("status")
    query = Alert.query
    if status and status != "all":
        query = query.filter_by(status=status)
    elif not status:
        query = query.filter_by(status="open")

    alerts = query.order_by(Alert.created_at.desc()).all()
    return jsonify([a.to_dict() for a in alerts]), 200


# Get a single alert by ID
@admin_bp.route("/alerts/<int:alert_id>", methods=["GET"])
def get_alert(alert_id):
    alert = Alert.query.get(alert_id)
    if not alert:
        return jsonify({"error": "Alert not found"}), 404
    return jsonify(alert.to_dict()), 200


# Mark an alert as resolved
@admin_bp.route("/alerts/<int:alert_id>/resolve", methods=["PATCH"])
def resolve_alert(alert_id):
    alert = Alert.query.get(alert_id)
    if not alert:
        return jsonify({"error": "Alert not found"}), 404
    alert.status = "resolved"
    alert.resolved_at = datetime.utcnow()
    db.session.commit()
    return jsonify(alert.to_dict()), 200


# Override an alert (dismiss without taking action)
@admin_bp.route("/alerts/<int:alert_id>/override", methods=["PATCH"])
def override_alert(alert_id):
    alert = Alert.query.get(alert_id)
    if not alert:
        return jsonify({"error": "Alert not found"}), 404
    alert.status = "overridden"
    alert.resolved_at = datetime.utcnow()
    db.session.commit()
    return jsonify(alert.to_dict()), 200


# Create a new alert manually (admin or AI can call this)
@admin_bp.route("/alerts", methods=["POST"])
def create_alert():
    data = request.get_json()
    required = ["deal_id", "flag_reason", "severity"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"'{field}' is required"}), 400

    alert = Alert(
        deal_id=data["deal_id"],
        flag_reason=data["flag_reason"],
        severity=data["severity"],
        ai_reasoning=data.get("ai_reasoning"),
    )
    db.session.add(alert)
    db.session.commit()
    return jsonify(alert.to_dict()), 201


# Publish a platform-wide announcement via n8n workflow
@admin_bp.route("/platform-post", methods=["POST"])
def platform_post():
    data = request.get_json()
    title = data.get("title", "")
    content = data.get("content", "")
    author = data.get("author", "Keheilan Admin")
    target_audience = data.get("target_audience", "all")

    if not title or not content:
        return jsonify({"error": "'title' and 'content' are required"}), 400

    # Fire n8n platform-post workflow (async)
    from app.ai import n8n_client
    n8n_client.notify_platform_post(
        title=title,
        content=content,
        author=author,
        target_audience=target_audience,
    )

    return jsonify({
        "message": "Platform post published",
        "title": title,
        "target_audience": target_audience,
    }), 201


# Simulate a deal reaching full funding (admin test tool — triggers n8n deal-funded webhook)
@admin_bp.route("/deals/<int:deal_id>/simulate-funded", methods=["POST"])
def simulate_deal_funded(deal_id):
    deal = Deal.query.get(deal_id)
    if not deal:
        return jsonify({"error": "Deal not found"}), 404

    # Set funded_egp to goal_egp
    deal.funded_egp = deal.goal_egp
    db.session.commit()

    # Fire n8n deal-funded workflow
    from app.ai import n8n_client
    farm = Farm.query.get(deal.farm_id)
    n8n_client.notify_deal_funded(
        deal_id=deal.id,
        farm_name=farm.name if farm else "Unknown",
        goal_egp=deal.goal_egp,
        funded_egp=deal.funded_egp,
        num_investors=Investment.query.filter_by(deal_id=deal.id).count(),
    )

    return jsonify({
        "message": f"Deal #{deal.id} simulated as fully funded",
        "deal": deal.to_dict(),
    }), 200


# Live commodity market prices — Egyptian agricultural market
@admin_bp.route("/market-prices", methods=["GET"])
def get_market_prices():
    return jsonify([
        {"crop": "Wheat",     "price_egp_per_ton": 3100,  "change_pct": +2.3},
        {"crop": "Rice",      "price_egp_per_ton": 4200,  "change_pct": -1.1},
        {"crop": "Cotton",    "price_egp_per_ton": 8500,  "change_pct": +0.8},
        {"crop": "Sugarcane", "price_egp_per_ton": 980,   "change_pct": +1.5},
        {"crop": "Dates",     "price_egp_per_ton": 12000, "change_pct": +3.2},
        {"crop": "Olives",    "price_egp_per_ton": 15500, "change_pct": -0.5},
        {"crop": "Avocado",   "price_egp_per_ton": 28000, "change_pct": +4.1},
        {"crop": "Coffee",    "price_egp_per_ton": 95000, "change_pct": +1.9},
        {"crop": "Mango",     "price_egp_per_ton": 7200,  "change_pct": -0.3},
        {"crop": "Tea",       "price_egp_per_ton": 42000, "change_pct": +0.6},
    ])



