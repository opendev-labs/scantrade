"""
Logs API endpoints.
"""
from fastapi import APIRouter
from models.database import SessionLocal
from models.trade import Trade
from models.signal import Signal
from sqlalchemy import desc

router = APIRouter()


@router.get("/trades")
async def get_trade_logs(limit: int = 50):
    """Get trade execution logs."""
    db = SessionLocal()
    try:
        trades = db.query(Trade).order_by(desc(Trade.timestamp)).limit(limit).all()
        
        return [
            {
                "id": t.id,
                "timestamp": t.timestamp.isoformat(),
                "type": "trade",
                "symbol": t.symbol,
                "direction": t.direction,
                "quantity": t.quantity,
                "price": t.entry_price if t.direction == "buy" else t.exit_price,
                "pnl": t.realized_pnl,
                "bot_id": t.bot_id,
                "status": t.status,
                "reason": t.entry_reason if t.direction == "buy" else t.exit_reason
            }
            for t in trades
        ]
    finally:
        db.close()


@router.get("/signals")
async def get_signal_logs(limit: int = 50):
    """Get scanner signal logs."""
    db = SessionLocal()
    try:
        signals = db.query(Signal).order_by(desc(Signal.timestamp)).limit(limit).all()
        
        return [
            {
                "id": s.id,
                "timestamp": s.timestamp.isoformat(),
                "type": "signal",
                "scanner_id": s.scanner_id,
                "scanner_name": s.scanner_name,
                "symbol": s.symbol,
                "signal_type": s.signal_type,
                "confidence": s.confidence,
                "price": s.price,
                "condition": s.condition
            }
            for s in signals
        ]
    finally:
        db.close()


@router.get("/system")
async def get_system_logs(limit: int = 50):
    """Get system event logs."""
    # For now, return a placeholder
    # In production, you'd have a separate SystemLog model
    return [
        {
            "id": 1,
            "timestamp": "2026-01-04T18:00:00Z",
            "type": "system",
            "level": "INFO",
            "message": "Trading engine started"
        }
    ]
