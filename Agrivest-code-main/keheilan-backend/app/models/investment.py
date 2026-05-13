from datetime import datetime
from app import db


class Investment(db.Model):
    __tablename__ = "investments"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    investor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    deal_id = db.Column(db.Integer, db.ForeignKey("deals.id"), nullable=False)
    amount_egp = db.Column(db.Float, nullable=False)
    # One of: 'active', 'returned', 'pending'
    status = db.Column(db.String(20), default="active")
    invested_at = db.Column(db.DateTime, default=datetime.utcnow)
    expected_return_date = db.Column(db.DateTime, nullable=True)
    # Filled when deal closes
    actual_return_egp = db.Column(db.Float, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "investor_id": self.investor_id,
            "deal_id": self.deal_id,
            "amount_egp": self.amount_egp,
            "status": self.status,
            "invested_at": self.invested_at.isoformat() if self.invested_at else None,
            "expected_return_date": self.expected_return_date.isoformat() if self.expected_return_date else None,
            "actual_return_egp": self.actual_return_egp,
        }
