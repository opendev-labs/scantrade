#!/bin/bash
# opendev-labs · scantrade | DEV ENVIRONMENT
# High-density workspace initialization and port management.

# --- Theme Configuration (v2.4 White-Dominant) ---
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
        # White-dominant bar with orange accent biomarker
        echo -ne "\r${ORANGE}+${NC} ${WHITE}${label}${NC}        ${DARK_GRAY}[${WHITE}${filled}${DARK_GRAY}${empty}${DARK_GRAY}] ${percent}%"
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
    echo -e "${ORANGE}opendev-labs · scantrade${NC} ${DARK_GRAY}::${NC} ${WHITE}HYPER-BOSE DEV CONSOLE v2.4${NC}"
    echo -e "${DARK_GRAY}------------------------------------------------------------${NC}"
    echo ""
}

# --- Execution ---
header

# 1. Port Intelligence (Verified Terminator)
log_step "PORT INTELLIGENCE"
cleanup_port() {
    local port=$1
    render_progress 0.5 "Scanning Port $port"
    
    # Aggressive Kill Loop
    for i in {1..5}; do
        local pids=$(lsof -t -i:$port)
        if [ -n "$pids" ]; then
            kill -9 $pids 2>/dev/null
            sleep 0.3
        else
            break
        fi
    done
    
    # Final Confirmation
    if lsof -t -i:$port >/dev/null; then
        echo -e "  ${ORANGE}! CRITICAL:${NC} Port $port bind persistent. Verify manually."
    else
        echo -e "${ORANGE}+${NC} PORT $port ${CHECK_OK}"
    fi
}

cleanup_port 3000
echo ""

# 2. Workspace Optimization
log_step "OPTIMIZING WORKSPACE"
render_progress 0.4 "Clearing stale dev locks"
if [ -f ".next/dev/lock" ]; then
  rm -f ".next/dev/lock"
fi
echo -e "${ORANGE}+${NC} CACHE INTELLIGENCE ${CHECK_OK}"
echo ""

# 3. Dependency Audit
log_step "DEPENDENCY AUDIT"
if [ ! -d "node_modules" ]; then
    render_progress 2.5 "Initializing Node Stack"
    npm install --legacy-peer-deps > /dev/null 2>&1
    echo -e "${ORANGE}+${NC} STACK INITIALIZED ${CHECK_OK}"
else
    render_progress 0.3 "Verifying Integrity"
    echo -e "${ORANGE}+${NC} STACK VERIFIED ${CHECK_OK}"
fi
echo -e "${ORANGE}+${NC} React 19.2.1 / Next.js 16.0.10: ${CHECK_OK}"
echo ""

# 4. Launch Sequence
log_step "LAUNCH SEQUENCE"
render_progress 1.2 "Warming up Turbopack"
echo -e "${ORANGE}+${NC} NODE URL   : ${WHITE}http://localhost:3000${NC}"
echo -e "${ORANGE}+${NC} ENGINE     : ${WHITE}Turbopack${NC}"
echo -e "${ORANGE}+${NC} TERMINAL   : ${WHITE}READY${NC}"
echo ""

echo -e "${DARK_GRAY}======================= STATUS =======================${NC}"
echo -e "  STATUS  : ${WHITE}HYPER-BOSE ACTIVE${NC}"
echo -e "  NODE    : ${WHITE}http://localhost:3000${NC}"
echo -e "  PORTS   : ${WHITE}3000${NC}"
echo -e "${DARK_GRAY}======================================================${NC}"
echo ""

export NEXTJS_CONFIG_CWD=$(pwd)
PORT=3000 npm run dev
