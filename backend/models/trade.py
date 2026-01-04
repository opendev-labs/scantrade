"""
Trade model for storing trade execution data.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
from datetime import datetime
import enum
from models.database import Base


class TradeStatus(str, enum.Enum):
    """Trade status enumeration."""
    PENDING = "pending"
    EXECUTED = "executed"
    CANCELLED = "cancelled"
    FAILED = "failed"


class TradeDirection(str, enum.Enum):
    """Trade direction enumeration."""
    BUY = "buy"
    SELL = "sell"


class Trade(Base):
    """Trade execution record."""
    __tablename__ = "trades"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Trade details
    symbol = Column(String, nullable=False, index=True)
    direction = Column(Enum(TradeDirection), nullable=False)
    quantity = Column(Float, nullable=False)
    
    # Pricing
    entry_price = Column(Float, nullable=False)
    exit_price = Column(Float, nullable=True)
    
    # P&L
    realized_pnl = Column(Float, default=0.0)
    fees = Column(Float, default=0.0)
    
    # Metadata
    bot_id = Column(String, nullable=True, index=True)
    strategy = Column(String, nullable=True)
    status = Column(Enum(TradeStatus), default=TradeStatus.PENDING)
    
    # Reason for trade
    entry_reason = Column(String, nullable=True)
    exit_reason = Column(String, nullable=True)
    
    def __repr__(self):
        return f"<Trade {self.symbol} {self.direction} {self.quantity}@{self.entry_price}>"
