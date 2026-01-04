"""
Support/Resistance Scanner - Price crosses key levels
"""
from typing import Dict, List, Optional
import pandas as pd
from scanners.base_scanner import BaseScanner
from utils.indicators import calculate_support_resistance


class SupportResistanceScanner(BaseScanner):
    """Detects support and resistance level breaks."""
    
    def __init__(self, symbols: List[str]):
        super().__init__(
            scanner_id="support_resistance",
            name="Support/Resistance Break",
            symbols=symbols
        )
    
    def analyze(self, symbol: str, df: pd.DataFrame) -> Optional[Dict]:
        """Analyze support/resistance breaks."""
        if len(df) < 50:
            return None
        
        # Calculate support and resistance levels
        levels = calculate_support_resistance(df, window=20)
        
        if not levels['support'] and not levels['resistance']:
            return None
        
        # Get current and previous prices
        current_price = df['Close'].iloc[-1]
        prev_price = df['Close'].iloc[-2] if len(df) > 1 else current_price
        current_volume = df['Volume'].iloc[-1]
        avg_volume = df['Volume'].rolling(window=20).mean().iloc[-1]
        
        # Check for resistance break (bullish)
        for resistance in levels['resistance']:
            if prev_price < resistance <= current_price:
                # Breakout above resistance
                volume_confirmation = current_volume > avg_volume * 1.2
                distance_pct = ((current_price - resistance) / resistance) * 100
                
                confidence = 62
                if volume_confirmation:
                    confidence += 15
                if distance_pct > 0.5:
                    confidence += 10
                
                return {
                    'signal_type': "BREAKOUT",
                    'confidence': min(confidence, 75),
                    'price': float(current_price),
                    'indicators': {
                        'resistance_level': float(resistance),
                        'volume_ratio': float(current_volume / avg_volume) if avg_volume > 0 else 1.0,
                        'distance_pct': float(distance_pct)
                    },
                    'condition': f"Price broke above resistance at ${resistance:.2f}"
                }
        
        # Check for support bounce (bullish)
        for support in levels['support']:
            if prev_price > support >= current_price * 0.99:
                # Near or at support
                volume_confirmation = current_volume > avg_volume * 1.1
                distance_pct = ((support - current_price) / support) * 100
                
                confidence = 60
                if volume_confirmation:
                    confidence += 10
                if distance_pct < 1:
                    confidence += 8
                
                return {
                    'signal_type': "WAITING",
                    'confidence': min(confidence, 70),
                    'price': float(current_price),
                    'indicators': {
                        'support_level': float(support),
                        'volume_ratio': float(current_volume / avg_volume) if avg_volume > 0 else 1.0,
                        'distance_pct': float(distance_pct)
                    },
                    'condition': f"Price near support at ${support:.2f}"
                }
        
        return None
