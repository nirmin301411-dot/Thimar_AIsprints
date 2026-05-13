# =============================================================================
# app/config/config.py
# Central configuration class for the Keheilan Flask prototype.
# All values are read from environment variables — never hardcode secrets.
# =============================================================================

import os


class Config:
    # PostgreSQL connection string — Railway auto-sets this when PostgreSQL plugin is added.
    # Fix: Railway provides "postgresql://" but SQLAlchemy needs "postgresql+psycopg2://"
    _db_url = os.environ.get("DATABASE_URL", "sqlite:///keheilan.db")
    if _db_url.startswith("postgres://"):
        _db_url = _db_url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif _db_url.startswith("postgresql://"):
        _db_url = _db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
    SQLALCHEMY_DATABASE_URI = _db_url


    # Disable SQLAlchemy event system overhead — not needed for this prototype
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Flask session signing key — change this to a random string in production
    SECRET_KEY = os.environ.get("SECRET_KEY", "keheilan-dev-secret-2026")

    # Gemini API key — free tier from aistudio.google.com
    # Used for: risk profiler, deal ranker, deal explainer, portfolio narrator,
    # text rewriter, viability checker, anomaly detector, in-app helper
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

    # Groq API key — free tier from console.groq.com
    # Used for: Whisper voice transcription (faster than OpenAI)
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

    # AWS S3 bucket name where farm photos are uploaded
    AWS_S3_BUCKET = os.environ.get("AWS_S3_BUCKET")

    # AWS IAM access key — from AWS IAM console, used to authenticate S3 uploads
    AWS_ACCESS_KEY = os.environ.get("AWS_ACCESS_KEY")

    # AWS IAM secret key — paired with AWS_ACCESS_KEY, keep this secret
    AWS_SECRET_KEY = os.environ.get("AWS_SECRET_KEY")

    # Base URL of the N8N cloud instance that handles workflow automations
    N8N_WEBHOOK_BASE_URL = os.environ.get("N8N_WEBHOOK_BASE_URL")

    # Enable Flask debug mode and auto-reloader — set to False in production
    DEBUG = os.environ.get("FLASK_DEBUG", "True") == "True"

    # Allow specific origins for CORS — wildcard '*' is incompatible with credentials (session cookies)
    CORS_ORIGINS = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ]
