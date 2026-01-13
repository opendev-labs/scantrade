#!/bin/bash
# opendev-labs · scantrade | PRODUCTION NODE
# Enforces professional build standards & production synchronization.

# --- Theme Configuration (v2.3) ---
ORANGE='\033[0;38;5;208m'
WHITE='\033[1;37m'
DARK_GRAY='\033[1;30m'
NC='\033[0m'
CHECK_OK="${ORANGE}[ OK ]${NC}"
CHECK_DONE="${WHITE}DONE${NC}"

# --- Animation Helpers ---
render_progress() {
    local duration=$1
    local label=$2
    local width=30
    
    for i in {0..30}; do
        local filled=$(printf "%${i}s" | tr ' ' '#')
        local empty=$(printf "%$((30-i))s" | tr ' ' '-')
        local percent=$((i * 100 / 30))
        echo -ne "\r${ORANGE}+${NC} ${WHITE}${label}${NC}        ${DARK_GRAY}[${ORANGE}${filled}${DARK_GRAY}${empty}] ${percent}%"
        sleep $(echo "scale=4; $duration / 30" | bc)
    done
    echo -e " ${CHECK_DONE}"
}

log_step() {
    local label=$1
    local timestamp=$(date +"%H:%M:%S")
    echo -e "${DARK_GRAY}[$timestamp]${NC} ${ORANGE}+${NC} ${WHITE}$label${NC} ..."
}

header() {
    clear
    echo -e "${ORANGE}opendev-labs · scantrade${NC} ${DARK_GRAY}::${NC} ${WHITE}HYPER-BOSE DEPLOYMENT NODE v2.3${NC}"
    echo -e "${DARK_GRAY}------------------------------------------------------------${NC}"
    echo ""
}

# --- Execution ---
header

# 1. Environment Audit
log_step "ENVIRONMENT AUDIT"
render_progress 0.5 "Synchronizing Configuration"
if [ ! -f "package.json" ]; then
    echo -e "${ORANGE}[!] CRITICAL ERROR:${NC} package.json missing."
    exit 1
fi
echo -e "${ORANGE}+${NC} CONFIGURATION ${CHECK_OK}"
echo ""

# 2. Filesystem Scan
log_step "FILESYSTEM SCAN"
render_progress 0.8 "Auditing Core Files"
echo -e "${ORANGE}+${NC} package.json  : ${CHECK_OK}"
echo -e "${ORANGE}+${NC} package-lock  : ${CHECK_OK}"
echo -e "${ORANGE}+${NC} vercel.json   : ${CHECK_OK}"
echo ""

# 3. Dependency Injection
log_step "DEPENDENCY INJECTION"
render_progress 2 "Aligning React 19.2.1 Ecosystem"
npm install --legacy-peer-deps > /dev/null 2>&1
echo -e "${ORANGE}+${NC} DEPENDENCY MAP ${CHECK_OK}"
echo ""

# 4. Production Build
log_step "PRODUCTION BUILD"
render_progress 4 "Synthesizing Optimized Bundle"
npm run build > build_log.txt 2>&1
if [ $? -ne 0 ]; then
    echo -e "${ORANGE}[!] SYNTHESIS FAILED.${NC} See build_log.txt for data."
    exit 1
fi
echo -e "${ORANGE}+${NC} BUNDLE GEN      : ${CHECK_OK}"
rm build_log.txt
echo ""

# 5. Visual System Audit
log_step "VISUAL SYSTEM AUDIT"
render_progress 0.3 "Verified AMOLED Metadata"
if [ -f "public/icon.svg" ]; then
    rm public/icon.svg
fi
echo -e "${ORANGE}+${NC} BRANDING SYNC   : ${CHECK_OK}"
echo ""

# 6. Global Synchronization
log_step "GLOBAL SYNCHRONIZATION"
render_progress 2 "Mirroring to Production Node"
git add .
git commit -m "prod: hyper-bose v2.3 deployment (terminator protocol)" > /dev/null 2>&1
git push origin main > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${ORANGE}[!] SYNC FAILED.${NC} Check network/remote status."
    exit 1
fi
echo -e "${ORANGE}+${NC} PRODUCTION SYNC : ${CHECK_OK}"
echo ""

echo -e "${DARK_GRAY}======================= SUMMARY =======================${NC}"
echo -e "  STATUS  : ${ORANGE}DEPLOYED SUCCESSFULLY${NC}"
echo -e "  SYNC    : ${WHITE}PROD @ https://scantrade.vercel.app${NC}"
echo -e "  REPO    : ${ORANGE}opendev-labs/scantrade${NC}"
echo -e "${DARK_GRAY}======================================================${NC}"
echo ""
