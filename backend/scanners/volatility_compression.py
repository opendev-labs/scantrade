"""
Volatility Compression Scanner - Bollinger Band Squeeze
"""
from typing import Dict, List, Optional
import pandas as pd
from scanners.base_scanner import BaseScanner
from utils.indicators import calculate_bollinger_bands, calculate_atr


class VolatilityCompressionScanner(BaseScanner):
    """Detects volatility compression (Bollinger Band squeeze)."""
    
    def __init__(self, symbols: List[str]):
        super().__init__(
            scanner_id="volatility_compression",
            name="Volatility Compression",
            symbols=symbols
        )
    
    def analyze(self, symbol: str, df: pd.DataFrame) -> Optional[Dict]:
        """Analyze volatility compression."""
        if len(df) < 50:
            return None
        
        # Calculate Bollinger Bands
        bb = calculate_bollinger_bands(df, period=20, std=2)
        atr = calculate_atr(df, period=14)
        
        if len(bb['width']) == 0 or len(atr) == 0:
            return None
        
        # Get current values
        current_width = bb['width'].iloc[-1]
        current_price = df['Close'].iloc[-1]
        current_atr = atr.iloc[-1]
        
        # Calculate historical average width
        avg_width = bb['width'].rolling(window=50).mean().iloc[-1]
        
        # Detect squeeze (width is significantly below average)
        width_ratio = current_width / avg_width if avg_width > 0 else 1.0
        
        # Squeeze detected if width is less than 70% of average
        if width_ratio > 0.7:
            return None
        
        # Determine direction based on price position in bands
        bb_pct = bb['pct'].iloc[-1]
        
        if bb_pct > 0.8:
            signal_type = "READY"  # Near upper band, potential breakout up
            direction_hint = "upward"
        elif bb_pct < 0.2:
            signal_type = "READY"  # Near lower band, potential breakout down
            direction_hint = "downward"
        else:
            signal_type = "READY"  # In middle, direction unclear
            direction_hint = "pending"
        
        # Confidence based on how tight the squeeze is
        squeeze_strength = (1 - width_ratio) * 100
        confidence = min(87, 60 + squeeze_strength * 0.5)
        
        return {
            'signal_type': signal_type,
            'confidence': confidence,
            'price': float(current_price),
            'indicators': {
                'bb_width': float(current_width),
                'bb_width_ratio': float(width_ratio),
                'atr': float(current_atr),
                'bb_pct': float(bb_pct)
            },
            'condition': f"BB Squeeze detected (width {width_ratio:.2f}x avg), potential {direction_hint} breakout"
        }
