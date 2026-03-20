import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3001/borough-impact');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  const svgCount = await page.locator('svg.recharts-surface').count();
  const pieSlices = await page.locator('path.recharts-pie-sector').count();
  
  console.log(`\n✅ Verification Results:`);
  console.log(`   Recharts SVG elements: ${svgCount}`);
  console.log(`   Pie chart slices: ${pieSlices}`);
  
  if (svgCount > 0 && pieSlices > 0) {
    console.log(`\n🎉 SUCCESS: Borough Impact map is rendering!`);
  } else {
    console.log(`\n❌ FAIL: Chart still not rendering`);
  }
  
  await browser.close();
})();
