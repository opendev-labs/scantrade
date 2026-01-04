"""
Trend Alignment Scanner - EMA 20 > EMA 50 > EMA 200
"""
from typing import Dict, List, Optional
import pandas as pd
from scanners.base_scanner import BaseScanner
from utils.indicators import calculate_ema, detect_trend


class TrendAlignmentScanner(BaseScanner):
    """Detects trend alignment using multiple EMAs."""
    
    def __init__(self, symbols: List[str]):
        super().__init__(
            scanner_id="trend_alignment",
            name="Trend Alignment Scanner",
            symbols=symbols
        )
    
    def analyze(self, symbol: str, df: pd.DataFrame) -> Optional[Dict]:
        """Analyze trend alignment."""
        if len(df) < 200:
            return None
        
        # Calculate EMAs
        ema_20 = calculate_ema(df, 20)
        ema_50 = calculate_ema(df, 50)
        ema_200 = calculate_ema(df, 200)
        
        if len(ema_20) == 0 or len(ema_50) == 0 or len(ema_200) == 0:
            return None
        
        # Get current values
        current_20 = ema_20.iloc[-1]
        current_50 = ema_50.iloc[-1]
        current_200 = ema_200.iloc[-1]
        current_price = df['Close'].iloc[-1]
        
        # Check alignment
        bullish_alignment = current_20 > current_50 > current_200
        bearish_alignment = current_20 < current_50 < current_200
        
        if not (bullish_alignment or bearish_alignment):
            return None
        
        # Calculate confidence based on separation
        if bullish_alignment:
            separation_50_200 = ((current_50 - current_200) / current_200) * 100
            separation_20_50 = ((current_20 - current_50) / current_50) * 100
            signal_type = "BULLISH"
        else:
            separation_50_200 = ((current_200 - current_50) / current_200) * 100
            separation_20_50 = ((current_50 - current_20) / current_50) * 100
            signal_type = "BEARISH"
        
        # Confidence based on separation (more separation = higher confidence)
        confidence = min(94, 70 + (separation_50_200 * 10) + (separation_20_50 * 10))
        
        return {
            'signal_type': signal_type,
            'confidence': confidence,
            'price': float(current_price),
            'indicators': {
                'ema_20': float(current_20),
                'ema_50': float(current_50),
                'ema_200': float(current_200)
            },
            'condition': f"EMA 20 {'>' if bullish_alignment else '<'} EMA 50 {'>' if bullish_alignment else '<'} EMA 200"
        }
