from datetime import datetime
from app import db


class Deal(db.Model):
    __tablename__ = "deals"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    farm_id = db.Column(db.Integer, db.ForeignKey("farms.id"), nullable=False)
    # One of: 'land', 'operations', 'hybrid'
    model_type = db.Column(db.String(20), nullable=False)
    goal_egp = db.Column(db.Float, nullable=False)
    funded_egp = db.Column(db.Float, default=0.0)
    min_ticket_egp = db.Column(db.Float, nullable=False)
    expected_return_pct = db.Column(db.Float, nullable=False)
    duration_months = db.Column(db.Integer, nullable=False)
    # One of: 'shitawi', 'seifi'
    season = db.Column(db.String(20), nullable=True)
    # One of: 'fundraising', 'active', 'harvest', 'closed'
    status = db.Column(db.String(20), default="fundraising")
    # One of: 'bull', 'bear', 'neutral'
    sentiment = db.Column(db.String(10), default="neutral")
    # AI-generated auction opening bid
    opening_bid_egp = db.Column(db.Float, nullable=True)
    # One of: 'green', 'yellow', 'red'
    ai_viability_flag = db.Column(db.String(10), nullable=True)
    # AI-generated internal note
    ai_viability_note = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    investments = db.relationship("Investment", backref="deal", lazy=True)
    milestones = db.relationship("Milestone", backref="deal", lazy=True, foreign_keys="Milestone.deal_id")
    alerts = db.relationship("Alert", backref="deal", lazy=True)
    transactions = db.relationship("Transaction", backref="deal", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "farm_id": self.farm_id,
            "model_type": self.model_type,
            "goal_egp": self.goal_egp,
            "funded_egp": self.funded_egp,
            "min_ticket_egp": self.min_ticket_egp,
            "expected_return_pct": self.expected_return_pct,
            "duration_months": self.duration_months,
            "season": self.season,
            "status": self.status,
            "sentiment": self.sentiment,
            "opening_bid_egp": self.opening_bid_egp,
            "ai_viability_flag": self.ai_viability_flag,
            "ai_viability_note": self.ai_viability_note,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
