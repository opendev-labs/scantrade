"""
Position model for tracking open positions.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from models.database import Base


class Position(Base):
    """Open position record."""
    __tablename__ = "positions"
    
    id = Column(Integer, primary_key=True, index=True)
    opened_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Position details
    symbol = Column(String, nullable=False, unique=True, index=True)
    quantity = Column(Float, nullable=False)
    
    # Pricing
    entry_price = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    
    # P&L
    unrealized_pnl = Column(Float, default=0.0)
    unrealized_pnl_pct = Column(Float, default=0.0)
    
    # Metadata
    bot_id = Column(String, nullable=True, index=True)
    strategy = Column(String, nullable=True)
    
    def __repr__(self):
        return f"<Position {self.symbol} {self.quantity}@{self.entry_price}>"
    
    def update_pnl(self, current_price: float):
        """Update P&L based on current price."""
        self.current_price = current_price
        self.unrealized_pnl = (current_price - self.entry_price) * self.quantity
        self.unrealized_pnl_pct = ((current_price - self.entry_price) / self.entry_price) * 100
        self.updated_at = datetime.utcnow()
