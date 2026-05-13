from flask import Blueprint, request, jsonify, session
from app import db
from app.models.user import User

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/auth")

VALID_ROLES = {"investor", "farmer", "admin"}


# Register a new user and store their session
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    # Validate required fields
    required = ["name", "phone", "national_id", "password", "role"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"'{field}' is required"}), 400

    if data["role"] not in VALID_ROLES:
        return jsonify({"error": f"role must be one of: {', '.join(VALID_ROLES)}"}), 400

    # Check for duplicate phone or national_id
    if User.query.filter_by(phone=data["phone"]).first():
        return jsonify({"error": "Phone number already registered"}), 409

    if User.query.filter_by(national_id=data["national_id"]).first():
        return jsonify({"error": "National ID already registered"}), 409

    user = User(
        name=data["name"],
        phone=data["phone"],
        national_id=data["national_id"],
        password=data["password"],  # plain text — prototype only
        role=data["role"],
        governorate=data.get("governorate"),
    )
    db.session.add(user)
    db.session.commit()

    session["user_id"] = user.id
    session["user_role"] = user.role

    # Fire n8n KYC alert workflow (async, non-blocking)
    from app.ai import n8n_client
    n8n_client.notify_kyc_submitted(
        user_id=user.id,
        name=user.name,
        phone=user.phone,
        national_id=user.national_id,
        role=user.role,
        governorate=user.governorate,
    )

    return jsonify({
        "user_id": user.id,
        "name": user.name,
        "role": user.role,
        "governorate": user.governorate,
        "message": "Registered successfully",
    }), 201


# Authenticate user by phone + password and store session
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data.get("phone") or not data.get("password"):
        return jsonify({"error": "'phone' and 'password' are required"}), 400

    user = User.query.filter_by(phone=data["phone"]).first()

    if not user or user.password != data["password"]:
        return jsonify({"error": "Invalid phone or password"}), 401

    session["user_id"] = user.id
    session["user_role"] = user.role

    return jsonify({
        "user_id": user.id,
        "name": user.name,
        "role": user.role,
        "governorate": user.governorate,
        "investor_profile": user.investor_profile,
    }), 200


# Clear the session and log the user out
@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"}), 200


# Save onboarding quiz answers and set a default investor profile
@auth_bp.route("/onboarding", methods=["POST"])
def onboarding():
    data = request.get_json()

    user_id = data.get("user_id")
    answers = data.get("answers")

    if not user_id:
        return jsonify({"error": "'user_id' is required"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # AI classification will refine this later — default to 'balanced' for now
    user.investor_profile = "balanced"
    db.session.commit()

    return jsonify({
        "message": "Onboarding complete",
        "user_id": user.id,
    }), 200


# Return the full user object for the given user_id
@auth_bp.route("/me", methods=["GET"])
def me():
    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({"error": "'user_id' query param is required"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(user.to_dict()), 200


@app.route('/')
def welcome():
    return "The server is working perfectly!"
