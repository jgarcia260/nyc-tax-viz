# Manual Tooltip Verification Steps

1. Open http://localhost:3000/borough-map-3d in Chrome
2. Wait for 3D scene to fully load (10-15 seconds)
3. Hover mouse over Manhattan (center of map, red borough)
4. Verify tooltip appears with:
   - White background
   - Borough name in color (Manhattan = red)
   - Large revenue number ($8.00B)
   - Tax breakdown grid (Billionaire Tax 60%, Corporate Tax 50%)
   - Borough stats (Population, Area)
   - NO emoji
   - NO gradients
   - NO glows
5. Take screenshot (Cmd+Shift+4 on Mac, click and drag)
6. Save as screenshots/tooltip-manual-verification.png

OR use Playwright inspector:
```
PWDEBUG=1 npx playwright test
```

Then manually hover over borough and screenshot.
