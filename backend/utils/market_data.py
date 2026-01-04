"""
Market data fetching utilities using yfinance.
"""
import yfinance as yf
import pandas as pd
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import asyncio
from functools import lru_cache


class MarketDataFetcher:
    """Fetches and caches market data from yfinance."""
    
    def __init__(self):
        self._cache: Dict[str, pd.DataFrame] = {}
        self._cache_timeout = 60  # seconds
        self._last_update: Dict[str, datetime] = {}
    
    def get_historical_data(
        self,
        symbol: str,
        period: str = "1mo",
        interval: str = "1h"
    ) -> pd.DataFrame:
        """
        Get historical data for a symbol.
        
        Args:
            symbol: Stock symbol (e.g., 'AAPL')
            period: Data period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
            interval: Data interval (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)
        
        Returns:
            DataFrame with OHLCV data
        """
        cache_key = f"{symbol}_{period}_{interval}"
        
        # Check cache
        if cache_key in self._cache:
            last_update = self._last_update.get(cache_key)
            if last_update and (datetime.now() - last_update).seconds < self._cache_timeout:
                return self._cache[cache_key]
        
        # Fetch fresh data
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period, interval=interval)
        
        # Cache the data
        self._cache[cache_key] = df
        self._last_update[cache_key] = datetime.now()
        
        return df
    
    def get_current_price(self, symbol: str) -> float:
        """Get current price for a symbol."""
        ticker = yf.Ticker(symbol)
        data = ticker.history(period="1d", interval="1m")
        if not data.empty:
            return float(data['Close'].iloc[-1])
        return 0.0
    
    def get_multiple_prices(self, symbols: List[str]) -> Dict[str, float]:
        """Get current prices for multiple symbols."""
        prices = {}
        for symbol in symbols:
            try:
                prices[symbol] = self.get_current_price(symbol)
            except Exception as e:
                print(f"Error fetching price for {symbol}: {e}")
                prices[symbol] = 0.0
        return prices
    
    async def get_realtime_data(self, symbols: List[str]) -> Dict[str, Dict]:
        """
        Get real-time data for multiple symbols asynchronously.
        
        Returns:
            Dict mapping symbol to data dict with price, volume, etc.
        """
        data = {}
        for symbol in symbols:
            try:
                ticker = yf.Ticker(symbol)
                info = ticker.info
                hist = ticker.history(period="1d", interval="1m")
                
                if not hist.empty:
                    data[symbol] = {
                        'price': float(hist['Close'].iloc[-1]),
                        'volume': float(hist['Volume'].iloc[-1]),
                        'open': float(hist['Open'].iloc[0]),
                        'high': float(hist['High'].max()),
                        'low': float(hist['Low'].min()),
                        'change_pct': ((hist['Close'].iloc[-1] - hist['Open'].iloc[0]) / hist['Open'].iloc[0]) * 100
                    }
            except Exception as e:
                print(f"Error fetching realtime data for {symbol}: {e}")
                data[symbol] = None
        
        return data
    
    def clear_cache(self):
        """Clear the data cache."""
        self._cache.clear()
        self._last_update.clear()


# Global instance
market_data = MarketDataFetcher()
