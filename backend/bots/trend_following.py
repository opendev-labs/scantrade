"""
Trend Following PRO Bot - Follows established trends
"""
from typing import List
import pandas as pd
from bots.base_bot import BaseBot
from utils.indicators import calculate_ema, calculate_adx, detect_trend


class TrendFollowingBot(BaseBot):
    """Trend following strategy with ADX confirmation."""
    
    def __init__(self, symbols: List[str]):
        super().__init__(
            bot_id="trend_following_pro",
            name="Trend Following PRO",
            strategy="Trend",
            risk_level="MEDIUM",
            symbols=symbols
        )
    
    def should_enter(self, symbol: str, df: pd.DataFrame) -> tuple[bool, float, str]:
        """Enter when strong trend is confirmed."""
        if len(df) < 200:
            return False, 0, "Insufficient data"
        
        trend = detect_trend(df)
        adx_data = calculate_adx(df)
        ema_20 = calculate_ema(df, 20)
        ema_50 = calculate_ema(df, 50)
        
        if len(adx_data['adx']) == 0:
            return False, 0, "ADX calculation failed"
        
        current_adx = adx_data['adx'].iloc[-1]
        current_price = df['Close'].iloc[-1]
        
        # Strong trend conditions
        strong_trend = current_adx > 25
        bullish_trend = trend == "BULLISH"
        ema_aligned = ema_20.iloc[-1] > ema_50.iloc[-1]
        
        if strong_trend and bullish_trend and ema_aligned:
            # Confidence based on ADX strength
            confidence = min(80, 50 + current_adx * 0.8)
            return True, confidence, f"Strong {trend.lower()} trend (ADX: {current_adx:.1f})"
        
        return False, 0, "No strong trend"
    
    def should_exit(self, symbol: str, df: pd.DataFrame, entry_price: float) -> tuple[bool, str]:
        """Exit when trend weakens."""
        if len(df) == 0:
            return False, "No data"
        
        adx_data = calculate_adx(df)
        ema_20 = calculate_ema(df, 20)
        ema_50 = calculate_ema(df, 50)
        current_price = df['Close'].iloc[-1]
        current_adx = adx_data['adx'].iloc[-1]
        
        # Exit if trend weakens
        if current_adx < 20:
            return True, "Trend weakened"
        
        # Exit if EMA crossover (trend reversal)
        if ema_20.iloc[-1] < ema_50.iloc[-1]:
            return True, "Trend reversal detected"
        
        # Trailing stop at -7%
        pnl_pct = ((current_price - entry_price) / entry_price) * 100
        if pnl_pct < -7:
            return True, f"Stop loss ({pnl_pct:.1f}%)"
        
        return False, "Holding"
