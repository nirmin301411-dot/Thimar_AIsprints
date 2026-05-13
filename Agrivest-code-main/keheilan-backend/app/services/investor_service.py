# =============================================================================
# app/services/investor_service.py
# Business logic for investor portfolio, deal investment, and wallet summary.
# Used by: investor.py routes
# =============================================================================

from datetime import datetime, timedelta
from flask import abort
from app.config.database import db
from app.models.investment import Investment
from app.models.deal import Deal
from app.models.transaction import Transaction
from app.models.user import User
from app.services import wallet_service


def get_portfolio(investor_id: int) -> dict:
    """
    Build a full portfolio summary for an investor:
    - total invested
    - estimated current value (pro-rated ROI)
    - all investment records with deal details
    """
    investments = Investment.query.filter_by(
        investor_id=investor_id
    ).order_by(Investment.invested_at.desc()).all()

    total_invested = sum(inv.amount_egp for inv in investments)
    current_value = 0.0
    details = []

    for inv in investments:
        deal = Deal.query.get(inv.deal_id)
        if deal:
            months_elapsed = (datetime.utcnow() - inv.invested_at).days / 30
            pro_rated_roi = (deal.expected_return_pct / 100) * min(
                months_elapsed / deal.duration_months, 1.0
            )
            est_value = round(inv.amount_egp * (1 + pro_rated_roi), 2)
        else:
            est_value = inv.amount_egp

        current_value += est_value
        details.append({
            "investment": inv.to_dict(),
            "deal": deal.to_dict() if deal else None,
            "estimated_value": est_value,
        })

    roi_pct = round(
        ((current_value - total_invested) / total_invested * 100), 2
    ) if total_invested > 0 else 0.0

    return {
        "total_invested": total_invested,
        "current_value": round(current_value, 2),
        "total_roi_pct": roi_pct,
        "active_deals": len([i for i in investments if i.status == "active"]),
        "investments": [i.to_dict() for i in investments],  # flat list matching frontend Investment[]
    }


def invest_in_deal(investor_id: int, deal_id: int, amount: float) -> Investment:
    """
    Place an investment in a deal:
    1. Validate balance and deal availability
    2. Create Investment record
    3. Record allocation Transaction
    4. Update deal.funded_egp
    """
    if amount <= 0:
        abort(400, description="Investment amount must be positive")

    deal = Deal.query.get(deal_id)
    if not deal:
        abort(404, description="Deal not found")

    if deal.status not in ("fundraising", "active"):
        abort(400, description="This deal is not open for investment")

    if amount < deal.min_ticket_egp:
        abort(400, description=f"Minimum investment is EGP {deal.min_ticket_egp}")

    # Check wallet balance
    balance = wallet_service.get_balance(investor_id)
    if balance < amount:
        abort(400, description=f"Insufficient balance. Wallet: EGP {balance}")

    try:
        investment = Investment(
            investor_id=investor_id,
            deal_id=deal_id,
            amount_egp=amount,
            status="active",
            expected_return_date=datetime.utcnow() + timedelta(
                days=deal.duration_months * 30
            ),
        )
        db.session.add(investment)

        # Record the allocation transaction
        tx = Transaction(
            user_id=investor_id,
            type="allocation",
            amount_egp=amount,
            deal_id=deal_id,
            status="completed",
            note=f"Investment in deal #{deal_id}",
        )
        db.session.add(tx)

        # Update funded amount
        deal.funded_egp = (deal.funded_egp or 0) + amount

        db.session.commit()
        return investment
    except Exception:
        db.session.rollback()
        abort(500, description="Investment transaction failed — rolled back")


def get_wallet_summary(investor_id: int) -> dict:
    """Return wallet balance and recent transaction history."""
    balance = wallet_service.get_balance(investor_id)
    transactions = wallet_service.get_transaction_history(investor_id)
    return {
        "balance_egp": balance,
        "history": [t.to_dict() for t in transactions],
    }
