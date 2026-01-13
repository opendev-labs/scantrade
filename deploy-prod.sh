#!/bin/bash

# ScanTrade Production Deployment Script
# --------------------------------------

# Colors for professional output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
ORANGE='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${ORANGE}--- ScanTrade Production Deployer ---${NC}"
echo -e "${BLUE}+ Initializing pre-flight checks...${NC}"

# 1. Verify environment
if [ ! -f "package.json" ]; then
    echo -e "${RED}[ERROR] Execution failed: package.json not found in current directory.${NC}"
    exit 1
fi

# 2. Local Validation (Pro Check)
echo -e "${BLUE}+ Running local build validation...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Local build failed. Fix errors before pushing to production.${NC}"
    exit 1
fi
echo -e "${GREEN}+ Build validation PASSED.${NC}"

# 3. Environment Variable Reminder
echo -e "${ORANGE}[IMPORTANT] Ensure the following are set in Vercel Dashboard:${NC}"
echo -e "  - NEXTAUTH_SECRET (Genereated locally)"
echo -e "  - NEXTAUTH_URL (https://scantrade.vercel.app)"
echo -e "  - GOOGLE_CLIENT_ID / SECRET (If using OAuth)"

# 4. Push to GitHub (Triggers Vercel)
echo -e "${BLUE}+ Syncing local workspace to GitHub Production...${NC}"
git add .
git commit -m "prod: final workspace overhaul and deployment sync"
git push origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}--- DEPLOYMENT INITIALIZED ---${NC}"
    echo -e "${GREEN}+ GitHub successfully synchronized.${NC}"
    echo -e "${BLUE}+ Vercel is now building your changes.${NC}"
    echo -e "${ORANGE}+ Live URL: https://scantrade.vercel.app${NC}"
    echo -e "${ORANGE}+ Console: https://vercel.com/opendev-labs/scantrade/deployments${NC}"
else
    echo -e "${RED}[ERROR] GitHub sync failed. Check your network or permissions.${NC}"
    exit 1
fi
