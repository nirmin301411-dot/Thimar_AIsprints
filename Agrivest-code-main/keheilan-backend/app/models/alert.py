from datetime import datetime
from app import db


class Alert(db.Model):
    __tablename__ = "alerts"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    deal_id = db.Column(db.Integer, db.ForeignKey("deals.id"), nullable=False)
    # AI-generated explanation of why this deal was flagged
    flag_reason = db.Column(db.Text, nullable=False)
    # One of: 'high', 'medium', 'low'
    severity = db.Column(db.String(10), nullable=False)
    # One of: 'open', 'resolved', 'overridden'
    status = db.Column(db.String(20), default="open")
    # Extended AI reasoning for admin review
    ai_reasoning = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "deal_id": self.deal_id,
            "flag_reason": self.flag_reason,
            "severity": self.severity,
            "status": self.status,
            "ai_reasoning": self.ai_reasoning,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
        }
