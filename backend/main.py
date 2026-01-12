import logging
import os
import asyncio
import uvicorn
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.FileHandler("trading_system.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("api")

from config.settings import settings
from models.database import init_db
from core.engine import engine

# Import API routers
from api import dashboard, scanners, bots, governance, logs


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown."""
    # Startup
    print("Initializing database...")
    init_db()
    
    print("Starting trading engine...")
    engine.start()
    
    # Start engine loop in background
    engine_task = asyncio.create_task(engine.main_loop())
    
    yield
    
    # Shutdown
    print("Stopping trading engine...")
    engine.stop()
    engine_task.cancel()


# Create FastAPI app
app = FastAPI(
    title="ScanTrade API",
    description="Backend API for ScanTrade market screeners",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])
app.include_router(scanners.router, prefix="/api/scanners", tags=["scanners"])
app.include_router(bots.router, prefix="/api/bots", tags=["bots"])
app.include_router(governance.router, prefix="/api/governance", tags=["governance"])
app.include_router(logs.router, prefix="/api/logs", tags=["logs"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Governed Trading System API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "engine_running": engine.running
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
