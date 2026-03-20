import { test } from '@playwright/test';

test('debug borough impact page', async ({ page }) => {
  console.log('\n=== DEBUGGING BOROUGH IMPACT ===\n');
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') errors.push(text);
    if (type === 'warning') warnings.push(text);
    console.log(`[${type.toUpperCase()}] ${text}`);
  });
  
  page.on('pageerror', error => {
    const errorMsg = `PageError: ${error.message}`;
    errors.push(errorMsg);
    console.log(errorMsg);
  });
  
  await page.goto('http://localhost:3000/borough-impact');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  const svgCount = await page.locator('svg.recharts-surface').count();
  console.log(`\nRecharts SVG elements found: ${svgCount}`);
  
  const pieChartCount = await page.locator('.recharts-wrapper').count();
  console.log(`Recharts wrapper elements found: ${pieChartCount}`);
  
  console.log(`\nTotal errors: ${errors.length}`);
  console.log(`Total warnings: ${warnings.length}`);
});
