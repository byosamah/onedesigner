/// <reference types="cypress" />

/**
 * Complete Client Journey with OSAMA Discount Code
 *
 * This test simulates the full client experience:
 * 1. Client signup and email verification
 * 2. Create project brief
 * 3. View designer matches
 * 4. Purchase credits with OSAMA code (100% free)
 * 5. Unlock designer contact information
 * 6. Send working request to designer
 */

describe('Client Journey with OSAMA Discount Code', () => {
  const testEmail = 'client-test-' + Date.now() + '@example.com'

  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  it('should complete full client journey with free OSAMA purchase', () => {

    // =================================
    // STEP 1: CLIENT SIGNUP
    // =================================

    cy.log('🔐 Step 1: Client Signup')

    cy.visit('/client/signup')
    cy.contains('OneDesigner').should('be.visible')

    // Fill signup form
    cy.get('input[type="email"]').should('be.visible').type(testEmail)
    cy.get('button[type="submit"]').should('be.visible').click()

    // Should redirect to verification
    cy.url().should('include', '/verify', { timeout: 10000 })
    cy.contains(/verify|code|confirmation/i).should('be.visible')

    // =================================
    // STEP 2: EMAIL VERIFICATION
    // =================================

    cy.log('📧 Step 2: Email Verification')

    // Enter mock OTP (updated selector for single input field)
    cy.get('input[type="text"]').should('be.visible').type('123456')
    cy.get('button[type="submit"]').contains(/verify|go/i).click()

    // Should redirect to brief creation
    cy.url().should('include', '/brief', { timeout: 15000 })
    cy.contains(/project|brief|tell us/i).should('be.visible')

    // =================================
    // STEP 3: CREATE PROJECT BRIEF
    // =================================

    cy.log('📋 Step 3: Create Project Brief')

    // Fill project brief form
    cy.get('select[name="projectType"]').select('logo-design')
    cy.get('input[name="industry"]').type('Technology')
    cy.get('select[name="budget"]').select('$5,000 - $10,000')
    cy.get('select[name="timeline"]').select('2-4 weeks')
    cy.get('textarea[name="description"]').type('Need a modern logo for our AI startup. Looking for something clean, tech-focused, and memorable.')

    // Select design styles
    cy.get('input[value="modern"]').check()
    cy.get('input[value="minimal"]').check()

    // Submit brief
    cy.get('button[type="submit"]').contains(/submit|continue|create/i).click()

    // =================================
    // STEP 4: VIEW AI MATCHES
    // =================================

    cy.log('🤖 Step 4: View AI Generated Matches')

    // Wait for AI matching to complete (allow generous timeout)
    cy.url().should('include', '/matches', { timeout: 20000 })
    cy.contains(/designer|match|found/i).should('be.visible')

    // Should see at least one match
    cy.get('[data-testid="match-card"]').should('have.length.at.least', 1)

    // Verify match shows realistic score
    cy.get('[data-testid="match-score"]').first().should('exist')

    // =================================
    // STEP 5: PURCHASE WITH OSAMA CODE
    // =================================

    cy.log('💳 Step 5: Purchase Credits with OSAMA Discount Code')

    // Navigate to purchase page
    cy.visit('/client/purchase')
    cy.contains(/pricing|packages/i).should('be.visible')

    // Verify we can see the pricing packages
    cy.get('[data-package="GROWTH_PACK"]').should('be.visible')
    cy.get('[data-package="GROWTH_PACK"]').within(() => {
      cy.contains('$15').should('be.visible')
      cy.contains('10 matches').should('be.visible')
    })

    // Apply OSAMA discount code
    cy.get('[data-testid="discount-code-input"]').should('be.visible').type('OSAMA')
    cy.get('[data-testid="apply-discount-btn"]').click()

    // Verify discount applied successfully
    cy.contains('✅ OSAMA Applied!').should('be.visible')
    cy.contains('100% discount').should('be.visible')
    cy.contains('Free matches for Cypress testing').should('be.visible')

    // Verify pricing shows $0
    cy.get('[data-package="GROWTH_PACK"]').within(() => {
      cy.contains('$0').should('be.visible')
    })

    // Purchase Growth Pack (10 credits for free)
    cy.get('[data-package="GROWTH_PACK"]').within(() => {
      cy.get('button').contains(/get|purchase/i).click()
    })

    // Should redirect to dashboard with success (no payment processing)
    cy.url().should('include', '/dashboard', { timeout: 15000 })

    // Should see success indicators
    cy.url().should('include', 'purchase=success')
    cy.url().should('include', 'type=free')

    // Should show credits were added
    cy.get('[data-testid="credits-display"]', { timeout: 10000 }).should('contain', '10')

    // =================================
    // STEP 6: UNLOCK DESIGNER
    // =================================

    cy.log('🔓 Step 6: Unlock Designer with Free Credits')

    // Go back to matches
    cy.visit('/client/matches')
    cy.get('[data-testid="match-card"]').should('have.length.at.least', 1)

    // Click unlock on first designer
    cy.get('[data-testid="match-card"]').first().within(() => {
      cy.get('button').contains(/unlock|view contact/i).click()
    })

    // Handle unlock confirmation modal
    cy.get('[data-testid="unlock-modal"]', { timeout: 5000 }).should('be.visible')
    cy.get('button').contains(/confirm|unlock|yes/i).click()

    // Should see credits decreased
    cy.get('[data-testid="credits-display"]').should('contain', '9')

    // Should now see designer contact information
    cy.get('[data-testid="designer-contact"]').should('be.visible')

    // =================================
    // STEP 7: SEND WORKING REQUEST
    // =================================

    cy.log('📨 Step 7: Send Working Request to Designer')

    // Click send working request
    cy.get('button').contains(/send.*working.*request|contact.*designer/i).click()

    // Working request modal should open
    cy.get('[data-testid="working-request-modal"]').should('be.visible')

    // Add custom message
    cy.get('textarea[name="message"]').should('be.visible').clear().type(
      `Hi! I found your portfolio through OneDesigner and I'm really impressed with your work.

      I have a tech startup that needs a modern logo design. The project budget is $5,000-$10,000
      and we're looking to complete it within 2-4 weeks.

      Would you be interested in discussing this project further? I'd love to see your approach
      to creating something clean and memorable for the AI/tech space.

      Looking forward to hearing from you!`
    )

    // Send the request
    cy.get('button').contains(/send.*request|send.*message/i).click()

    // Should see success message
    cy.contains(/request.*sent|message.*sent|successfully/i).should('be.visible')

    // Modal should close
    cy.get('[data-testid="working-request-modal"]').should('not.exist')

    // =================================
    // STEP 8: VERIFY FINAL STATE
    // =================================

    cy.log('✅ Step 8: Verify Complete Journey Success')

    // Go to client dashboard
    cy.visit('/client/dashboard')

    // Should show project brief status
    cy.contains(/project|brief|logo design/i).should('be.visible')

    // Should show credit balance
    cy.get('[data-testid="credits-display"]').should('contain', '9')

    // Should show working request status
    cy.contains(/request.*sent|pending.*response/i).should('be.visible')

    // Verify we can see match details
    cy.visit('/client/matches')
    cy.get('[data-testid="match-card"]').first().should('contain', /unlocked|contacted|working/i)
  })

  it('should handle discount code edge cases', () => {
    cy.log('🧪 Testing Discount Code Edge Cases')

    cy.visit('/client/purchase')

    // Test invalid discount code
    cy.get('[data-testid="discount-code-input"]').type('INVALID')
    cy.get('[data-testid="apply-discount-btn"]').click()
    cy.contains('Invalid or expired discount code').should('be.visible')

    // Test empty discount code
    cy.get('[data-testid="discount-code-input"]').clear()
    cy.get('[data-testid="apply-discount-btn"]').click()
    cy.contains('Please enter a discount code').should('be.visible')

    // Test case insensitive (lowercase should work)
    cy.get('[data-testid="discount-code-input"]').clear().type('osama')
    cy.get('[data-testid="apply-discount-btn"]').click()
    cy.contains('✅ OSAMA Applied!').should('be.visible')

    // Test removing discount
    cy.get('[data-testid="remove-discount-btn"]').click()
    cy.get('[data-testid="discount-code-input"]').should('have.value', '')
    cy.contains('✅ OSAMA Applied!').should('not.exist')
  })

  it('should verify all pricing packages work with OSAMA code', () => {
    cy.log('💰 Testing All Packages with OSAMA Code')

    cy.visit('/client/purchase')

    // Apply OSAMA code
    cy.get('[data-testid="discount-code-input"]').type('OSAMA')
    cy.get('[data-testid="apply-discount-btn"]').click()
    cy.contains('✅ OSAMA Applied!').should('be.visible')

    // Verify all packages show $0
    const packages = ['STARTER_PACK', 'GROWTH_PACK', 'SCALE_PACK']

    packages.forEach((packageId) => {
      cy.get(`[data-package="${packageId}"]`).within(() => {
        cy.contains('$0').should('be.visible')
      })
    })
  })
})