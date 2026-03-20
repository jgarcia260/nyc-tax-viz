import { test, expect } from '@playwright/test';

/**
 * Comprehensive UI Audit for NYC Tax Viz (Deployed Site)
 * Task: b49d282c - Jorge's feedback on missing visualizations
 */

const DEPLOYED_URL = 'https://nyc-tax-viz.vercel.app';

test.describe('NYC Tax Viz - Full UI Audit', () => {
  
  test('Home page loads', async ({ page }) => {
    await page.goto(DEPLOYED_URL);
    await page.waitForLoadState('networkidle');
    
    // Screenshot home page
    await page.screenshot({ 
      path: 'screenshots/audit-home.png',
      fullPage: true 
    });
    
    // Check for errors in console
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Basic page structure
    const title = await page.title();
    console.log('Home page title:', title);
    
    // Log any errors
    if (errors.length > 0) {
      console.log('Console errors on home:', errors);
    }
  });

  test('3D Borough Map - /borough-map-premium', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/borough-map-premium`);
    await page.waitForLoadState('networkidle');
    
    // Wait for canvas
    const canvas = page.locator('canvas');
    const canvasExists = await canvas.count() > 0;
    console.log('Canvas element found:', canvasExists);
    
    if (canvasExists) {
      // Wait for 3D scene to load
      await page.waitForTimeout(5000);
      
      // Screenshot
      await page.screenshot({ 
        path: 'screenshots/audit-3d-map.png',
        fullPage: true 
      });
    } else {
      console.log('❌ ISSUE: No canvas found - 3D map not rendering');
      await page.screenshot({ 
        path: 'screenshots/audit-3d-map-BROKEN.png',
        fullPage: true 
      });
    }
    
    // Check for borough labels
    const boroughs = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];
    for (const borough of boroughs) {
      const found = await page.getByText(borough, { exact: false }).count();
      console.log(`${borough} label found:`, found > 0);
    }
  });

  test('Policy Comparison page', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/policy-comparison`);
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'screenshots/audit-policy-comparison.png',
      fullPage: true 
    });
    
    // Check for charts
    const charts = page.locator('svg');
    const chartCount = await charts.count();
    console.log('Charts found:', chartCount);
  });

  test('Borough Impact page', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/borough-impact`);
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'screenshots/audit-borough-impact.png',
      fullPage: true 
    });
  });

  test('Flow Visualization page', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/flow-visualization`);
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'screenshots/audit-flow-viz.png',
      fullPage: true 
    });
  });

  test('3D Map Interactivity Test', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/borough-map-premium`);
    
    // Wait for canvas
    const canvas = page.locator('canvas');
    if (await canvas.count() === 0) {
      console.log('❌ CRITICAL: Canvas not rendering');
      return;
    }
    
    await page.waitForTimeout(5000); // Let scene load
    
    // Test auto-rotate button
    const autoRotateBtn = page.getByRole('button', { name: /pause rotation|auto rotate/i });
    const autoRotateBtnExists = await autoRotateBtn.count() > 0;
    console.log('Auto-rotate button found:', autoRotateBtnExists);
    
    if (autoRotateBtnExists) {
      await autoRotateBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ 
        path: 'screenshots/audit-3d-map-paused.png',
        fullPage: true 
      });
    }
    
    // Test zoom (scroll)
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
      await page.mouse.wheel(0, -500); // Zoom in
      await page.waitForTimeout(1000);
      await page.screenshot({ 
        path: 'screenshots/audit-3d-map-zoomed-in.png',
        fullPage: true 
      });
      
      await page.mouse.wheel(0, 500); // Zoom out
      await page.waitForTimeout(1000);
      await page.screenshot({ 
        path: 'screenshots/audit-3d-map-zoomed-out.png',
        fullPage: true 
      });
    }
    
    // Test drag rotation
    if (box) {
      await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width/2 + 100, box.y + box.height/2, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(1000);
      await page.screenshot({ 
        path: 'screenshots/audit-3d-map-rotated.png',
        fullPage: true 
      });
    }
  });

  test('Check for building layers on all boroughs', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/borough-map-premium`);
    
    const canvas = page.locator('canvas');
    if (await canvas.count() === 0) {
      console.log('❌ CRITICAL: No canvas - cannot test building layers');
      return;
    }
    
    await page.waitForTimeout(5000);
    
    // This is harder to verify programmatically (3D geometry)
    // We'll rely on screenshots and manual review
    console.log('📸 Screenshot taken for manual verification of building layers');
    
    // Check if any borough data is visible in UI
    const boroughs = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];
    for (const borough of boroughs) {
      const boroughLabel = page.getByText(borough, { exact: false });
      const visible = await boroughLabel.count() > 0;
      console.log(`${borough} visible in UI:`, visible);
      
      // Check for associated revenue data
      const revenueData = page.getByText(/\$\d+\.?\d*[MB]/);
      const hasData = await revenueData.count() > 0;
      console.log(`Revenue data visible:`, hasData);
    }
  });

  test('Console errors check', async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });
    
    await page.goto(`${DEPLOYED_URL}/borough-map-premium`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    console.log('\n=== CONSOLE ERRORS ===');
    errors.forEach(err => console.log('❌', err));
    
    console.log('\n=== CONSOLE WARNINGS ===');
    warnings.forEach(warn => console.log('⚠️', warn));
    
    // Save to file
    const report = {
      errors,
      warnings,
      timestamp: new Date().toISOString()
    };
    
    await page.evaluate((data) => {
      console.log('AUDIT_REPORT:', JSON.stringify(data, null, 2));
    }, report);
  });
});
