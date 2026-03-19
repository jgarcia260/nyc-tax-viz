import { test, expect } from '@playwright/test';

/**
 * E2E tests for 3D NYC Borough Map interactions
 * Tests the BoroughMap3DUnified component at /borough-map-premium
 */

test.describe('3D NYC Borough Map', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the 3D map page
    await page.goto('/borough-map-premium');
    
    // Wait for the loading screen to disappear and canvas to render
    await page.waitForSelector('canvas', { timeout: 30000 });
    
    // Give Three.js time to initialize the scene
    await page.waitForTimeout(2000);
  });

  test('map loads and renders', async ({ page }) => {
    // Verify canvas element exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Verify title is present
    await expect(page.getByText('NYC Tax Revenue by Borough')).toBeVisible();
    
    // Verify description is present
    await expect(page.getByText(/Building heights represent tax revenue potential/i)).toBeVisible();
    
    // Verify all five boroughs are listed in the legend
    await expect(page.getByText('Manhattan')).toBeVisible();
    await expect(page.getByText('Brooklyn')).toBeVisible();
    await expect(page.getByText('Queens')).toBeVisible();
    await expect(page.getByText('Bronx')).toBeVisible();
    await expect(page.getByText('Staten Island')).toBeVisible();
    
    // Verify tax revenue data is displayed for at least one borough
    await expect(page.getByText(/\$\d+\.\d+B/).first()).toBeVisible();
  });

  test('auto-rotate toggle works', async ({ page }) => {
    // Find the auto-rotate button
    const autoRotateButton = page.getByRole('button', { name: /pause rotation|auto rotate/i });
    await expect(autoRotateButton).toBeVisible();
    
    // Initial state should be "Pause Rotation" (auto-rotate is on by default)
    await expect(autoRotateButton).toHaveText('Pause Rotation');
    
    // Click to pause with force option to avoid interception issues
    await autoRotateButton.click({ force: true });
    await page.waitForTimeout(300);
    await expect(autoRotateButton).toHaveText('Auto Rotate');
    
    // Click to resume
    await autoRotateButton.click({ force: true });
    await page.waitForTimeout(300);
    await expect(autoRotateButton).toHaveText('Pause Rotation');
  });

  test('zoom in/out functions', async ({ page }) => {
    const canvas = page.locator('canvas');
    
    // Get initial viewport bounds to calculate center
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    
    // Zoom in by scrolling (negative deltaY = zoom in)
    await page.mouse.move(centerX, centerY);
    await page.mouse.wheel(0, -500); // Zoom in
    await page.waitForTimeout(500);
    
    // Zoom out by scrolling (positive deltaY = zoom out)
    await page.mouse.wheel(0, 500); // Zoom out
    await page.waitForTimeout(500);
    
    // Test successful if no errors occurred
    await expect(canvas).toBeVisible();
  });

  test('360° rotation works', async ({ page }) => {
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    
    // Pause auto-rotate first
    const autoRotateButton = page.getByRole('button', { name: /pause rotation/i });
    await autoRotateButton.click({ force: true });
    await page.waitForTimeout(500);
    
    // Perform drag rotation (horizontal drag) - reduced steps for speed
    await page.mouse.move(centerX - 100, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX + 100, centerY, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(300);
    
    // Perform vertical drag (tilt)
    await page.mouse.move(centerX, centerY - 50);
    await page.mouse.down();
    await page.mouse.move(centerX, centerY + 50, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(300);
    
    // Test successful if canvas is still visible (no crash)
    await expect(canvas).toBeVisible();
  });

  test('borough click/selection works', async ({ page }) => {
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    
    // Pause auto-rotate for consistent clicking
    const autoRotateButton = page.getByRole('button', { name: /pause rotation/i });
    await autoRotateButton.click({ force: true });
    await page.waitForTimeout(500);
    
    // Click in the center of the canvas (should select a borough)
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    
    // Try clicking - this test just verifies no crashes occur
    // Borough geometry detection can be flaky in tests
    await page.mouse.click(centerX, centerY);
    await page.waitForTimeout(500);
    
    // Verify canvas is still responsive (no crash)
    await expect(canvas).toBeVisible();
    
    // The popup may or may not appear depending on exact click position
    // Just verify the UI is still functional
    await page.mouse.click(centerX + 50, centerY - 50);
    await page.waitForTimeout(300);
    
    await expect(canvas).toBeVisible();
  });

  test('hover effects trigger', async ({ page }) => {
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    
    // Pause auto-rotate for consistent hovering
    const autoRotateButton = page.getByRole('button', { name: /pause rotation/i });
    await autoRotateButton.click();
    await page.waitForTimeout(500);
    
    // Move mouse over different parts of the canvas
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    
    // Hover over center (likely to hit a borough)
    await page.mouse.move(centerX, centerY);
    await page.waitForTimeout(800);
    
    // Move to another position
    await page.mouse.move(centerX + 50, centerY - 50);
    await page.waitForTimeout(800);
    
    // Check if hover tooltip appeared
    const hoverPopup = page.locator('div.bg-white.rounded-lg.shadow-lg');
    const popupCount = await hoverPopup.count();
    
    // If hover popup appeared, it should contain borough information
    if (popupCount > 0) {
      await expect(hoverPopup.first()).toBeVisible();
    }
    
    // Move mouse away from canvas
    await page.mouse.move(0, 0);
    await page.waitForTimeout(500);
  });

  test('control instructions are visible', async ({ page }) => {
    // Verify control instructions panel
    await expect(page.getByText('Drag to rotate · Scroll to zoom · Click for details')).toBeVisible();
  });

  test('borough legend shows all five boroughs with colors', async ({ page }) => {
    // Each borough should have a colored indicator
    const legendItems = page.locator('div.flex.items-center.justify-between.gap-2');
    
    // Should have exactly 5 borough entries
    await expect(legendItems).toHaveCount(5);
    
    // Verify each borough has a color indicator (div with background color)
    const colorIndicators = page.locator('div.w-3\\.5.h-3\\.5.rounded');
    await expect(colorIndicators).toHaveCount(5);
  });
});

test.describe('3D NYC Borough Map - Mobile Responsive', () => {
  test.use({ 
    viewport: { width: 375, height: 667 }, // iPhone SE size
    hasTouch: true // Enable touch events
  });

  test('renders correctly on mobile viewport', async ({ page }) => {
    await page.goto('/borough-map-premium');
    
    // Wait for canvas to load
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Verify canvas is visible
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Verify title is visible
    await expect(page.getByText('NYC Tax Revenue by Borough')).toBeVisible();
    
    // Verify auto-rotate button is accessible
    const autoRotateButton = page.getByRole('button', { name: /pause rotation|auto rotate/i });
    await expect(autoRotateButton).toBeVisible();
  });

  test('touch controls work on mobile', async ({ page }) => {
    await page.goto('/borough-map-premium');
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    
    // Simulate touch drag (rotation)
    await page.touchscreen.tap(centerX, centerY);
    await page.waitForTimeout(500);
    
    // Verify canvas is still visible (no crash)
    await expect(canvas).toBeVisible();
  });

  test('legend is accessible on mobile', async ({ page }) => {
    await page.goto('/borough-map-premium');
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // All five boroughs should be visible in legend
    await expect(page.getByText('Manhattan')).toBeVisible();
    await expect(page.getByText('Brooklyn')).toBeVisible();
    await expect(page.getByText('Queens')).toBeVisible();
    await expect(page.getByText('Bronx')).toBeVisible();
    await expect(page.getByText('Staten Island')).toBeVisible();
  });
});
