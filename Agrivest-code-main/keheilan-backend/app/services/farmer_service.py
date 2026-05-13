# =============================================================================
# app/services/farmer_service.py
# Business logic for farmer operations: milestone management and farm updates.
# Used by: farmer.py routes
# =============================================================================

from datetime import datetime
from flask import abort
from app.config.database import db
from app.models.farm import Farm
from app.models.milestone import Milestone
from app.models.deal import Deal
from app.models.transaction import Transaction


def submit_milestone(farmer_id: int, farm_id: int, deal_id: int, raw_input: str, milestone_type: str, photo_url: str = None) -> Milestone:
    """Submit a new farm progress milestone."""
    # Verify the farm belongs to this farmer
    farm = Farm.query.filter_by(id=farm_id, operator_id=farmer_id).first()
    if not farm:
        abort(403, description="Farm not found or you are not authorized to update it")

    # Basic AI summary fallback (real AI conversion happens in /ai/convert-milestone)
    milestone = Milestone(
        farm_id=farm_id,
        deal_id=deal_id,
        type=milestone_type,
        raw_input=raw_input,
        ai_converted_text=None,  # populated later by /ai/convert-milestone
        photo_url=photo_url,
        status="pending",
    )
    db.session.add(milestone)
    db.session.commit()
    return milestone


def complete_milestone(farmer_id: int, milestone_id: int) -> Milestone:
    """Mark a milestone as completed (farmer-side action)."""
    milestone = Milestone.query.get(milestone_id)
    if not milestone:
        abort(404, description="Milestone not found")

    # Verify ownership through farm
    farm = Farm.query.filter_by(id=milestone.farm_id, operator_id=farmer_id).first()
    if not farm:
        abort(403, description="Not authorized to update this milestone")

    if milestone.status == "completed":
        abort(400, description="Milestone is already completed")

    milestone.status = "completed"
    milestone.verified_at = datetime.utcnow()
    db.session.commit()
    return milestone


def get_farmer_disbursements(farmer_id: int) -> list:
    """Return all return/disbursement transactions for a farmer."""
    transactions = Transaction.query.filter_by(
        user_id=farmer_id, type="return"
    ).order_by(Transaction.created_at.desc()).all()
    return transactions


def get_farmer_farms(farmer_id: int) -> list:
    """Return all farms registered by a specific farmer."""
    return Farm.query.filter_by(operator_id=farmer_id).order_by(Farm.created_at.desc()).all()


def get_farmer_milestones(farmer_id: int) -> list:
    """Return all milestones across all of a farmer's farms."""
    farm_ids = [f.id for f in Farm.query.filter_by(operator_id=farmer_id).all()]
    if not farm_ids:
        return []
    return Milestone.query.filter(
        Milestone.farm_id.in_(farm_ids)
    ).order_by(Milestone.submitted_at.desc()).all()
