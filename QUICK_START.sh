#!/bin/bash
# 🚀 WrapGO Quick Commands

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     🎉 WrapGO: Landing Page + React Dashboard Merged      ║"
echo "║                Ready for Vercel Deployment                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 QUICK START COMMANDS${NC}"
echo ""

echo "1️⃣  ${GREEN}Install dependencies${NC}"
echo "   npm install"
echo ""

echo "2️⃣  ${GREEN}Run locally${NC}"
echo "   npm start"
echo "   Then visit:"
echo "   - Landing Page: http://localhost:3000/"
echo "   - Dashboard:    http://localhost:3000/app"
echo ""

echo "3️⃣  ${GREEN}Build for production${NC}"
echo "   npm run build"
echo ""

echo "4️⃣  ${GREEN}Deploy to Vercel${NC}"
echo "   Option A (GitHub integration - Recommended):"
echo "   - git add ."
echo "   - git commit -m 'Merged landing with dashboard'"
echo "   - git push origin main"
echo "   - Open https://vercel.com → New Project"
echo ""
echo "   Option B (CLI):"
echo "   - npm install -g vercel"
echo "   - vercel login"
echo "   - vercel --prod"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo ""

echo -e "${BLUE}📁 KEY FILES${NC}"
echo ""
echo "   App routing:"
echo "   └─ src/App.js (NEW - BrowserRouter)"
echo ""
echo "   Dashboard:"
echo "   └─ src/DashboardApp.js (original App.js)"
echo ""
echo "   Landing Page:"
echo "   ├─ src/Pages/Landing/LandingPage.js"
echo "   └─ public/landing/ (all HTML files)"
echo ""
echo "   Vercel config:"
echo "   └─ vercel.json"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo ""

echo -e "${BLUE}📚 DOCUMENTATION${NC}"
echo ""
echo "   Read these in order:"
echo "   1. MERGED_README.md (START HERE!)"
echo "   2. INTEGRATION_GUIDE.md (Quick setup)"
echo "   3. DEPLOYMENT.md (Full instructions)"
echo "   4. ARCHITECTURE.md (How it works)"
echo "   5. PRODUCTION_CHECKLIST.md (Before going live)"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo ""

echo -e "${YELLOW}⚙️  BEFORE PRODUCTION${NC}"
echo ""
echo "   Add to Vercel (Settings → Environment Variables):"
echo "   REACT_APP_SUPABASE_URL=https://xxx.supabase.co"
echo "   REACT_APP_SUPABASE_ANON_KEY=eyxxxx..."
echo ""

echo "═══════════════════════════════════════════════════════════"
echo ""

echo -e "${GREEN}✅ READY TO START!${NC}"
echo ""
echo "   Run this first:"
echo "   → npm install && npm start"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
