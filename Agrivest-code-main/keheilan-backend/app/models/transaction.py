from datetime import datetime
from app import db


class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    # One of: 'deposit', 'allocation', 'return', 'withdrawal'
    type = db.Column(db.String(20), nullable=False)
    amount_egp = db.Column(db.Float, nullable=False)
    # Only set for 'allocation' and 'return' transaction types
    deal_id = db.Column(db.Integer, db.ForeignKey("deals.id"), nullable=True)
    # One of: 'completed', 'pending', 'failed'
    status = db.Column(db.String(20), default="completed")
    note = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "type": self.type,
            "amount_egp": self.amount_egp,
            "deal_id": self.deal_id,
            "status": self.status,
            "note": self.note,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
