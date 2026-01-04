"""
Base bot class for trading strategies.
"""
from abc import ABC, abstractmethod
from typing import Dict, List, Optional
from datetime import datetime
from core.portfolio import portfolio
from utils.market_data import market_data
import pandas as pd


class BotStatus:
    """Bot status enumeration."""
    ACTIVE = "active"
    PAUSED = "paused"
    INACTIVE = "inactive"


class BaseBot(ABC):
    """Abstract base class for all trading bots."""
    
    def __init__(
        self,
        bot_id: str,
        name: str,
        strategy: str,
        risk_level: str,
        symbols: List[str]
    ):
        self.bot_id = bot_id
        self.name = name
        self.strategy = strategy
        self.risk_level = risk_level  # LOW, MEDIUM, HIGH
        self.symbols = symbols
        self.status = BotStatus.INACTIVE
        
        # Performance tracking
        self.trades_executed = 0
        self.winning_trades = 0
        self.total_pnl = 0.0
        self.capital_allocated_pct = 0.0
        self.last_trade_time: Optional[datetime] = None
        
    @abstractmethod
    def should_enter(self, symbol: str, df: pd.DataFrame) -> tuple[bool, float, str]:
        """
        Determine if bot should enter a position.
        
        Args:
            symbol: Stock symbol
            df: DataFrame with OHLCV data
        
        Returns:
            (should_enter, confidence, reason)
        """
        pass
    
    @abstractmethod
    def should_exit(self, symbol: str, df: pd.DataFrame, entry_price: float) -> tuple[bool, str]:
        """
        Determine if bot should exit a position.
        
        Args:
            symbol: Stock symbol
            df: DataFrame with OHLCV data
            entry_price: Entry price of position
        
        Returns:
            (should_exit, reason)
        """
        pass
    
    def calculate_position_size(self, price: float, capital_pct: float = None) -> float:
        """
        Calculate position size based on risk and available capital.
        
        Args:
            price: Current price
            capital_pct: Percentage of portfolio to allocate (optional)
        
        Returns:
            Number of shares to buy
        """
        if capital_pct is None:
            # Default allocation based on risk level
            if self.risk_level == "LOW":
                capital_pct = 3.0
            elif self.risk_level == "MEDIUM":
                capital_pct = 4.0
            else:  # HIGH
                capital_pct = 5.0
        
        portfolio_value = portfolio.get_portfolio_value()
        position_value = portfolio_value * (capital_pct / 100)
        quantity = position_value / price
        
        return quantity
    
    def execute(self):
        """Execute bot strategy on all symbols."""
        if self.status != BotStatus.ACTIVE:
            return
        
        for symbol in self.symbols:
            try:
                # Check if we already have a position
                if symbol in portfolio.positions:
                    # Check exit conditions
                    position = portfolio.positions[symbol]
                    df = market_data.get_historical_data(symbol, period="1mo", interval="1h")
                    
                    if df.empty:
                        continue
                    
                    should_exit, reason = self.should_exit(symbol, df, position.entry_price)
                    
                    if should_exit:
                        current_price = df['Close'].iloc[-1]
                        trade = portfolio.close_position(symbol, current_price, reason)
                        
                        if trade:
                            self.trades_executed += 1
                            if trade.realized_pnl > 0:
                                self.winning_trades += 1
                            self.total_pnl += trade.realized_pnl
                            self.last_trade_time = datetime.utcnow()
                            print(f"[{self.name}] Closed {symbol} at ${current_price:.2f}: {reason}")
                
                else:
                    # Check entry conditions
                    df = market_data.get_historical_data(symbol, period="1mo", interval="1h")
                    
                    if df.empty:
                        continue
                    
                    should_enter, confidence, reason = self.should_enter(symbol, df)
                    
                    if should_enter and confidence > 60:
                        current_price = df['Close'].iloc[-1]
                        quantity = self.calculate_position_size(current_price)
                        
                        position = portfolio.open_position(
                            symbol=symbol,
                            quantity=quantity,
                            price=current_price,
                            bot_id=self.bot_id,
                            strategy=self.strategy
                        )
                        
                        if position:
                            print(f"[{self.name}] Opened {symbol} at ${current_price:.2f}: {reason}")
                            
            except Exception as e:
                print(f"Error executing {self.name} on {symbol}: {e}")
    
    def toggle(self):
        """Toggle bot between active and paused."""
        if self.status == BotStatus.ACTIVE:
            self.status = BotStatus.PAUSED
        else:
            self.status = BotStatus.ACTIVE
    
    def get_win_rate(self) -> float:
        """Calculate win rate."""
        if self.trades_executed == 0:
            return 0.0
        return (self.winning_trades / self.trades_executed) * 100
    
    def get_status(self) -> Dict:
        """Get bot status and statistics."""
        return {
            'id': self.bot_id,
            'name': self.name,
            'strategy': self.strategy,
            'status': self.status,
            'risk': self.risk_level,
            'capital': f"{self.capital_allocated_pct}%",
            'returns': f"{'+' if self.total_pnl > 0 else ''}{(self.total_pnl / portfolio.initial_capital * 100):.1f}%",
            'trades': self.trades_executed,
            'winRate': self.get_win_rate(),
            'lastTrade': self.last_trade_time.isoformat() if self.last_trade_time else None
        }
