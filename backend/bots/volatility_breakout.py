"""
Volatility Breakout Bot - Enters on squeeze breakouts
"""
from typing import List
import pandas as pd
from bots.base_bot import BaseBot
from utils.indicators import calculate_bollinger_bands, calculate_atr


class VolatilityBreakoutBot(BaseBot):
    """Breakout strategy based on volatility compression."""
    
    def __init__(self, symbols: List[str]):
        super().__init__(
            bot_id="volatility_breakout",
            name="Volatility Compression",
            strategy="Breakout",
            risk_level="HIGH",
            symbols=symbols
        )
    
    def should_enter(self, symbol: str, df: pd.DataFrame) -> tuple[bool, float, str]:
        """Enter on breakout from BB squeeze."""
        if len(df) < 50:
            return False, 0, "Insufficient data"
        
        bb = calculate_bollinger_bands(df)
        atr = calculate_atr(df)
        
        if len(bb['width']) == 0 or len(atr) == 0:
            return False, 0, "Indicator calculation failed"
        
        current_price = df['Close'].iloc[-1]
        prev_price = df['Close'].iloc[-2]
        upper_band = bb['upper'].iloc[-1]
        lower_band = bb['lower'].iloc[-1]
        current_width = bb['width'].iloc[-1]
        avg_width = bb['width'].rolling(window=50).mean().iloc[-1]
        
        # Check for squeeze
        is_squeezed = current_width < avg_width * 0.7
        
        # Check for breakout
        breakout_up = prev_price <= upper_band and current_price > upper_band
        breakout_down = prev_price >= lower_band and current_price < lower_band
        
        if is_squeezed and (breakout_up or breakout_down):
            confidence = 65 if breakout_up else 45
            direction = "upward" if breakout_up else "downward"
            return True, confidence, f"Breakout {direction} from squeeze"
        
        return False, 0, "No breakout signal"
    
    def should_exit(self, symbol: str, df: pd.DataFrame, entry_price: float) -> tuple[bool, str]:
        """Exit with ATR-based trailing stop."""
        if len(df) == 0:
            return False, "No data"
        
        atr = calculate_atr(df)
        current_price = df['Close'].iloc[-1]
        current_atr = atr.iloc[-1]
        
        # Trailing stop at 2x ATR
        stop_distance = current_atr * 2
        pnl = current_price - entry_price
        
        # Take profit at 3x ATR
        if pnl > current_atr * 3:
            return True, "Profit target reached"
        
        # Stop loss at 1.5x ATR
        if pnl < -current_atr * 1.5:
            return True, "Stop loss triggered"
        
        return False, "Holding"
