# =============================================================================
# app/services/wallet_service.py
# Business logic for wallet balance calculation and transaction recording.
# Used by: investor_service.py, investor.py routes
# No separate Wallet model — balance is derived from Transaction records.
# =============================================================================

from flask import abort
from app.config.database import db
from app.models.transaction import Transaction
from app.models.user import User


def get_balance(user_id: int) -> float:
    """
    Calculate wallet balance from transaction history.
    deposits + returns - allocations - withdrawals
    """
    transactions = Transaction.query.filter_by(
        user_id=user_id, status="completed"
    ).all()

    balance = 0.0
    for tx in transactions:
        if tx.type in ("deposit", "return"):
            balance += tx.amount_egp
        elif tx.type in ("allocation", "withdrawal"):
            balance -= tx.amount_egp

    return round(balance, 2)


def deposit_funds(user_id: int, amount: float) -> Transaction:
    """Record a deposit and return the transaction."""
    if amount <= 0:
        abort(400, description="Deposit amount must be positive")

    user = User.query.get(user_id)
    if not user:
        abort(404, description="User not found")

    tx = Transaction(
        user_id=user_id,
        type="deposit",
        amount_egp=amount,
        status="completed",
        note="Wallet top-up",
    )
    db.session.add(tx)
    db.session.commit()
    return tx


def withdraw_funds(user_id: int, amount: float) -> Transaction:
    """Record a withdrawal after checking sufficient balance."""
    if amount <= 0:
        abort(400, description="Withdrawal amount must be positive")

    balance = get_balance(user_id)
    if balance < amount:
        abort(400, description=f"Insufficient funds. Balance: EGP {balance}")

    tx = Transaction(
        user_id=user_id,
        type="withdrawal",
        amount_egp=amount,
        status="completed",
        note="Withdrawal request",
    )
    db.session.add(tx)
    db.session.commit()
    return tx


def get_transaction_history(user_id: int) -> list:
    """Return all transactions for a user, newest first."""
    return Transaction.query.filter_by(user_id=user_id).order_by(
        Transaction.created_at.desc()
    ).all()
