# NYC Tax Viz - Agent Workflows

**This file contains agent-specific commands, workflows, and automation patterns.**

## Development Commands

### Start Dev Server
```bash
npm run dev
# Starts on http://localhost:3005 (NOT 3000!)
# Open: http://localhost:3005/borough-map-3d
```

### Run Tests
```bash
npm test              # Run all vitest unit tests
npm run test:e2e      # Run Playwright E2E tests (if needed)
```

### Build for Production
```bash
npm run build         # Next.js production build
npm start             # Preview production build locally
```

### Visual Verification
```bash
# Screenshot before changes
node screenshot-site.mjs http://localhost:3005/borough-map-3d ~/code/nyc-tax-viz/screenshots/before-$(date +%s).png

# Make your changes...

# Screenshot after changes
node screenshot-site.mjs http://localhost:3005/borough-map-3d ~/code/nyc-tax-viz/screenshots/after-$(date +%s).png

# Compare visually
open ~/code/nyc-tax-viz/screenshots/before-*.png
open ~/code/nyc-tax-viz/screenshots/after-*.png
```

## Standard Workflows

### 1. Fix Visual Bug (e.g., buildings too large)

```bash
cd ~/code/nyc-tax-viz

# Create feature branch
git checkout -b fix/visual-issue-description

# Start dev server (background)
npm run dev &
sleep 5  # Wait for server to start

# Screenshot BEFORE
node screenshot-site.mjs http://localhost:3005/borough-map-3d screenshots/before-fix.png

# Make changes to src/components/BoroughMap3DUnified.tsx
# Example: Change BUILDING_SCALE_MULTIPLIER from 500 to 25

# Screenshot AFTER
node screenshot-site.mjs http://localhost:3005/borough-map-3d screenshots/after-fix.png

# Verify tests pass
npm test

# Verify build succeeds
npm run build

# Commit changes
git add -A
git commit -m "fix: reduce building scale to realistic size (500x → 25x)"

# Push branch (DO NOT CREATE PR YET - signal for QA)
git push origin fix/visual-issue-description

# Signal QA needed
echo "QA_NEEDED|branch=fix/visual-issue-description|attempt=1"
```

### 2. Add New Feature

```bash
cd ~/code/nyc-tax-viz
git checkout -b feat/feature-name

# Make changes
# Write tests for new feature
# Run tests: npm test
# Screenshot if visual changes

# Commit and push
git add -A
git commit -m "feat: add feature-name"
git push origin feat/feature-name

# Signal QA
echo "QA_NEEDED|branch=feat/feature-name|attempt=1"
```

### 3. Fix Merge Conflicts

```bash
cd ~/code/nyc-tax-viz
git checkout fix/your-branch
git fetch origin main
git merge origin/main

# Resolve conflicts in editor
# For BUILDING_SCALE_MULTIPLIER conflicts: KEEP your fix (usually ~25), NOT main's value

# Verify no conflict markers remain
git grep "<<<<<<< HEAD"  # Should return nothing

# Test after resolving
npm test
npm run dev  # Verify visually

# Commit resolved conflicts
git add -A
git commit -m "chore: resolve merge conflicts with main"
git push origin fix/your-branch --force-with-lease

# Signal QA
echo "QA_NEEDED|branch=fix/your-branch|attempt=2"
```

## Critical Checks Before Pushing

**Run this checklist every time:**

```bash
# 1. No conflict markers
git grep "<<<<<<< HEAD"  # Should be empty

# 2. Tests pass
npm test

# 3. Build succeeds
npm run build

# 4. Visual verification (if UI changes)
node screenshot-site.mjs http://localhost:3005/borough-map-3d screenshots/verify.png
# Check screenshot looks correct

# 5. No TypeScript errors
npm run build  # Will fail if TS errors

# 6. BUILDING_SCALE_MULTIPLIER is reasonable
grep "BUILDING_SCALE_MULTIPLIER" src/components/BoroughMap3DUnified.tsx
# Should be ~20-40, NOT >50
```

## Common Tasks

### Update Building Scale
```bash
# Edit src/components/BoroughMap3DUnified.tsx
# Find: const BUILDING_SCALE_MULTIPLIER = <number>
# Change to value between 20-40

# CRITICAL: Screenshot before/after
# CRITICAL: Test on localhost before pushing
```

### Fix Screenshot Timeout
```bash
# Edit screenshot-site.mjs
# Find: timeout: 30000
# Change to: timeout: 60000

# Also update page.screenshot timeout:
# Find: await page.screenshot({ path: fullPath, fullPage: false });
# Change to: await page.screenshot({ path: fullPath, fullPage: false, timeout: 60000 });
```

### Exclude Tests from Vitest
```bash
# Edit vitest.config.ts
# Add to test.exclude array:
exclude: ['**/node_modules/**', '**/dist/**', 'tests/**']

# This prevents vitest from running Playwright E2E tests
```

## Git Workflow

### Branch Naming
- `fix/` - Bug fixes
- `feat/` - New features
- `refactor/` - Code refactoring
- `test/` - Test additions
- `docs/` - Documentation

### Commit Messages
```
fix: reduce building scale to realistic size (500x → 25x)
feat: add borough color customization
refactor: extract building generation to separate function
test: add tests for coordinate projection
docs: update AGENT.md with new workflows
```

## Troubleshooting

### Dev Server Issues

**Port already in use:**
```bash
lsof -ti:3005 | xargs kill -9
npm run dev
```

**Module not found:**
```bash
rm -rf node_modules .next
npm install
npm run dev
```

### Test Failures

**Vitest picking up Playwright tests:**
```bash
# Update vitest.config.ts to exclude tests/**
# See "Exclude Tests from Vitest" section above
```

**Tests pass locally but fail in CI:**
```bash
# Likely environment differences
# Check Node version matches CI (22.x)
node --version
```

### Build Failures

**TypeScript errors:**
```bash
# Run type checking
npm run build
# Fix all TS errors before committing
```

**Missing dependencies:**
```bash
npm install
npm run build
```

## QA Integration

### After completing work, DO NOT auto-merge
Instead:
1. Push branch to GitHub
2. Signal QA needed: `echo "QA_NEEDED|branch=<branch-name>|attempt=<1-3>"`
3. Main session will spawn QA sub-agent
4. QA will verify, create PR, and merge if approved
5. If QA fails, you'll get feedback and retry (max 3 attempts)

### QA Checks
- Tests pass
- Build succeeds
- No merge conflicts
- Visual verification (if UI changes)
- No TypeScript errors

### Max Retries
- **Attempt 1:** Initial work
- **Attempt 2:** Fix issues from QA feedback
- **Attempt 3:** Final attempt (if fails → escalate to Jorge)

## Screenshot Guidelines

### When to Screenshot
- ANY change to `BoroughMap3DUnified.tsx`
- ANY change to building scale/position/color
- ANY change to camera/lighting
- ANY new UI elements
- Before merging to main

### Screenshot Commands
```bash
# Before
node screenshot-site.mjs http://localhost:3005/borough-map-3d screenshots/before-$(date +%s).png

# After
node screenshot-site.mjs http://localhost:3005/borough-map-3d screenshots/after-$(date +%s).png

# Production check (use sparingly - costs Vercel bandwidth)
node screenshot-site.mjs https://nyc-tax-viz.vercel.app/borough-map-3d screenshots/prod-$(date +%s).png
```

### Screenshot Storage
- Save to: `~/code/nyc-tax-viz/screenshots/`
- Keep last 10 screenshots per feature
- Delete older ones to save space

## Performance Optimization

### If 3D rendering is slow:
1. Check `BUILDING_SCALE_MULTIPLIER` isn't too high
2. Reduce number of buildings generated
3. Simplify building geometry
4. Check for memory leaks in Three.js scene

### If builds are slow:
1. Clear `.next/` cache: `rm -rf .next`
2. Rebuild: `npm run build`

---

**For Questions/Issues:** Check docs/CONTEXT.md or escalate to Jorge via AI Flow inbox.
