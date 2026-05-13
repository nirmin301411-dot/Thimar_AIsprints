# =============================================================================
# app/services/admin_service.py  (was admin_sevice.py — typo preserved as alias)
# Business logic for all admin operations.
# Used by: admin.py routes
# =============================================================================

from datetime import datetime
from app.config.database import db
from app.models.user import User
from app.models.farm import Farm
from app.models.deal import Deal
from app.models.investment import Investment
from app.models.alert import Alert

DEAL_STAGE_ORDER = [
    "fundraising",
    "active",
    "harvest",
    "closed",
]


class AdminService:

    # ─────────────────────────────────────────────
    #  PLATFORM ANALYTICS
    # ─────────────────────────────────────────────

    @staticmethod
    def get_platform_analytics() -> dict:
        """Aggregate platform-wide KPIs from the database."""
        total_aum = db.session.query(
            db.func.sum(Investment.amount_egp)
        ).filter_by(status="active").scalar() or 0.0

        active_deals = Deal.query.filter(
            Deal.status.in_(["fundraising", "active"])
        ).count()

        total_investors = User.query.filter_by(role="investor").count()
        total_farmers = User.query.filter_by(role="farmer").count()
        pending_farms = Farm.query.filter_by(status="pending").count()
        open_alerts = Alert.query.filter_by(status="open").count()

        return {
            "generated_at": datetime.utcnow().isoformat(),
            # Flat keys — match frontend AdminStats interface exactly
            "total_users": User.query.count(),
            "total_farms": Farm.query.count(),
            "total_deals": Deal.query.count(),
            "total_invested_egp": round(float(total_aum), 2),
            "open_alerts": Alert.query.filter_by(status="open").count(),
            "pending_farms": Farm.query.filter_by(status="pending").count(),
        }

    # ─────────────────────────────────────────────
    #  DEAL PIPELINE
    # ─────────────────────────────────────────────

    @staticmethod
    def get_deals(status: str = None) -> dict:
        """Return all deals, optionally filtered by status."""
        query = Deal.query
        if status:
            query = query.filter_by(status=status)
        deals = query.order_by(Deal.created_at.desc()).all()
        return {"status_filter": status, "total": len(deals), "data": [d.to_dict() for d in deals]}

    @staticmethod
    def advance_deal_stage(deal_id: int, action: str, admin_note: str = "") -> tuple:
        """
        Approve → advance to next stage in DEAL_STAGE_ORDER.
        Reject  → set status to 'closed'.
        """
        deal = Deal.query.get(deal_id)
        if not deal:
            return {"error": f"Deal {deal_id} not found"}, 404

        if action == "reject":
            deal.status = "closed"
        elif action == "approve":
            try:
                idx = DEAL_STAGE_ORDER.index(deal.status)
                deal.status = DEAL_STAGE_ORDER[min(idx + 1, len(DEAL_STAGE_ORDER) - 1)]
            except ValueError:
                deal.status = "active"

        db.session.commit()
        return {"message": f"Deal {deal_id} {action}d", "deal": deal.to_dict()}, 200

    # ─────────────────────────────────────────────
    #  ALERT MANAGEMENT
    # ─────────────────────────────────────────────

    @staticmethod
    def get_alerts(status: str = "open", severity: str = None) -> dict:
        """Fetch alerts filtered by status and optionally severity."""
        query = Alert.query
        if status and status != "all":
            query = query.filter_by(status=status)
        if severity:
            query = query.filter_by(severity=severity)
        alerts = query.order_by(Alert.created_at.desc()).all()
        return {"status_filter": status, "total": len(alerts), "data": [a.to_dict() for a in alerts]}

    @staticmethod
    def resolve_alert(alert_id: int, note: str = "") -> tuple:
        """Mark an alert as resolved."""
        alert = Alert.query.get(alert_id)
        if not alert:
            return {"error": f"Alert {alert_id} not found"}, 404
        alert.status = "resolved"
        alert.resolved_at = datetime.utcnow()
        db.session.commit()
        return {"message": f"Alert {alert_id} resolved", "alert": alert.to_dict()}, 200

    # ─────────────────────────────────────────────
    #  FARM APPROVAL
    # ─────────────────────────────────────────────

    @staticmethod
    def approve_farm(farm_id: int) -> tuple:
        farm = Farm.query.get(farm_id)
        if not farm:
            return {"error": "Farm not found"}, 404
        farm.status = "approved"
        db.session.commit()
        return {"message": f"Farm '{farm.name}' approved", "farm": farm.to_dict()}, 200

    @staticmethod
    def reject_farm(farm_id: int) -> tuple:
        farm = Farm.query.get(farm_id)
        if not farm:
            return {"error": "Farm not found"}, 404
        farm.status = "rejected"
        db.session.commit()
        return {"message": f"Farm '{farm.name}' rejected", "farm": farm.to_dict()}, 200
