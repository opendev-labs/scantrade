"""
Volume Profile Scanner - POC crossing detected
"""
from typing import Dict, List, Optional
import pandas as pd
from scanners.base_scanner import BaseScanner
from utils.indicators import calculate_volume_profile, calculate_vwap


class VolumeProfileScanner(BaseScanner):
    """Analyzes volume profile and POC (Point of Control)."""
    
    def __init__(self, symbols: List[str]):
        super().__init__(
            scanner_id="volume_profile",
            name="Volume Profile Analyst",
            symbols=symbols
        )
    
    def analyze(self, symbol: str, df: pd.DataFrame) -> Optional[Dict]:
        """Analyze volume profile."""
        if len(df) < 50:
            return None
        
        # Calculate volume profile
        vp = calculate_volume_profile(df, bins=50)
        vwap = calculate_vwap(df)
        
        if len(vwap) == 0:
            return None
        
        # Get current values
        current_price = df['Close'].iloc[-1]
        current_vwap = vwap.iloc[-1]
        poc = vp['poc']
        vah = vp['vah']
        val = vp['val']
        
        # Determine position relative to value area
        if current_price > vah:
            position = "above value area"
            signal_type = "BULLISH"
            confidence_base = 65
        elif current_price < val:
            position = "below value area"
            signal_type = "BEARISH"
            confidence_base = 65
        elif abs(current_price - poc) / poc < 0.005:  # Within 0.5% of POC
            position = "at POC"
            signal_type = "NEUTRAL"
            confidence_base = 71
        else:
            position = "in value area"
            signal_type = "NEUTRAL"
            confidence_base = 60
        
        # Check VWAP position for additional confirmation
        vwap_position = "above" if current_price > current_vwap else "below"
        vwap_distance = abs((current_price - current_vwap) / current_vwap) * 100
        
        # Adjust confidence based on VWAP alignment
        if signal_type == "BULLISH" and vwap_position == "above":
            confidence_base += 6
        elif signal_type == "BEARISH" and vwap_position == "below":
            confidence_base += 6
        
        return {
            'signal_type': signal_type,
            'confidence': min(confidence_base, 75),
            'price': float(current_price),
            'indicators': {
                'poc': float(poc),
                'vah': float(vah),
                'val': float(val),
                'vwap': float(current_vwap),
                'vwap_distance_pct': float(vwap_distance)
            },
            'condition': f"Price {position}, {vwap_position} VWAP"
        }
