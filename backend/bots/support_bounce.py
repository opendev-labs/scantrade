"""
Support Bounce Bot - Enters at support level bounces
"""
from typing import List
import pandas as pd
from bots.base_bot import BaseBot
from utils.indicators import calculate_support_resistance


class SupportBounceBot(BaseBot):
    """Reversal strategy at support levels."""
    
    def __init__(self, symbols: List[str]):
        super().__init__(
            bot_id="support_bounce",
            name="Support Bounce",
            strategy="Reversal",
            risk_level="LOW",
            symbols=symbols
        )
    
    def should_enter(self, symbol: str, df: pd.DataFrame) -> tuple[bool, float, str]:
        """Enter when price bounces off support."""
        if len(df) < 50:
            return False, 0, "Insufficient data"
        
        levels = calculate_support_resistance(df)
        
        if not levels['support']:
            return False, 0, "No support levels found"
        
        current_price = df['Close'].iloc[-1]
        prev_price = df['Close'].iloc[-2]
        current_volume = df['Volume'].iloc[-1]
        avg_volume = df['Volume'].rolling(window=20).mean().iloc[-1]
        
        # Check if price is near support and bouncing
        for support in levels['support']:
            distance_pct = abs((current_price - support) / support) * 100
            
            # Near support (within 1%)
            if distance_pct < 1.0:
                # Check for bounce (price moving up from support)
                if current_price > prev_price:
                    # Volume confirmation
                    volume_confirmed = current_volume > avg_volume * 1.1
                    confidence = 60 if volume_confirmed else 50
                    
                    return True, confidence, f"Bounce from support at ${support:.2f}"
        
        return False, 0, "No support bounce"
    
    def should_exit(self, symbol: str, df: pd.DataFrame, entry_price: float) -> tuple[bool, str]:
        """Exit with tight stop below support."""
        if len(df) == 0:
            return False, "No data"
        
        current_price = df['Close'].iloc[-1]
        pnl_pct = ((current_price - entry_price) / entry_price) * 100
        
        # Quick profit target at +3%
        if pnl_pct > 3:
            return True, f"Profit target reached ({pnl_pct:.1f}%)"
        
        # Tight stop loss at -2%
        if pnl_pct < -2:
            return True, f"Stop loss ({pnl_pct:.1f}%)"
        
        return False, "Holding"
