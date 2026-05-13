from datetime import datetime
from app import db


class Milestone(db.Model):
    __tablename__ = "milestones"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    farm_id = db.Column(db.Integer, db.ForeignKey("farms.id"), nullable=False)
    # Foreign key to deal — optional, links milestone to a specific deal
    deal_id = db.Column(db.Integer, db.ForeignKey("deals.id"), nullable=True)
    # One of: 'land_prepared', 'seeds_planted', 'mid_season', 'harvest_complete', 'sold'
    type = db.Column(db.String(50), nullable=False)
    # One of: 'pending', 'in_progress', 'completed'
    status = db.Column(db.String(20), default="pending")
    # Original voice transcript or raw messy text from farmer
    raw_input = db.Column(db.Text, nullable=True)
    # AI-cleaned professional update shown to investors
    ai_converted_text = db.Column(db.Text, nullable=True)
    photo_url = db.Column(db.String(500), nullable=True)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    verified_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "farm_id": self.farm_id,
            "deal_id": self.deal_id,
            "type": self.type,
            "status": self.status,
            "raw_input": self.raw_input,
            "ai_converted_text": self.ai_converted_text,
            "photo_url": self.photo_url,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
            "verified_at": self.verified_at.isoformat() if self.verified_at else None,
        }
