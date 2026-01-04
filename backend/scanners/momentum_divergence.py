"""
Momentum Divergence Scanner - RSI < 30 & MACD Bullish
"""
from typing import Dict, List, Optional
import pandas as pd
from scanners.base_scanner import BaseScanner
from utils.indicators import calculate_rsi, calculate_macd


class MomentumDivergenceScanner(BaseScanner):
    """Detects momentum divergence using RSI and MACD."""
    
    def __init__(self, symbols: List[str]):
        super().__init__(
            scanner_id="momentum_divergence",
            name="Momentum Divergence",
            symbols=symbols
        )
    
    def analyze(self, symbol: str, df: pd.DataFrame) -> Optional[Dict]:
        """Analyze momentum divergence."""
        if len(df) < 50:
            return None
        
        # Calculate indicators
        rsi = calculate_rsi(df, period=14)
        macd_data = calculate_macd(df)
        
        if len(rsi) == 0 or len(macd_data['macd']) == 0:
            return None
        
        # Get current values
        current_rsi = rsi.iloc[-1]
        current_macd = macd_data['macd'].iloc[-1]
        current_signal = macd_data['signal'].iloc[-1]
        current_histogram = macd_data['histogram'].iloc[-1]
        current_price = df['Close'].iloc[-1]
        
        # Detect oversold with bullish MACD
        oversold = current_rsi < 30
        macd_bullish = current_histogram > 0 and current_macd > current_signal
        
        # Detect overbought with bearish MACD
        overbought = current_rsi > 70
        macd_bearish = current_histogram < 0 and current_macd < current_signal
        
        if oversold and macd_bullish:
            signal_type = "OVERSOLD"
            # Confidence based on how oversold and MACD strength
            rsi_strength = (30 - current_rsi) / 30 * 100
            macd_strength = min(100, abs(current_histogram) * 10)
            confidence = self.calculate_confidence(rsi_strength, macd_strength)
            condition = f"RSI {current_rsi:.1f} < 30 & MACD Bullish"
            
        elif overbought and macd_bearish:
            signal_type = "OVERBOUGHT"
            # Confidence based on how overbought and MACD strength
            rsi_strength = (current_rsi - 70) / 30 * 100
            macd_strength = min(100, abs(current_histogram) * 10)
            confidence = self.calculate_confidence(rsi_strength, macd_strength)
            condition = f"RSI {current_rsi:.1f} > 70 & MACD Bearish"
            
        else:
            return None
        
        return {
            'signal_type': signal_type,
            'confidence': min(78, confidence),
            'price': float(current_price),
            'indicators': {
                'rsi': float(current_rsi),
                'macd': float(current_macd),
                'macd_signal': float(current_signal),
                'macd_histogram': float(current_histogram)
            },
            'condition': condition
        }
