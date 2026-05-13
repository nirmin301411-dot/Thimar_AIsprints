# =============================================================================
# app/config/database.py
# SQLAlchemy instance and database initializer for the Keheilan prototype.
# Call init_db(app) from the app factory after applying config.
# =============================================================================

from flask_sqlalchemy import SQLAlchemy

# Shared db instance — imported by all model files
db = SQLAlchemy()


def init_db(app):
    """Bind db to the Flask app and create all tables."""

    db.init_app(app)

    # Import all models here so SQLAlchemy registers their table definitions
    # before create_all() is called. Order matters for FK resolution.
    with app.app_context():
        from app.models.user import User          # noqa: F401
        from app.models.farm import Farm          # noqa: F401
        from app.models.deal import Deal          # noqa: F401
        from app.models.investment import Investment  # noqa: F401
        from app.models.milestone import Milestone   # noqa: F401
        from app.models.transaction import Transaction  # noqa: F401
        from app.models.alert import Alert        # noqa: F401

        db.create_all()
        print("Database tables created successfully")
