# =============================================================================
# app/routes/investor.py
# Investor-facing routes: deal browsing, investing, portfolio, wallet, transactions.
# =============================================================================

from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from app.config.database import db
from app.models.deal import Deal
from app.models.investment import Investment
from app.models.transaction import Transaction
from app.models.user import User
from app.services import investor_service, wallet_service, deal_service

investor_bp = Blueprint("investor_bp", __name__, url_prefix="/investor")


# List all deals — supports optional ?farm_id=X and ?status=X filters
@investor_bp.route("/deals", methods=["GET"])
def list_deals():
    query = Deal.query
    farm_id = request.args.get("farm_id")
    status = request.args.get("status")

    if farm_id:
        query = query.filter_by(farm_id=int(farm_id))
    if status:
        query = query.filter_by(status=status)
    else:
        query = query.filter(Deal.status.in_(["fundraising", "active"]))

    deals = query.order_by(Deal.created_at.desc()).all()
    return jsonify([d.to_dict() for d in deals]), 200


# Get a single deal by ID
@investor_bp.route("/deals/<int:deal_id>", methods=["GET"])
def get_deal(deal_id):
    deal = Deal.query.get(deal_id)
    if not deal:
        return jsonify({"error": "Deal not found"}), 404
    return jsonify(deal.to_dict()), 200


# Create a new deal (admin/farmer creates a funding opportunity)
@investor_bp.route("/deals", methods=["POST"])
def create_deal():
    data = request.get_json()

    required = ["farm_id", "model_type", "goal_egp", "min_ticket_egp",
                "expected_return_pct", "duration_months"]
    for field in required:
        if data.get(field) is None:
            return jsonify({"error": f"'{field}' is required"}), 400

    deal = Deal(
        farm_id=data["farm_id"],
        model_type=data["model_type"],
        goal_egp=float(data["goal_egp"]),
        min_ticket_egp=float(data["min_ticket_egp"]),
        expected_return_pct=float(data["expected_return_pct"]),
        duration_months=int(data["duration_months"]),
        season=data.get("season"),
    )
    db.session.add(deal)
    db.session.commit()
    return jsonify(deal.to_dict()), 201


# Update deal status
@investor_bp.route("/deals/<int:deal_id>/status", methods=["PATCH"])
def update_deal_status(deal_id):
    deal = Deal.query.get(deal_id)
    if not deal:
        return jsonify({"error": "Deal not found"}), 404

    data = request.get_json()
    valid = {"fundraising", "active", "harvest", "closed"}
    if data.get("status") not in valid:
        return jsonify({"error": f"status must be one of: {', '.join(valid)}"}), 400

    deal.status = data["status"]
    db.session.commit()

    # Fire n8n deal-closed workflow when deal is closed
    if deal.status == "closed":
        from app.ai import n8n_client
        from app.models.farm import Farm
        farm = Farm.query.get(deal.farm_id)
        n8n_client.notify_deal_closed(
            deal_id=deal.id,
            farm_name=farm.name if farm else "Unknown",
            goal_egp=deal.goal_egp,
            funded_egp=deal.funded_egp or 0,
            expected_return_pct=deal.expected_return_pct,
            duration_months=deal.duration_months,
        )

    return jsonify(deal.to_dict()), 200


# Investor places an investment in a deal (delegates to investor_service)
@investor_bp.route("/invest", methods=["POST"])
def invest():
    data = request.get_json()
    required = ["investor_id", "deal_id", "amount_egp"]
    for field in required:
        if data.get(field) is None:
            return jsonify({"error": f"'{field}' is required"}), 400

    investment = investor_service.invest_in_deal(
        investor_id=data["investor_id"],
        deal_id=data["deal_id"],
        amount=float(data["amount_egp"]),
    )

    # Check if this investment brought the deal to its funding goal
    deal = Deal.query.get(data["deal_id"])
    if deal and deal.funded_egp and deal.funded_egp >= deal.goal_egp:
        from app.ai import n8n_client
        from app.models.farm import Farm
        farm = Farm.query.get(deal.farm_id)
        n8n_client.notify_deal_funded(
            deal_id=deal.id,
            farm_name=farm.name if farm else "Unknown",
            goal_egp=deal.goal_egp,
            funded_egp=deal.funded_egp,
            num_investors=Investment.query.filter_by(deal_id=deal.id).count(),
        )

    return jsonify(investment.to_dict()), 201


# Get portfolio summary (delegates to investor_service)
@investor_bp.route("/portfolio", methods=["GET"])
def get_portfolio():
    investor_id = request.args.get("investor_id")
    if not investor_id:
        return jsonify({"error": "'investor_id' is required"}), 400
    return jsonify(investor_service.get_portfolio(int(investor_id))), 200


# List all investments for an investor
@investor_bp.route("/investments", methods=["GET"])
def list_investments():
    investor_id = request.args.get("investor_id")
    if not investor_id:
        return jsonify({"error": "'investor_id' is required"}), 400

    investments = Investment.query.filter_by(
        investor_id=int(investor_id)
    ).order_by(Investment.invested_at.desc()).all()

    return jsonify([i.to_dict() for i in investments]), 200


# Get a single investment
@investor_bp.route("/investments/<int:investment_id>", methods=["GET"])
def get_investment(investment_id):
    inv = Investment.query.get(investment_id)
    if not inv:
        return jsonify({"error": "Investment not found"}), 404
    return jsonify(inv.to_dict()), 200


# Get wallet balance (deposits minus allocations minus withdrawals)
@investor_bp.route("/wallet", methods=["GET"])
def get_wallet():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "'user_id' is required"}), 400

    transactions = Transaction.query.filter_by(
        user_id=int(user_id), status="completed"
    ).all()

    balance = 0.0
    for tx in transactions:
        if tx.type in ("deposit", "return"):
            balance += tx.amount_egp
        elif tx.type in ("allocation", "withdrawal"):
            balance -= tx.amount_egp

    return jsonify({"user_id": int(user_id), "balance_egp": round(balance, 2)}), 200


# List all transactions for a user
@investor_bp.route("/transactions", methods=["GET"])
def list_transactions():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "'user_id' is required"}), 400

    transactions = Transaction.query.filter_by(
        user_id=int(user_id)
    ).order_by(Transaction.created_at.desc()).all()

    return jsonify([t.to_dict() for t in transactions]), 200


# Deposit funds into wallet (delegates to wallet_service)
@investor_bp.route("/deposit", methods=["POST"])
def deposit():
    data = request.get_json()
    if not data.get("user_id") or not data.get("amount_egp"):
        return jsonify({"error": "'user_id' and 'amount_egp' are required"}), 400
    tx = wallet_service.deposit_funds(data["user_id"], float(data["amount_egp"]))
    return jsonify(tx.to_dict()), 201


# Withdraw funds from wallet (delegates to wallet_service)
@investor_bp.route("/withdraw", methods=["POST"])
def withdraw():
    data = request.get_json()
    if not data.get("user_id") or not data.get("amount_egp"):
        return jsonify({"error": "'user_id' and 'amount_egp' are required"}), 400
    tx = wallet_service.withdraw_funds(data["user_id"], float(data["amount_egp"]))
    return jsonify(tx.to_dict()), 201
