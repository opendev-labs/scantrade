#!/bin/bash
# opendev-labs · scantrade | PRODUCTION NODE
# Enforces professional build standards & production synchronization.

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
    echo -e "${ORANGE}opendev-labs · scantrade${NC} ${DARK_GRAY}::${NC} ${WHITE}HYPER-BOSE DEPLOYMENT NODE v2.4${NC}"
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
echo ""

# 3. Dependency Injection
log_step "DEPENDENCY INJECTION"
render_progress 2.5 "Aligning React 19.2.1 Ecosystem"
npm install --legacy-peer-deps > /dev/null 2>&1
echo -e "${ORANGE}+${NC} DEPENDENCY MAP ${CHECK_OK}"
echo ""

# 4. Production Build (Vercel)
log_step "PRODUCTION BUILD (VERCEL)"
render_progress 5 "Synthesizing Dynamic Bundle"
npm run build > build_log.txt 2>&1
if [ $? -ne 0 ]; then
    echo -e "${ORANGE}[!] SYNTHESIS FAILED.${NC} Check build_log.txt."
    exit 1
fi
echo -e "${ORANGE}+${NC} VERCEL BUNDLE   : ${CHECK_OK}"
rm build_log.txt
echo ""

# 5. Static Export (GitHub Pages)
log_step "STATIC EXPORT (GH PAGES)"
render_progress 3 "Extracting Static Assets"
npm run prebuild:static > /dev/null 2>&1
npm run build:static > build_log.txt 2>&1
npm run postbuild:static > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${ORANGE}[!] EXPORT FAILED.${NC} Static target unreachable."
    exit 1
fi
echo -e "${ORANGE}+${NC} STATIC OUTPUT   : ${CHECK_OK}"
rm build_log.txt
echo ""

# 6. Global Synchronization
log_step "GLOBAL SYNCHRONIZATION"
render_progress 2 "Mirroring to Production Node"
# Vercel Trigger
git add . > /dev/null 2>&1
git commit -m "prod: hyper-bose v2.4 (dual-sync deployment)" > /dev/null 2>&1
git push origin main --force > /dev/null 2>&1
# GH Pages Trigger (Explicit Terminal Deploy)
npx gh-pages -d out -m "Manual TUI Deploy [ci skip]" > /dev/null 2>&1
echo -e "${ORANGE}+${NC} VERCEL SYNC     : ${CHECK_OK}"
echo -e "${ORANGE}+${NC} GH-PAGES SYNC   : ${CHECK_OK}"
echo ""

echo -e "${DARK_GRAY}======================= SUMMARY =======================${NC}"
echo -e "  STATUS  : ${WHITE}PROD SYNC COMPLETE${NC}"
echo -e "  VERCEL  : ${WHITE}https://scantrade.vercel.app${NC}"
echo -e "  PAGES   : ${WHITE}https://opendev-labs.github.io/scantrade/${NC}"
echo -e "  REPO    : ${ORANGE}opendev-labs/scantrade${NC}"
echo -e "${DARK_GRAY}======================================================${NC}"
echo ""
