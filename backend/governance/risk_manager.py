"""
Risk management system for the trading platform.
"""
from typing import Dict, Optional
from core.portfolio import portfolio
from config.settings import settings


class RiskManager:
    """Manages risk limits and health scoring."""
    
    def __init__(self):
        self.health_score = 100.0
        self.risk_events: list = []
        
    def calculate_health_score(self) -> float:
        """
        Calculate overall system health score (0-100).
        
        Factors:
        - Drawdown (40%)
        - Exposure (30%)
        - Win rate (20%)
        - Recent performance (10%)
        """
        score = 100.0
        
        # Drawdown impact (40 points max)
        drawdown_pct = portfolio.max_drawdown
        if drawdown_pct > settings.max_drawdown_pct:
            score -= 40
        else:
            score -= (drawdown_pct / settings.max_drawdown_pct) * 40
        
        # Exposure impact (30 points max)
        exposure_pct = portfolio.get_total_exposure()
        if exposure_pct > settings.max_portfolio_exposure_pct:
            score -= 30
        else:
            score -= (exposure_pct / settings.max_portfolio_exposure_pct) * 30
        
        # Win rate impact (20 points max)
        win_rate = portfolio.get_win_rate()
        if win_rate < 50:
            score -= (50 - win_rate) / 50 * 20
        
        # Recent performance impact (10 points max)
        if portfolio.total_pnl < 0:
            pnl_pct = (portfolio.total_pnl / portfolio.initial_capital) * 100
            score -= min(10, abs(pnl_pct))
        
        self.health_score = max(0, min(100, score))
        return self.health_score
    
    def check_position_risk(
        self,
        symbol: str,
        quantity: float,
        price: float
    ) -> tuple[bool, str]:
        """
        Check if opening a position violates risk limits.
        
        Returns:
            (allowed, reason)
        """
        # Check health score
        if self.health_score < 50:
            return False, f"Health score too low ({self.health_score:.1f})"
        
        # Use portfolio's built-in checks
        return portfolio.can_open_position(symbol, quantity, price)
    
    def should_pause_trading(self) -> bool:
        """Determine if trading should be paused due to risk."""
        # Pause if health score is critical
        if self.health_score < 40:
            return True
        
        # Pause if max drawdown exceeded
        if portfolio.max_drawdown > settings.max_drawdown_pct:
            return True
        
        # Pause if exposure is too high
        if portfolio.get_total_exposure() > settings.max_portfolio_exposure_pct:
            return True
        
        return False
    
    def get_risk_status(self) -> Dict:
        """Get current risk status."""
        return {
            'health_score': self.health_score,
            'max_drawdown': portfolio.max_drawdown,
            'max_drawdown_limit': settings.max_drawdown_pct,
            'exposure_pct': portfolio.get_total_exposure(),
            'exposure_limit': settings.max_portfolio_exposure_pct,
            'position_size_limit': settings.max_position_size_pct,
            'trading_paused': self.should_pause_trading(),
            'paper_trading': settings.enable_paper_trading
        }


# Global risk manager instance
risk_manager = RiskManager()
