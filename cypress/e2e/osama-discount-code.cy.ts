/// <reference types="cypress" />

/**
 * OSAMA Discount Code Test
 *
 * This test specifically focuses on the OSAMA discount code functionality:
 * 1. Client can apply OSAMA discount code for 100% off
 * 2. Purchase completes without going to LemonSqueezy
 * 3. Credits are added directly to account
 * 4. Client can use credits to unlock designers
 */

describe('OSAMA Discount Code Flow', () => {
  const testClientEmail = 'osama-test-' + Date.now() + '@example.com'

  beforeEach(() => {
    // Start with clean state
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  it('should allow free purchase with OSAMA discount code', () => {

    // =================================
    // SETUP: CREATE CLIENT ACCOUNT
    // =================================

    cy.log('🔐 Setting up client account')

    // Quick client signup
    cy.visit('/client/signup')
    cy.get('input[type="email"]').type(testClientEmail)
    cy.get('button[type="submit"]').click()

    // Verify with mock OTP
    cy.url().should('include', '/verify')
    cy.enterOTP('123456')

    // Should redirect to brief - skip for now and go to purchase
    cy.visit('/client/purchase')

    // =================================
    // TEST: OSAMA DISCOUNT CODE
    // =================================

    cy.log('🎉 Testing OSAMA discount code')

    // Verify we're on the purchase page
    cy.contains(/pricing|packages|get.*match/i).should('be.visible')

    // Check initial pricing display
    cy.get('[data-package="GROWTH_PACK"]').within(() => {
      cy.contains('$15').should('be.visible')
      cy.contains('10 matches').should('be.visible')
    })

    // Apply OSAMA discount code
    cy.applyDiscountCode('OSAMA')

    // Verify discount is applied
    cy.verifyDiscountApplied('OSAMA', 100, 'Free matches for Cypress testing')

    // Check pricing updates to show free
    cy.get('[data-package="GROWTH_PACK"]').within(() => {
      cy.contains('$0').should('be.visible') // New price
      cy.contains('$15').should('have.class', 'line-through') // Original price crossed out
    })

    // Purchase the Growth Pack (should be completely free)
    cy.get('[data-package="GROWTH_PACK"]').within(() => {
      cy.get('button').contains(/get|purchase/i).click()
    })

    // Should redirect directly to dashboard (no LemonSqueezy)
    cy.url().should('include', '/client/dashboard')
    cy.url().should('include', 'purchase=success')
    cy.url().should('include', 'type=free')

    // Should show success message
    cy.contains(/success|added|free/i).should('be.visible')

    // Verify credits were added (10 credits from Growth Pack)
    cy.get('[data-testid="credits-display"]').should('contain', '10')

    // =================================
    // TEST: USE FREE CREDITS
    // =================================

    cy.log('💳 Testing use of free credits')

    // Create a brief to get matches
    cy.visit('/brief')
    cy.get('select[name="projectType"]').select('logo-design')
    cy.get('input[name="industry"]').type('Technology')
    cy.get('select[name="budget"]').select('$5,000 - $10,000')
    cy.get('select[name="timeline"]').select('2-4 weeks')
    cy.get('textarea[name="description"]').type('Test project for OSAMA code')
    cy.get('input[value="modern"]').check()
    cy.get('button[type="submit"]').click()

    // Wait for matching
    cy.waitForAIMatching()

    // Should see matches
    cy.url().should('include', '/matches')
    cy.get('[data-testid="match-card"]').should('have.length.at.least', 1)

    // Unlock first designer (should use 1 credit)
    cy.get('[data-testid="match-card"]').first().within(() => {
      cy.get('button').contains(/unlock/i).click()
    })

    // Confirm unlock
    cy.get('[data-testid="unlock-modal"]').within(() => {
      cy.get('button').contains(/confirm/i).click()
    })

    // Credits should decrease to 9
    cy.get('[data-testid="credits-display"]').should('contain', '9')

    // Should now see designer contact info
    cy.get('[data-testid="designer-contact"]').should('be.visible')
  })

  it('should handle discount code edge cases', () => {

    cy.log('🔍 Testing discount code edge cases')

    // Setup client
    cy.visit('/client/signup')
    cy.get('input[type="email"]').type('edge-case-' + Date.now() + '@example.com')
    cy.get('button[type="submit"]').click()
    cy.enterOTP('123456')
    cy.visit('/client/purchase')

    // Test invalid discount code
    cy.applyDiscountCode('INVALID')
    cy.contains('Invalid or expired discount code').should('be.visible')

    // Test empty discount code
    cy.get('[data-testid="discount-code-input"]').clear()
    cy.get('[data-testid="apply-discount-btn"]').click()
    cy.contains('Please enter a discount code').should('be.visible')

    // Test case insensitive (lowercase osama should work)
    cy.applyDiscountCode('osama')
    cy.verifyDiscountApplied('OSAMA', 100, 'Free matches for Cypress testing')

    // Test removing discount
    cy.removeDiscountCode()
    cy.get('[data-testid="discount-code-input"]').should('have.value', '')
    cy.contains('✅ OSAMA Applied!').should('not.exist')
  })

  it('should verify API endpoint works correctly', () => {

    cy.log('⚙️ Testing free credits API endpoint')

    // Login first
    cy.visit('/client/signup')
    cy.get('input[type="email"]').type('api-test-' + Date.now() + '@example.com')
    cy.get('button[type="submit"]').click()
    cy.enterOTP('123456')

    // Test API directly
    cy.request({
      method: 'POST',
      url: '/api/credits/add-free',
      body: {
        packageId: 'GROWTH_PACK',
        discountCode: 'OSAMA'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.success).to.be.true
      expect(response.body.data.creditsAdded).to.eq(10)
      expect(response.body.data.discountCode).to.eq('OSAMA')
    })
  })

  it('should prevent invalid requests to free credits API', () => {

    cy.log('🚫 Testing free credits API security')

    // Test without authentication (should fail)
    cy.request({
      method: 'POST',
      url: '/api/credits/add-free',
      body: {
        packageId: 'GROWTH_PACK',
        discountCode: 'OSAMA'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body.error).to.include('sign in')
    })

    // Test with invalid discount code
    cy.visit('/client/signup')
    cy.get('input[type="email"]').type('security-test-' + Date.now() + '@example.com')
    cy.get('button[type="submit"]').click()
    cy.enterOTP('123456')

    cy.request({
      method: 'POST',
      url: '/api/credits/add-free',
      body: {
        packageId: 'GROWTH_PACK',
        discountCode: 'INVALID'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.error).to.include('Invalid')
    })
  })
})