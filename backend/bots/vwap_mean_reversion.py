"""
VWAP Mean Reversion Bot - Trades when price deviates from VWAP
"""
from typing import List
import pandas as pd
from bots.base_bot import BaseBot
from utils.indicators import calculate_vwap


class VWAPMeanReversionBot(BaseBot):
    """Mean reversion strategy based on VWAP."""
    
    def __init__(self, symbols: List[str]):
        super().__init__(
            bot_id="vwap_mean_reversion",
            name="VWAP Mean Reversion",
            strategy="Mean Reversion",
            risk_level="LOW",
            symbols=symbols
        )
        self.deviation_threshold = 2.0  # Standard deviations
    
    def should_enter(self, symbol: str, df: pd.DataFrame) -> tuple[bool, float, str]:
        """Enter when price is significantly below VWAP."""
        if len(df) < 50:
            return False, 0, "Insufficient data"
        
        vwap = calculate_vwap(df)
        if len(vwap) == 0:
            return False, 0, "VWAP calculation failed"
        
        current_price = df['Close'].iloc[-1]
        current_vwap = vwap.iloc[-1]
        
        # Calculate deviation
        deviation = ((current_price - current_vwap) / current_vwap) * 100
        
        # Enter when price is below VWAP by threshold
        if deviation < -self.deviation_threshold:
            confidence = min(90, 60 + abs(deviation) * 5)
            return True, confidence, f"Price {abs(deviation):.1f}% below VWAP"
        
        return False, 0, "No signal"
    
    def should_exit(self, symbol: str, df: pd.DataFrame, entry_price: float) -> tuple[bool, str]:
        """Exit when price returns to VWAP or stop loss."""
        if len(df) == 0:
            return False, "No data"
        
        vwap = calculate_vwap(df)
        current_price = df['Close'].iloc[-1]
        current_vwap = vwap.iloc[-1]
        
        # Take profit when price reaches VWAP
        if current_price >= current_vwap:
            return True, "Price reached VWAP target"
        
        # Stop loss at -3%
        pnl_pct = ((current_price - entry_price) / entry_price) * 100
        if pnl_pct < -3:
            return True, f"Stop loss triggered ({pnl_pct:.1f}%)"
        
        return False, "Holding"
