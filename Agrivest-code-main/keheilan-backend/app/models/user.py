from datetime import datetime
from app import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    national_id = db.Column(db.String(50), unique=True, nullable=False)
    # Plain-text password — prototype only, do NOT use in production
    password = db.Column(db.String(200), nullable=False)
    # One of: 'investor', 'farmer', 'admin'
    role = db.Column(db.String(20), nullable=False)
    governorate = db.Column(db.String(100), nullable=True)
    # Set after onboarding quiz — one of: 'conservative', 'balanced', 'growth'
    investor_profile = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    farms = db.relationship("Farm", backref="operator", lazy=True)
    investments = db.relationship("Investment", backref="investor", lazy=True)
    transactions = db.relationship("Transaction", backref="user", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.id,  # alias used by frontend AuthContext
            "name": self.name,
            "phone": self.phone,
            "national_id": self.national_id,
            "role": self.role,
            "governorate": self.governorate,
            "investor_profile": self.investor_profile,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
