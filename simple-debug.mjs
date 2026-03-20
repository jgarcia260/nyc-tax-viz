import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('[ERROR]', msg.text());
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.log('[PAGE ERROR]', error.message);
    errors.push(error.message);
  });
  
  console.log('Navigating to page...');
  await page.goto('http://localhost:3000/borough-impact');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  const svgCount = await page.locator('svg.recharts-surface').count();
  console.log(`\nRecharts SVG elements: ${svgCount}`);
  
  const wrapperCount = await page.locator('.recharts-wrapper').count();
  console.log(`Recharts wrapper elements: ${wrapperCount}`);
  
  console.log(`\nTotal errors: ${errors.length}`);
  
  await browser.close();
})();
