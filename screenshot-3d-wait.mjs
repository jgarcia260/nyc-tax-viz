import { chromium } from '@playwright/test';

const url = process.argv[2] || 'http://localhost:3456/borough-map-premium';
const outputPath = process.argv[3] || '~/.openclaw/workspace/nyc-tax-viz-3d.png';

console.log(`📸 Screenshotting 3D visualization: ${url}`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

try {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  
  // Wait longer for 3D scene to fully render (WebGL initialization, asset loading, animations)
  console.log('⏳ Waiting for 3D scene to load...');
  await page.waitForTimeout(8000);
  
  const fullPath = outputPath.replace('~', process.env.HOME);
  await page.screenshot({ path: fullPath, fullPage: false });
  
  console.log(`✅ Screenshot saved to: ${fullPath}`);
} catch (error) {
  console.error('❌ Screenshot failed:', error.message);
} finally {
  await browser.close();
}
