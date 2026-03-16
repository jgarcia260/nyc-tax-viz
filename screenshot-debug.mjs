import { chromium } from '@playwright/test';

const url = process.argv[2] || 'http://localhost:3000/borough-map-3d';
const outputPath = process.argv[3] || '~/.openclaw/workspace/nyc-tax-viz-debug.png';

console.log(`📸 Screenshotting: ${url}`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

// Capture console logs
page.on('console', msg => console.log('🖥️  BROWSER:', msg.text()));
page.on('pageerror', error => console.error('❌ PAGE ERROR:', error.message));

try {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  
  // Wait longer for 3D scene to load and render
  console.log('⏱️  Waiting 10 seconds for 3D scene to fully render...');
  await page.waitForTimeout(10000);
  
  const fullPath = outputPath.replace('~', process.env.HOME);
  await page.screenshot({ path: fullPath, fullPage: false });
  
  console.log(`✅ Screenshot saved to: ${fullPath}`);
} catch (error) {
  console.error('❌ Screenshot failed:', error.message);
} finally {
  await browser.close();
}
