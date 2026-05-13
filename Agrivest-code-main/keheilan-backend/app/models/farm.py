from datetime import datetime
from app import db


class Farm(db.Model):
    __tablename__ = "farms"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    operator_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    governorate = db.Column(db.String(100), nullable=False)
    # e.g. 'rice', 'wheat', 'cotton', 'grapes', 'olives'
    crop_type = db.Column(db.String(100), nullable=False)
    land_size_feddans = db.Column(db.Float, nullable=False)
    # One of: 'nile_canal', 'groundwater', 'rain_fed', 'mixed'
    water_source = db.Column(db.String(50), nullable=False)
    # One of: 'owned', 'leased'
    land_status = db.Column(db.String(20), nullable=False)
    # One of: 'pending', 'approved', 'rejected', 'active'
    status = db.Column(db.String(20), default="pending")
    sustainability_score = db.Column(db.Integer, default=50)
    # List of S3 photo URLs stored as JSON
    photo_urls = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    deals = db.relationship("Deal", backref="farm", lazy=True)
    milestones = db.relationship("Milestone", backref="farm", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "operator_id": self.operator_id,
            "name": self.name,
            "governorate": self.governorate,
            "crop_type": self.crop_type,
            "land_size_feddans": self.land_size_feddans,
            "water_source": self.water_source,
            "land_status": self.land_status,
            "status": self.status,
            "sustainability_score": self.sustainability_score,
            "photo_urls": self.photo_urls,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
