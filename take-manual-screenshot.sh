#!/bin/bash
echo "🚀 Opening browser..."
open -a "Google Chrome" "http://localhost:3000/borough-map-3d"

echo "⏳ Waiting 15 seconds for 3D scene to load..."
sleep 15

echo "📸 You have 5 seconds to hover over a borough..."
echo "   Move your mouse over Manhattan (center, red borough) NOW!"
sleep 5

echo "📸 Taking screenshot in 2 seconds..."
sleep 2

# Take screenshot of entire screen
screencapture -x ~/code/nyc-tax-viz/screenshots/tooltip-manual-hover.png

echo "✅ Screenshot saved to screenshots/tooltip-manual-hover.png"
echo "   Check if tooltip is visible!"
