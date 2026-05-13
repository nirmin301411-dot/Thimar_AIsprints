from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS

# Import db from the dedicated database module
from app.config.database import db


migrate = Migrate()


def create_app():
    app = Flask(__name__)

    # ------------------------------------------------------------------ #
    # Configuration
    # ------------------------------------------------------------------ #
    from app.config.config import Config
    app.config.from_object(Config)

    # ------------------------------------------------------------------ #
    # Extensions
    # ------------------------------------------------------------------ #
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app, origins=app.config["CORS_ORIGINS"], supports_credentials=True)

    # ------------------------------------------------------------------ #
    # Register blueprints
    # ------------------------------------------------------------------ #
    from app.routes.auth import auth_bp
    from app.routes.investor import investor_bp
    from app.routes.farmer import farmer_bp
    from app.routes.admin import admin_bp
    from app.routes.ai import ai_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(investor_bp)
    app.register_blueprint(farmer_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(ai_bp)

    # ------------------------------------------------------------------ #
    # Import all models so Flask-Migrate detects them
    # ------------------------------------------------------------------ #
    with app.app_context():
        from app.models import user, farm, deal, investment, milestone, transaction, alert  # noqa: F401

    return app
