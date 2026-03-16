import { chromium } from '@playwright/test';

const url = process.argv[2] || 'https://nyc-tax-viz.vercel.app/borough-map-3d';
const outputPath = process.argv[3] || '~/.openclaw/workspace/nyc-tax-viz-screenshot.png';

console.log(`📸 Screenshotting: ${url}`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

// Capture console logs from the page
page.on('console', msg => {
  const type = msg.type();
  const text = msg.text();
  if (type === 'error') {
    console.error(`[Browser Error] ${text}`);
  } else if (type === 'warn') {
    console.warn(`[Browser Warn] ${text}`);
  } else if (text.includes('[Borough') || text.includes('Created geometry') || text.includes('buildings')) {
    console.log(`[Browser] ${text}`);
  }
});

try {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  
  // Check if page has canvas (3D viz) or is a regular page
  const hasCanvas = await page.locator('canvas').count() > 0;
  
  if (hasCanvas) {
    console.log('[Screenshot] Waiting for canvas to render...');
    await page.waitForSelector('canvas', { timeout: 10000 });
    // Wait for scene to fully initialize (longer timeout for complex 3D scene)
    await page.waitForTimeout(20000); // 20 seconds for Three.js scene, buildings, and post-processing
    console.log('[Screenshot] Canvas element found, capturing...');
  } else {
    console.log('[Screenshot] No canvas found, waiting for page to settle...');
    await page.waitForTimeout(2000); // 2 seconds for regular page
  }
  
  const fullPath = outputPath.replace('~', process.env.HOME);
  await page.screenshot({ path: fullPath, fullPage: false });
  
  console.log(`✅ Screenshot saved to: ${fullPath}`);
} catch (error) {
  console.error('❌ Screenshot failed:', error.message);
} finally {
  await browser.close();
}
