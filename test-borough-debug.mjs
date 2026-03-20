import { chromium } from 'playwright';

async function debug() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  const warnings = [];
  
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') errors.push(text);
    if (type === 'warning') warnings.push(text);
  });
  
  page.on('pageerror', error => {
    errors.push(`PageError: ${error.message}`);
  });
  
  await page.goto('http://localhost:3000/borough-impact', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  console.log('\n=== PAGE ERRORS ===');
  if (errors.length === 0) {
    console.log('No errors found');
  } else {
    errors.forEach(err => console.log(err));
  }
  
  console.log('\n=== PAGE WARNINGS ===');
  if (warnings.length === 0) {
    console.log('No warnings found');
  } else {
    warnings.forEach(warn => console.log(warn));
  }
  
  // Check if Recharts elements exist
  const hasPieChart = await page.locator('svg.recharts-surface').count();
  console.log(`\n=== RECHARTS ELEMENTS ===`);
  console.log(`Recharts SVG elements found: ${hasPieChart}`);
  
  // Get the actual rendered HTML structure
  const mapContainer = await page.locator('.rounded-2xl.border.border-zinc-800').first().innerHTML();
  console.log('\n=== MAP CONTAINER HTML (first 500 chars) ===');
  console.log(mapContainer.substring(0, 500));
  
  await browser.close();
}

debug();
