"""
Bots API endpoints.
"""
from fastapi import APIRouter, HTTPException
from core.engine import engine
from models.database import SessionLocal
from models.trade import Trade
from sqlalchemy import desc

router = APIRouter()


@router.get("")
async def list_bots():
    """List all bots with their status."""
    bots_data = []
    
    for bot in engine.bots:
        status = bot.get_status()
        bots_data.append(status)
    
    return bots_data


@router.get("/{bot_id}")
async def get_bot(bot_id: str):
    """Get bot details and performance."""
    bot = engine.get_bot_by_id(bot_id)
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    
    return bot.get_status()


@router.post("/{bot_id}/toggle")
async def toggle_bot(bot_id: str):
    """Start or pause a bot."""
    bot = engine.get_bot_by_id(bot_id)
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    
    bot.toggle()
    return {"status": bot.status}


@router.get("/{bot_id}/trades")
async def get_bot_trades(bot_id: str, limit: int = 20):
    """Get trade history for a bot."""
    db = SessionLocal()
    try:
        trades = db.query(Trade).filter(
            Trade.bot_id == bot_id
        ).order_by(desc(Trade.timestamp)).limit(limit).all()
        
        return [
            {
                "id": t.id,
                "timestamp": t.timestamp.isoformat(),
                "symbol": t.symbol,
                "direction": t.direction,
                "quantity": t.quantity,
                "entry_price": t.entry_price,
                "exit_price": t.exit_price,
                "realized_pnl": t.realized_pnl,
                "status": t.status,
                "entry_reason": t.entry_reason,
                "exit_reason": t.exit_reason
            }
            for t in trades
        ]
    finally:
        db.close()
