"""
Base scanner class for market analysis.
"""
from abc import ABC, abstractmethod
from typing import Dict, List, Optional
from datetime import datetime
import pandas as pd
from utils.market_data import market_data
from utils.indicators import *
from models.signal import Signal
from models.database import SessionLocal


class BaseScanner(ABC):
    """Abstract base class for all market scanners."""
    
    def __init__(self, scanner_id: str, name: str, symbols: List[str]):
        self.scanner_id = scanner_id
        self.name = name
        self.symbols = symbols
        self.active = True
        self.last_scan_time: Optional[datetime] = None
        self.signals_generated = 0
        self.performance_history: List[float] = []
        
    @abstractmethod
    def analyze(self, symbol: str, df: pd.DataFrame) -> Optional[Dict]:
        """
        Analyze market data and generate signal.
        
        Args:
            symbol: Stock symbol
            df: DataFrame with OHLCV data
        
        Returns:
            Signal dict or None if no signal
            {
                'signal_type': 'BULLISH' | 'BEARISH' | 'NEUTRAL',
                'confidence': 0-100,
                'price': current_price,
                'indicators': {...},
                'condition': 'description'
            }
        """
        pass
    
    def scan(self) -> List[Signal]:
        """
        Scan all symbols and generate signals.
        
        Returns:
            List of Signal objects
        """
        if not self.active:
            return []
        
        signals = []
        
        for symbol in self.symbols:
            try:
                # Fetch market data
                df = market_data.get_historical_data(symbol, period="1mo", interval="1h")
                
                if df.empty:
                    continue
                
                # Analyze
                signal_data = self.analyze(symbol, df)
                
                if signal_data:
                    # Create signal object
                    signal = Signal(
                        scanner_id=self.scanner_id,
                        scanner_name=self.name,
                        symbol=symbol,
                        signal_type=signal_data['signal_type'],
                        confidence=signal_data['confidence'],
                        price=signal_data['price'],
                        indicators=str(signal_data.get('indicators', {})),
                        condition=signal_data.get('condition', '')
                    )
                    
                    signals.append(signal)
                    self.signals_generated += 1
                    
                    # Save to database
                    db = SessionLocal()
                    try:
                        db.add(signal)
                        db.commit()
                    finally:
                        db.close()
                    
            except Exception as e:
                print(f"Error scanning {symbol} with {self.name}: {e}")
        
        self.last_scan_time = datetime.utcnow()
        return signals
    
    def toggle(self):
        """Toggle scanner active state."""
        self.active = not self.active
    
    def get_status(self) -> Dict:
        """Get scanner status and statistics."""
        return {
            'id': self.scanner_id,
            'name': self.name,
            'active': self.active,
            'signals_generated': self.signals_generated,
            'last_scan': self.last_scan_time.isoformat() if self.last_scan_time else None,
            'symbols_count': len(self.symbols)
        }
    
    def calculate_confidence(self, *scores: float) -> float:
        """
        Calculate overall confidence from multiple scores.
        
        Args:
            *scores: Individual confidence scores (0-100)
        
        Returns:
            Average confidence score
        """
        if not scores:
            return 0.0
        return sum(scores) / len(scores)
