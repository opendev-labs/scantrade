"""
Signal model for storing scanner signals.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from models.database import Base


class Signal(Base):
    """Scanner signal record."""
    __tablename__ = "signals"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Signal details
    scanner_id = Column(String, nullable=False, index=True)
    scanner_name = Column(String, nullable=False)
    symbol = Column(String, nullable=False, index=True)
    
    # Signal type and strength
    signal_type = Column(String, nullable=False)  # BULLISH, BEARISH, NEUTRAL, etc.
    confidence = Column(Float, nullable=False)  # 0-100
    
    # Market data at signal time
    price = Column(Float, nullable=False)
    
    # Indicator values (JSON stored as string)
    indicators = Column(String, nullable=True)
    
    # Additional context
    condition = Column(String, nullable=True)
    
    def __repr__(self):
        return f"<Signal {self.scanner_name} {self.symbol} {self.signal_type} @ {self.confidence}%>"
