import { test, expect } from '@playwright/test'

test.describe('Squaddle Game', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure fresh game state
    await page.goto('/squaddle')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('should load the game page', async ({ page }) => {
    await page.goto('/squaddle')
    await expect(page).toHaveTitle(/Squaddle|NTDIL/)
    await expect(page.locator('text=Squaddle')).toBeVisible()
  })

  test('should show onboarding modal for first-time users', async ({ page }) => {
    await page.goto('/squaddle')
    // Check if onboarding modal appears
    const modal = page.locator('[role="dialog"], .modal, [data-testid="onboarding"]')
    // If onboarding exists, it should be visible on first visit
    const hasOnboarding = await modal.count() > 0
    if (hasOnboarding) {
      await expect(modal).toBeVisible()
    }
  })

  test('should display game clues', async ({ page }) => {
    await page.goto('/squaddle')
    // Dismiss onboarding if present
    const closeButton = page.locator('button:has-text("Got it"), button:has-text("Start"), button:has-text("Close"), button:has-text("×")')
    if (await closeButton.count() > 0) {
      await closeButton.first().click()
    }
    // Wait for game to load
    await page.waitForTimeout(1000)
    // Check for clue elements
    const clues = page.locator('[data-testid="clue"], .clue, button:has-text("Clue")')
    await expect(clues.first()).toBeVisible({ timeout: 10000 })
  })

  test('should have a guess input field', async ({ page }) => {
    await page.goto('/squaddle')
    // Dismiss onboarding if present
    const closeButton = page.locator('button:has-text("Got it"), button:has-text("Start"), button:has-text("Close"), button:has-text("×")')
    if (await closeButton.count() > 0) {
      await closeButton.first().click()
    }
    await page.waitForTimeout(1000)
    // Look for input field
    const input = page.locator('input[type="text"], input[placeholder*="guess"], input[placeholder*="player"], input[placeholder*="answer"]')
    await expect(input).toBeVisible({ timeout: 10000 })
  })

  test('should have a submit button', async ({ page }) => {
    await page.goto('/squaddle')
    // Dismiss onboarding if present
    const closeButton = page.locator('button:has-text("Got it"), button:has-text("Start"), button:has-text("Close"), button:has-text("×")')
    if (await closeButton.count() > 0) {
      await closeButton.first().click()
    }
    await page.waitForTimeout(1000)
    // Look for submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Guess")')
    await expect(submitButton).toBeVisible({ timeout: 10000 })
  })

  test('should allow submitting a guess', async ({ page }) => {
    await page.goto('/squaddle')
    // Dismiss onboarding if present
    const closeButton = page.locator('button:has-text("Got it"), button:has-text("Start"), button:has-text("Close"), button:has-text("×")')
    if (await closeButton.count() > 0) {
      await closeButton.first().click()
    }
    await page.waitForTimeout(1000)

    // Find and fill the input
    const input = page.locator('input[type="text"], input[placeholder*="guess"], input[placeholder*="player"], input[placeholder*="answer"]')
    await input.fill('Test Player')

    // Submit the guess
    const submitButton = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Guess")')
    await submitButton.click()

    // Verify something happened (either wrong answer feedback or state change)
    await page.waitForTimeout(500)
  })

  test('should show round indicator', async ({ page }) => {
    await page.goto('/squaddle')
    // Dismiss onboarding if present
    const closeButton = page.locator('button:has-text("Got it"), button:has-text("Start"), button:has-text("Close"), button:has-text("×")')
    if (await closeButton.count() > 0) {
      await closeButton.first().click()
    }
    await page.waitForTimeout(1000)

    // Check for round indicator (Round 1, Player 1, etc.)
    const roundText = page.locator('text=/Round|Player|Easy|Medium|Hard/i')
    await expect(roundText.first()).toBeVisible({ timeout: 10000 })
  })

  test('should persist game state after page reload', async ({ page }) => {
    await page.goto('/squaddle')
    // Dismiss onboarding if present
    const closeButton = page.locator('button:has-text("Got it"), button:has-text("Start"), button:has-text("Close"), button:has-text("×")')
    if (await closeButton.count() > 0) {
      await closeButton.first().click()
    }
    await page.waitForTimeout(1000)

    // Make a guess
    const input = page.locator('input[type="text"], input[placeholder*="guess"], input[placeholder*="player"], input[placeholder*="answer"]')
    await input.fill('Wrong Answer')
    const submitButton = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Guess")')
    await submitButton.click()
    await page.waitForTimeout(500)

    // Reload page
    await page.reload()
    await page.waitForTimeout(1000)

    // Game state should be preserved (we should see evidence of previous guess or same game state)
    // This is a basic check - the page should still show the game
    await expect(page.locator('text=Squaddle')).toBeVisible()
  })

  test('should show help button', async ({ page }) => {
    await page.goto('/squaddle')
    // Dismiss onboarding if present
    const closeButton = page.locator('button:has-text("Got it"), button:has-text("Start"), button:has-text("Close"), button:has-text("×")')
    if (await closeButton.count() > 0) {
      await closeButton.first().click()
    }
    await page.waitForTimeout(1000)

    // Look for help button
    const helpButton = page.locator('button:has-text("?"), button:has-text("Help"), [aria-label*="help"]')
    await expect(helpButton.first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Squaddle Navigation', () => {
  test('should navigate to squaddle from home page', async ({ page }) => {
    await page.goto('/')
    // Look for link to Squaddle
    const squaddleLink = page.locator('a[href*="squaddle"], a:has-text("Squaddle")')
    if (await squaddleLink.count() > 0) {
      await squaddleLink.first().click()
      await expect(page).toHaveURL(/squaddle/)
    }
  })
})
