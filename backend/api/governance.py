"""
Governance API endpoints.
"""
from fastapi import APIRouter
from governance.risk_manager import risk_manager
from config.settings import settings

router = APIRouter()


@router.get("/risk-limits")
async def get_risk_limits():
    """Get current risk limits and status."""
    return risk_manager.get_risk_status()


@router.get("/rules")
async def get_rules():
    """Get active governance rules."""
    return {
        "rules": [
            {
                "id": "max_position_size",
                "name": "Maximum Position Size",
                "type": "limit",
                "value": f"{settings.max_position_size_pct}%",
                "active": True
            },
            {
                "id": "max_portfolio_exposure",
                "name": "Maximum Portfolio Exposure",
                "type": "limit",
                "value": f"{settings.max_portfolio_exposure_pct}%",
                "active": True
            },
            {
                "id": "max_drawdown",
                "name": "Maximum Drawdown",
                "type": "limit",
                "value": f"{settings.max_drawdown_pct}%",
                "active": True
            },
            {
                "id": "paper_trading",
                "name": "Paper Trading Mode",
                "type": "mode",
                "value": "Enabled" if settings.enable_paper_trading else "Disabled",
                "active": settings.enable_paper_trading
            }
        ]
    }
