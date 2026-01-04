"""
Scanners API endpoints.
"""
from fastapi import APIRouter, HTTPException
from core.engine import engine
from models.database import SessionLocal
from models.signal import Signal
from sqlalchemy import desc

router = APIRouter()


@router.get("")
async def list_scanners():
    """List all scanners with their status."""
    scanners_data = []
    
    for scanner in engine.scanners:
        status = scanner.get_status()
        scanners_data.append({
            "id": status['id'],
            "name": status['name'],
            "condition": get_scanner_condition(status['id']),
            "signal": get_latest_signal_type(status['id']),
            "lastUpdate": status['last_scan'],
            "performance": "+12.4%",  # Placeholder
            "status": "active" if status['active'] else "inactive",
            "confidence": 85,  # Placeholder
            "signals": status['signals_generated']
        })
    
    return scanners_data


@router.get("/{scanner_id}")
async def get_scanner(scanner_id: str):
    """Get scanner details."""
    scanner = engine.get_scanner_by_id(scanner_id)
    if not scanner:
        raise HTTPException(status_code=404, detail="Scanner not found")
    
    return scanner.get_status()


@router.post("/{scanner_id}/toggle")
async def toggle_scanner(scanner_id: str):
    """Toggle scanner active state."""
    scanner = engine.get_scanner_by_id(scanner_id)
    if not scanner:
        raise HTTPException(status_code=404, detail="Scanner not found")
    
    scanner.toggle()
    return {"status": "active" if scanner.active else "inactive"}


@router.get("/{scanner_id}/signals")
async def get_scanner_signals(scanner_id: str, limit: int = 20):
    """Get recent signals from a scanner."""
    db = SessionLocal()
    try:
        signals = db.query(Signal).filter(
            Signal.scanner_id == scanner_id
        ).order_by(desc(Signal.timestamp)).limit(limit).all()
        
        return [
            {
                "id": s.id,
                "timestamp": s.timestamp.isoformat(),
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


def get_scanner_condition(scanner_id: str) -> str:
    """Get scanner condition description."""
    conditions = {
        "trend_alignment": "EMA 20 > EMA 50 > EMA 200",
        "volatility_compression": "BB Squeeze detected",
        "momentum_divergence": "RSI < 30 & MACD Bullish",
        "support_resistance": "Price crosses key level",
        "volume_profile": "POC crossing detected"
    }
    return conditions.get(scanner_id, "Unknown")


def get_latest_signal_type(scanner_id: str) -> str:
    """Get latest signal type for scanner."""
    db = SessionLocal()
    try:
        signal = db.query(Signal).filter(
            Signal.scanner_id == scanner_id
        ).order_by(desc(Signal.timestamp)).first()
        
        return signal.signal_type if signal else "NEUTRAL"
    finally:
        db.close()
