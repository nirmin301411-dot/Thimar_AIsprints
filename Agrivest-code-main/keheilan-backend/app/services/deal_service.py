# =============================================================================
# app/services/deal_service.py
# Business logic for deal browsing and ranking.
# Used by: investor.py routes
# =============================================================================

from app.models.deal import Deal
from app.models.farm import Farm


def fetch_active_deals(crop_type: str = None, min_roi: float = None) -> list:
    """Return all fundraising/active deals with optional filters."""
    query = Deal.query.filter(Deal.status.in_(["fundraising", "active"]))

    if crop_type:
        # Join with Farm to filter by crop_type
        query = query.join(Farm, Deal.farm_id == Farm.id).filter(
            Farm.crop_type == crop_type
        )

    if min_roi is not None:
        query = query.filter(Deal.expected_return_pct >= min_roi)

    return query.order_by(Deal.created_at.desc()).all()


def rank_deals_for_user(deals: list, investor_profile: str) -> list:
    """
    Re-rank deals based on investor profile:
    - conservative → prefer lower ROI, shorter duration
    - growth       → prefer higher ROI, longer duration
    - balanced     → sort by ROI (default)
    """
    if investor_profile == "conservative":
        return sorted(deals, key=lambda d: (d.expected_return_pct, d.duration_months))
    elif investor_profile == "growth":
        return sorted(deals, key=lambda d: d.expected_return_pct, reverse=True)
    else:
        return sorted(deals, key=lambda d: d.expected_return_pct, reverse=True)


def get_deal_with_farm(deal_id: int) -> tuple:
    """Return (deal, farm) tuple or (None, None) if not found."""
    deal = Deal.query.get(deal_id)
    if not deal:
        return None, None
    farm = Farm.query.get(deal.farm_id)
    return deal, farm
