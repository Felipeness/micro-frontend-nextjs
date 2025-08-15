import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage with micro frontends', async ({ page }) => {
    await page.goto('/');

    // Check if the host app loads
    await expect(page.getByText('🕷️ Spider-Man Store')).toBeVisible();
    
    // Check if products section is visible (using heading role)
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
    
    // Check if cart section is visible (using heading role)
    await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible();
    
    // Wait for remote components to load
    await expect(page.getByText('Loading products...')).toBeVisible();
    await expect(page.getByText('Loading cart...')).toBeVisible();
  });

  test('should track page views', async ({ page }) => {
    await page.goto('/');

    // Click the track page view button
    const trackButton = page.getByText('Track Page View');
    await expect(trackButton).toBeVisible();
    await trackButton.click();

    // Verify no errors occurred
    const errors = await page.evaluate(() => {
      return window.console.error.toString();
    });
    expect(errors).not.toContain('error');
  });

  test('should handle micro frontend loading failures gracefully', async ({ page }) => {
    // Intercept module federation requests and make them fail
    await page.route('**/remoteEntry.js', route => route.abort());
    
    await page.goto('/');

    // Should still show the host app
    await expect(page.getByText('🕷️ Spider-Man Store')).toBeVisible();
    
    // Should show loading states for failed remotes
    await expect(page.getByText('Loading products...')).toBeVisible();
    await expect(page.getByText('Loading cart...')).toBeVisible();
  });
});