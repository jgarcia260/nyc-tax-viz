import { chromium } from '@playwright/test';

const url = process.argv[2] || 'http://localhost:3000';
const outputPath = process.argv[3] || './screenshots/pr-tooltip-clean.png';

console.log(`📸 Screenshotting tooltip at: ${url}`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

try {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  
  // Wait for 3D scene to load
  console.log('⏳ Waiting for 3D scene to load...');
  await page.waitForTimeout(10000);
  
  // Move mouse to center of screen (where Manhattan should be)
  // This should trigger the tooltip
  console.log('🖱️  Moving mouse to trigger tooltip...');
  await page.mouse.move(960, 540);
  await page.waitForTimeout(1000);
  
  // Click to ensure tooltip appears
  await page.mouse.click(960, 540);
  await page.waitForTimeout(2000);
  
  const fullPath = outputPath.replace('~', process.env.HOME);
  await page.screenshot({ path: fullPath, fullPage: false });
  
  console.log(`✅ Screenshot saved to: ${fullPath}`);
} catch (error) {
  console.error('❌ Screenshot failed:', error.message);
} finally {
  await browser.close();
}
