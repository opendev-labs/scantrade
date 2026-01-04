"""
Portfolio management system for tracking positions, P&L, and metrics.
"""
from typing import Dict, List, Optional
from datetime import datetime
from models.position import Position
from models.trade import Trade, TradeDirection, TradeStatus
from models.database import SessionLocal
from config.settings import settings
import numpy as np


class Portfolio:
    """Manages portfolio positions, capital, and performance metrics."""
    
    def __init__(self, initial_capital: float = None):
        self.initial_capital = initial_capital or settings.initial_capital
        self.cash = self.initial_capital
        self.positions: Dict[str, Position] = {}
        self.closed_trades: List[Trade] = []
        
        # Performance tracking
        self.total_pnl = 0.0
        self.total_fees = 0.0
        self.peak_value = self.initial_capital
        self.max_drawdown = 0.0
        
    def get_portfolio_value(self) -> float:
        """Calculate total portfolio value (cash + positions)."""
        positions_value = sum(
            pos.quantity * pos.current_price 
            for pos in self.positions.values()
        )
        return self.cash + positions_value
    
    def get_total_exposure(self) -> float:
        """Get total portfolio exposure as percentage."""
        portfolio_value = self.get_portfolio_value()
        if portfolio_value == 0:
            return 0.0
        
        positions_value = sum(
            pos.quantity * pos.current_price 
            for pos in self.positions.values()
        )
        return (positions_value / portfolio_value) * 100
    
    def can_open_position(self, symbol: str, quantity: float, price: float) -> tuple[bool, str]:
        """
        Check if a position can be opened based on risk limits.
        
        Returns:
            (can_open, reason)
        """
        # Check if position already exists
        if symbol in self.positions:
            return False, f"Position already exists for {symbol}"
        
        # Calculate position size
        position_value = quantity * price
        portfolio_value = self.get_portfolio_value()
        
        # Check position size limit
        position_pct = (position_value / portfolio_value) * 100
        if position_pct > settings.max_position_size_pct:
            return False, f"Position size {position_pct:.1f}% exceeds limit {settings.max_position_size_pct}%"
        
        # Check total exposure limit
        current_exposure = self.get_total_exposure()
        new_exposure = current_exposure + position_pct
        if new_exposure > settings.max_portfolio_exposure_pct:
            return False, f"Total exposure {new_exposure:.1f}% would exceed limit {settings.max_portfolio_exposure_pct}%"
        
        # Check if enough cash
        if position_value > self.cash:
            return False, f"Insufficient cash: need ${position_value:.2f}, have ${self.cash:.2f}"
        
        return True, "OK"
    
    def open_position(
        self,
        symbol: str,
        quantity: float,
        price: float,
        bot_id: str = None,
        strategy: str = None
    ) -> Optional[Position]:
        """Open a new position."""
        can_open, reason = self.can_open_position(symbol, quantity, price)
        if not can_open:
            print(f"Cannot open position: {reason}")
            return None
        
        # Create position
        position = Position(
            symbol=symbol,
            quantity=quantity,
            entry_price=price,
            current_price=price,
            bot_id=bot_id,
            strategy=strategy
        )
        
        # Update cash
        self.cash -= quantity * price
        
        # Store position
        self.positions[symbol] = position
        
        # Save to database
        db = SessionLocal()
        try:
            db.add(position)
            db.commit()
            db.refresh(position)
        finally:
            db.close()
        
        return position
    
    def close_position(
        self,
        symbol: str,
        price: float,
        reason: str = None
    ) -> Optional[Trade]:
        """Close an existing position."""
        if symbol not in self.positions:
            print(f"No position found for {symbol}")
            return None
        
        position = self.positions[symbol]
        
        # Calculate P&L
        pnl = (price - position.entry_price) * position.quantity
        
        # Update cash
        self.cash += position.quantity * price
        
        # Create trade record
        trade = Trade(
            symbol=symbol,
            direction=TradeDirection.SELL,
            quantity=position.quantity,
            entry_price=position.entry_price,
            exit_price=price,
            realized_pnl=pnl,
            bot_id=position.bot_id,
            strategy=position.strategy,
            status=TradeStatus.EXECUTED,
            exit_reason=reason
        )
        
        # Update totals
        self.total_pnl += pnl
        self.closed_trades.append(trade)
        
        # Remove position
        del self.positions[symbol]
        
        # Save to database
        db = SessionLocal()
        try:
            # Delete position
            db.query(Position).filter(Position.symbol == symbol).delete()
            # Add trade
            db.add(trade)
            db.commit()
        finally:
            db.close()
        
        return trade
    
    def update_positions(self, prices: Dict[str, float]):
        """Update all positions with current prices."""
        for symbol, position in self.positions.items():
            if symbol in prices:
                position.update_pnl(prices[symbol])
        
        # Update drawdown
        current_value = self.get_portfolio_value()
        if current_value > self.peak_value:
            self.peak_value = current_value
        
        drawdown = ((self.peak_value - current_value) / self.peak_value) * 100
        if drawdown > self.max_drawdown:
            self.max_drawdown = drawdown
    
    def calculate_sharpe_ratio(self, risk_free_rate: float = 0.02) -> float:
        """Calculate Sharpe ratio from closed trades."""
        if not self.closed_trades:
            return 0.0
        
        returns = [trade.realized_pnl / self.initial_capital for trade in self.closed_trades]
        if len(returns) < 2:
            return 0.0
        
        avg_return = np.mean(returns)
        std_return = np.std(returns)
        
        if std_return == 0:
            return 0.0
        
        return (avg_return - risk_free_rate) / std_return
    
    def calculate_sortino_ratio(self, risk_free_rate: float = 0.02) -> float:
        """Calculate Sortino ratio (downside deviation only)."""
        if not self.closed_trades:
            return 0.0
        
        returns = [trade.realized_pnl / self.initial_capital for trade in self.closed_trades]
        if len(returns) < 2:
            return 0.0
        
        avg_return = np.mean(returns)
        downside_returns = [r for r in returns if r < 0]
        
        if not downside_returns:
            return float('inf')
        
        downside_std = np.std(downside_returns)
        if downside_std == 0:
            return 0.0
        
        return (avg_return - risk_free_rate) / downside_std
    
    def get_win_rate(self) -> float:
        """Calculate win rate from closed trades."""
        if not self.closed_trades:
            return 0.0
        
        winning_trades = sum(1 for trade in self.closed_trades if trade.realized_pnl > 0)
        return (winning_trades / len(self.closed_trades)) * 100
    
    def get_stats(self) -> Dict:
        """Get portfolio statistics."""
        return {
            'cash': self.cash,
            'portfolio_value': self.get_portfolio_value(),
            'total_pnl': self.total_pnl,
            'total_pnl_pct': (self.total_pnl / self.initial_capital) * 100,
            'max_drawdown': self.max_drawdown,
            'sharpe_ratio': self.calculate_sharpe_ratio(),
            'sortino_ratio': self.calculate_sortino_ratio(),
            'win_rate': self.get_win_rate(),
            'total_trades': len(self.closed_trades),
            'open_positions': len(self.positions),
            'exposure_pct': self.get_total_exposure()
        }


# Global portfolio instance
portfolio = Portfolio()
