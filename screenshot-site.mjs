import { chromium } from '@playwright/test';

const url = process.argv[2] || 'https://nyc-tax-viz.vercel.app/borough-map-3d';
const outputPath = process.argv[3] || '~/.openclaw/workspace/nyc-tax-viz-screenshot.png';

console.log(`📸 Screenshotting: ${url}`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

try {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  
  // Wait for 3D scene to load
  await page.waitForTimeout(3000);
  
  const fullPath = outputPath.replace('~', process.env.HOME);
  await page.screenshot({ path: fullPath, fullPage: false });
  
  console.log(`✅ Screenshot saved to: ${fullPath}`);
} catch (error) {
  console.error('❌ Screenshot failed:', error.message);
} finally {
  await browser.close();
}
