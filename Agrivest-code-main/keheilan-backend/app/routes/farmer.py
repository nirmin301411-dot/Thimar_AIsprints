# =============================================================================
# app/routes/farmer.py
# Farmer-facing routes: farm registration, milestone submission, and farm browsing.
# =============================================================================

from flask import Blueprint, request, jsonify
from app.config.database import db
from app.models.farm import Farm
from app.models.milestone import Milestone
from app.models.user import User

farmer_bp = Blueprint("farmer_bp", __name__, url_prefix="/farmer")


# List all farms — supports optional ?operator_id=X and ?status=X filters
@farmer_bp.route("/farms", methods=["GET"])
def list_farms():
    query = Farm.query
    operator_id = request.args.get("operator_id")
    status = request.args.get("status")

    if operator_id:
        query = query.filter_by(operator_id=int(operator_id))
    if status:
        query = query.filter_by(status=status)
    else:
        # Public listing only shows approved or active farms
        query = query.filter(Farm.status.in_(["approved", "active"]))

    farms = query.order_by(Farm.created_at.desc()).all()
    return jsonify([f.to_dict() for f in farms]), 200


# Get a single farm by ID
@farmer_bp.route("/farms/<int:farm_id>", methods=["GET"])
def get_farm(farm_id):
    farm = Farm.query.get(farm_id)
    if not farm:
        return jsonify({"error": "Farm not found"}), 404
    return jsonify(farm.to_dict()), 200


# Register a new farm (farmer submits for admin approval)
@farmer_bp.route("/farms", methods=["POST"])
def create_farm():
    data = request.get_json()

    required = ["operator_id", "name", "governorate", "crop_type",
                "land_size_feddans", "water_source", "land_status"]
    for field in required:
        if data.get(field) is None:
            return jsonify({"error": f"'{field}' is required"}), 400

    # Verify the operator exists and is a farmer
    operator = User.query.get(data["operator_id"])
    if not operator:
        return jsonify({"error": "Operator not found"}), 404
    if operator.role != "farmer":
        return jsonify({"error": "Only farmers can register farms"}), 403

    farm = Farm(
        operator_id=data["operator_id"],
        name=data["name"],
        governorate=data["governorate"],
        crop_type=data["crop_type"],
        land_size_feddans=float(data["land_size_feddans"]),
        water_source=data["water_source"],
        land_status=data["land_status"],
        photo_urls=data.get("photo_urls"),
    )
    db.session.add(farm)
    db.session.commit()
    return jsonify(farm.to_dict()), 201


# Update farm status — admin approves or rejects
@farmer_bp.route("/farms/<int:farm_id>/status", methods=["PATCH"])
def update_farm_status(farm_id):
    farm = Farm.query.get(farm_id)
    if not farm:
        return jsonify({"error": "Farm not found"}), 404

    data = request.get_json()
    valid_statuses = {"pending", "approved", "rejected", "active"}
    new_status = data.get("status")

    if new_status not in valid_statuses:
        return jsonify({"error": f"status must be one of: {', '.join(valid_statuses)}"}), 400

    farm.status = new_status
    db.session.commit()
    return jsonify(farm.to_dict()), 200


# List milestones — supports ?farm_id=X filter
@farmer_bp.route("/milestones", methods=["GET"])
def list_milestones():
    query = Milestone.query
    farm_id = request.args.get("farm_id")
    deal_id = request.args.get("deal_id")

    if farm_id:
        query = query.filter_by(farm_id=int(farm_id))
    if deal_id:
        query = query.filter_by(deal_id=int(deal_id))

    milestones = query.order_by(Milestone.submitted_at.desc()).all()
    return jsonify([m.to_dict() for m in milestones]), 200


# Get a single milestone by ID
@farmer_bp.route("/milestones/<int:milestone_id>", methods=["GET"])
def get_milestone(milestone_id):
    milestone = Milestone.query.get(milestone_id)
    if not milestone:
        return jsonify({"error": "Milestone not found"}), 404
    return jsonify(milestone.to_dict()), 200


# Farmer submits a new progress update
@farmer_bp.route("/milestones", methods=["POST"])
def submit_milestone():
    data = request.get_json()

    required = ["farm_id", "type", "raw_input"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"'{field}' is required"}), 400

    farm = Farm.query.get(data["farm_id"])
    if not farm:
        return jsonify({"error": "Farm not found"}), 404

    milestone = Milestone(
        farm_id=data["farm_id"],
        deal_id=data.get("deal_id"),
        type=data["type"],
        raw_input=data["raw_input"],
        photo_url=data.get("photo_url"),
        status="pending",
    )
    db.session.add(milestone)
    db.session.commit()
    return jsonify(milestone.to_dict()), 201


# Admin verifies a milestone as completed
@farmer_bp.route("/milestones/<int:milestone_id>/verify", methods=["PATCH"])
def verify_milestone(milestone_id):
    from datetime import datetime
    milestone = Milestone.query.get(milestone_id)
    if not milestone:
        return jsonify({"error": "Milestone not found"}), 404

    milestone.status = "completed"
    milestone.verified_at = datetime.utcnow()
    db.session.commit()
    return jsonify(milestone.to_dict()), 200
