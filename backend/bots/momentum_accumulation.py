"""
Momentum Accumulation Bot - Accumulates positions in strong trends
"""
from typing import List
import pandas as pd
from bots.base_bot import BaseBot
from utils.indicators import calculate_rsi, calculate_macd, calculate_ema


class MomentumAccumulationBot(BaseBot):
    """Momentum strategy that accumulates in strong trends."""
    
    def __init__(self, symbols: List[str]):
        super().__init__(
            bot_id="momentum_accumulation",
            name="Momentum Accumulation",
            strategy="Momentum",
            risk_level="MEDIUM",
            symbols=symbols
        )
    
    def should_enter(self, symbol: str, df: pd.DataFrame) -> tuple[bool, float, str]:
        """Enter when momentum is strong and RSI confirms."""
        if len(df) < 50:
            return False, 0, "Insufficient data"
        
        rsi = calculate_rsi(df)
        macd_data = calculate_macd(df)
        ema_20 = calculate_ema(df, 20)
        ema_50 = calculate_ema(df, 50)
        
        if len(rsi) == 0 or len(macd_data['macd']) == 0:
            return False, 0, "Indicator calculation failed"
        
        current_rsi = rsi.iloc[-1]
        current_macd = macd_data['histogram'].iloc[-1]
        current_price = df['Close'].iloc[-1]
        
        # Strong momentum conditions
        rsi_bullish = 50 < current_rsi < 70  # Not overbought
        macd_bullish = current_macd > 0
        trend_bullish = ema_20.iloc[-1] > ema_50.iloc[-1]
        
        if rsi_bullish and macd_bullish and trend_bullish:
            confidence = min(75, 55 + current_rsi * 0.3)
            return True, confidence, "Strong momentum detected"
        
        return False, 0, "No momentum signal"
    
    def should_exit(self, symbol: str, df: pd.DataFrame, entry_price: float) -> tuple[bool, str]:
        """Exit when momentum reverses."""
        if len(df) == 0:
            return False, "No data"
        
        rsi = calculate_rsi(df)
        macd_data = calculate_macd(df)
        current_price = df['Close'].iloc[-1]
        
        # Exit if RSI becomes overbought
        if rsi.iloc[-1] > 75:
            return True, "RSI overbought"
        
        # Exit if MACD turns negative
        if macd_data['histogram'].iloc[-1] < 0:
            return True, "MACD turned bearish"
        
        # Stop loss at -5%
        pnl_pct = ((current_price - entry_price) / entry_price) * 100
        if pnl_pct < -5:
            return True, f"Stop loss ({pnl_pct:.1f}%)"
        
        return False, "Holding"
