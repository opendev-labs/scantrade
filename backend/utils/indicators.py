"""
Technical indicator calculations using pandas and ta library.
"""
import pandas as pd
import numpy as np
from typing import Dict, List
from ta.trend import EMAIndicator, MACD, ADXIndicator
from ta.momentum import RSIIndicator
from ta.volatility import BollingerBands, AverageTrueRange
from ta.volume import VolumeWeightedAveragePrice


def calculate_ema(df: pd.DataFrame, period: int, column: str = 'Close') -> pd.Series:
    """Calculate Exponential Moving Average."""
    ema = EMAIndicator(close=df[column], window=period)
    return ema.ema_indicator()


def calculate_sma(df: pd.DataFrame, period: int, column: str = 'Close') -> pd.Series:
    """Calculate Simple Moving Average."""
    return df[column].rolling(window=period).mean()


def calculate_rsi(df: pd.DataFrame, period: int = 14) -> pd.Series:
    """Calculate Relative Strength Index."""
    rsi = RSIIndicator(close=df['Close'], window=period)
    return rsi.rsi()


def calculate_macd(df: pd.DataFrame, fast: int = 12, slow: int = 26, signal: int = 9) -> Dict[str, pd.Series]:
    """Calculate MACD indicator."""
    macd = MACD(close=df['Close'], window_fast=fast, window_slow=slow, window_sign=signal)
    return {
        'macd': macd.macd(),
        'signal': macd.macd_signal(),
        'histogram': macd.macd_diff()
    }


def calculate_bollinger_bands(df: pd.DataFrame, period: int = 20, std: int = 2) -> Dict[str, pd.Series]:
    """Calculate Bollinger Bands."""
    bb = BollingerBands(close=df['Close'], window=period, window_dev=std)
    return {
        'upper': bb.bollinger_hband(),
        'middle': bb.bollinger_mavg(),
        'lower': bb.bollinger_lband(),
        'width': bb.bollinger_wband(),
        'pct': bb.bollinger_pband()
    }


def calculate_atr(df: pd.DataFrame, period: int = 14) -> pd.Series:
    """Calculate Average True Range."""
    atr = AverageTrueRange(high=df['High'], low=df['Low'], close=df['Close'], window=period)
    return atr.average_true_range()


def calculate_adx(df: pd.DataFrame, period: int = 14) -> Dict[str, pd.Series]:
    """Calculate Average Directional Index."""
    adx = ADXIndicator(high=df['High'], low=df['Low'], close=df['Close'], window=period)
    return {
        'adx': adx.adx(),
        'adx_pos': adx.adx_pos(),
        'adx_neg': adx.adx_neg()
    }


def calculate_vwap(df: pd.DataFrame) -> pd.Series:
    """Calculate Volume Weighted Average Price."""
    vwap = VolumeWeightedAveragePrice(
        high=df['High'],
        low=df['Low'],
        close=df['Close'],
        volume=df['Volume']
    )
    return vwap.volume_weighted_average_price()


def calculate_support_resistance(df: pd.DataFrame, window: int = 20) -> Dict[str, List[float]]:
    """
    Calculate support and resistance levels using pivot points.
    
    Returns:
        Dict with 'support' and 'resistance' lists
    """
    highs = df['High'].rolling(window=window).max()
    lows = df['Low'].rolling(window=window).min()
    
    # Find local maxima and minima
    resistance_levels = []
    support_levels = []
    
    for i in range(window, len(df) - window):
        if df['High'].iloc[i] == highs.iloc[i]:
            resistance_levels.append(float(df['High'].iloc[i]))
        if df['Low'].iloc[i] == lows.iloc[i]:
            support_levels.append(float(df['Low'].iloc[i]))
    
    # Remove duplicates and sort
    resistance_levels = sorted(list(set(resistance_levels)), reverse=True)[:5]
    support_levels = sorted(list(set(support_levels)))[:5]
    
    return {
        'resistance': resistance_levels,
        'support': support_levels
    }


def calculate_volume_profile(df: pd.DataFrame, bins: int = 50) -> Dict:
    """
    Calculate volume profile and Point of Control (POC).
    
    Returns:
        Dict with POC, value area high/low, and volume distribution
    """
    # Create price bins
    price_range = df['High'].max() - df['Low'].min()
    bin_size = price_range / bins
    
    # Calculate volume at each price level
    volume_at_price = {}
    for _, row in df.iterrows():
        price_bin = int((row['Close'] - df['Low'].min()) / bin_size)
        if price_bin not in volume_at_price:
            volume_at_price[price_bin] = 0
        volume_at_price[price_bin] += row['Volume']
    
    # Find POC (Point of Control) - price level with highest volume
    poc_bin = max(volume_at_price, key=volume_at_price.get)
    poc_price = df['Low'].min() + (poc_bin * bin_size)
    
    # Calculate value area (70% of volume)
    total_volume = sum(volume_at_price.values())
    target_volume = total_volume * 0.7
    
    sorted_bins = sorted(volume_at_price.items(), key=lambda x: x[1], reverse=True)
    cumulative_volume = 0
    value_area_bins = []
    
    for bin_num, volume in sorted_bins:
        cumulative_volume += volume
        value_area_bins.append(bin_num)
        if cumulative_volume >= target_volume:
            break
    
    vah = df['Low'].min() + (max(value_area_bins) * bin_size)  # Value Area High
    val = df['Low'].min() + (min(value_area_bins) * bin_size)  # Value Area Low
    
    return {
        'poc': float(poc_price),
        'vah': float(vah),
        'val': float(val),
        'volume_distribution': volume_at_price
    }


def detect_trend(df: pd.DataFrame, short: int = 20, medium: int = 50, long: int = 200) -> str:
    """
    Detect overall trend using multiple EMAs.
    
    Returns:
        'BULLISH', 'BEARISH', or 'NEUTRAL'
    """
    ema_short = calculate_ema(df, short)
    ema_medium = calculate_ema(df, medium)
    ema_long = calculate_ema(df, long)
    
    if len(ema_short) == 0 or len(ema_medium) == 0 or len(ema_long) == 0:
        return 'NEUTRAL'
    
    current_short = ema_short.iloc[-1]
    current_medium = ema_medium.iloc[-1]
    current_long = ema_long.iloc[-1]
    
    if current_short > current_medium > current_long:
        return 'BULLISH'
    elif current_short < current_medium < current_long:
        return 'BEARISH'
    else:
        return 'NEUTRAL'
