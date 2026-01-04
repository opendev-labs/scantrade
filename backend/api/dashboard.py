"""
Dashboard API endpoints.
"""
from fastapi import APIRouter
from core.engine import engine
from core.portfolio import portfolio
from governance.risk_manager import risk_manager

router = APIRouter()


@router.get("/health-score")
async def get_health_score():
    """Get current system health score."""
    return {
        "score": risk_manager.health_score,
        "status": "OPTIMAL" if risk_manager.health_score > 70 else "CAUTION" if risk_manager.health_score > 40 else "CRITICAL"
    }


@router.get("/system-status")
async def get_system_status():
    """Get overall system status."""
    return engine.get_system_status()


@router.get("/quick-stats")
async def get_quick_stats():
    """Get key performance metrics."""
    stats = portfolio.get_stats()
    
    return {
        "portfolio_value": stats['portfolio_value'],
        "total_pnl": stats['total_pnl'],
        "total_pnl_pct": stats['total_pnl_pct'],
        "cash": stats['cash'],
        "exposure_pct": stats['exposure_pct'],
        "open_positions": stats['open_positions'],
        "total_trades": stats['total_trades'],
        "win_rate": stats['win_rate'],
        "sharpe_ratio": stats['sharpe_ratio'],
        "sortino_ratio": stats['sortino_ratio'],
        "max_drawdown": stats['max_drawdown']
    }


@router.get("/portfolio")
async def get_portfolio():
    """Get portfolio summary."""
    stats = portfolio.get_stats()
    
    positions = []
    for symbol, pos in portfolio.positions.items():
        positions.append({
            "symbol": symbol,
            "quantity": pos.quantity,
            "entry_price": pos.entry_price,
            "current_price": pos.current_price,
            "unrealized_pnl": pos.unrealized_pnl,
            "unrealized_pnl_pct": pos.unrealized_pnl_pct,
            "bot_id": pos.bot_id
        })
    
    return {
        "stats": stats,
        "positions": positions
    }
