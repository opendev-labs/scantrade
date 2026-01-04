"""
Trading engine - orchestrates scanners, bots, and risk management.
"""
import asyncio
from typing import Dict, List
from datetime import datetime
from config.settings import settings
from core.portfolio import portfolio
from governance.risk_manager import risk_manager
from utils.market_data import market_data

# Import scanners
from scanners.trend_alignment import TrendAlignmentScanner
from scanners.volatility_compression import VolatilityCompressionScanner
from scanners.momentum_divergence import MomentumDivergenceScanner
from scanners.support_resistance import SupportResistanceScanner
from scanners.volume_profile import VolumeProfileScanner

# Import bots
from bots.vwap_mean_reversion import VWAPMeanReversionBot
from bots.volatility_breakout import VolatilityBreakoutBot
from bots.momentum_accumulation import MomentumAccumulationBot
from bots.support_bounce import SupportBounceBot
from bots.trend_following import TrendFollowingBot


class TradingEngine:
    """Main trading engine that coordinates all components."""
    
    def __init__(self):
        self.running = False
        self.symbols = settings.symbols_list
        
        # Initialize scanners
        self.scanners = [
            TrendAlignmentScanner(self.symbols),
            VolatilityCompressionScanner(self.symbols),
            MomentumDivergenceScanner(self.symbols),
            SupportResistanceScanner(self.symbols),
            VolumeProfileScanner(self.symbols)
        ]
        
        # Initialize bots
        self.bots = [
            VWAPMeanReversionBot(self.symbols),
            VolatilityBreakoutBot(self.symbols),
            MomentumAccumulationBot(self.symbols),
            SupportBounceBot(self.symbols),
            TrendFollowingBot(self.symbols)
        ]
        
        self.last_update = datetime.utcnow()
    
    async def run_scanners(self):
        """Run all active scanners."""
        all_signals = []
        for scanner in self.scanners:
            if scanner.active:
                signals = scanner.scan()
                all_signals.extend(signals)
        return all_signals
    
    async def run_bots(self):
        """Execute all active bots."""
        # Check if trading should be paused
        if risk_manager.should_pause_trading():
            print("Trading paused due to risk limits")
            return
        
        for bot in self.bots:
            if bot.status == "active":
                bot.execute()
    
    async def update_market_data(self):
        """Update market prices for all positions."""
        if not portfolio.positions:
            return
        
        symbols = list(portfolio.positions.keys())
        prices = market_data.get_multiple_prices(symbols)
        portfolio.update_positions(prices)
    
    async def update_health_score(self):
        """Update system health score."""
        risk_manager.calculate_health_score()
    
    async def main_loop(self):
        """Main trading loop."""
        while self.running:
            try:
                # Update market data
                await self.update_market_data()
                
                # Run scanners
                await self.run_scanners()
                
                # Execute bots
                await self.run_bots()
                
                # Update health score
                await self.update_health_score()
                
                self.last_update = datetime.utcnow()
                
                # Wait before next iteration
                await asyncio.sleep(settings.data_update_interval)
                
            except Exception as e:
                print(f"Error in trading loop: {e}")
                await asyncio.sleep(10)
    
    def start(self):
        """Start the trading engine."""
        self.running = True
        print("Trading engine started")
    
    def stop(self):
        """Stop the trading engine."""
        self.running = False
        print("Trading engine stopped")
    
    def get_scanner_by_id(self, scanner_id: str):
        """Get scanner by ID."""
        for scanner in self.scanners:
            if scanner.scanner_id == scanner_id:
                return scanner
        return None
    
    def get_bot_by_id(self, bot_id: str):
        """Get bot by ID."""
        for bot in self.bots:
            if bot.bot_id == bot_id:
                return bot
        return None
    
    def get_system_status(self) -> Dict:
        """Get overall system status."""
        active_scanners = sum(1 for s in self.scanners if s.active)
        active_bots = sum(1 for b in self.bots if b.status == "active")
        
        return {
            'running': self.running,
            'last_update': self.last_update.isoformat(),
            'active_scanners': active_scanners,
            'total_scanners': len(self.scanners),
            'active_bots': active_bots,
            'total_bots': len(self.bots),
            'health_score': risk_manager.health_score,
            'portfolio_value': portfolio.get_portfolio_value(),
            'open_positions': len(portfolio.positions)
        }


# Global engine instance
engine = TradingEngine()
