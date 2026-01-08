/// <reference types="cypress" />

/**
 * Complete Client Journey Test with OSAMA Discount Code
 *
 * This test simulates the entire client experience from signup to designer contact:
 * 1. Client signup and email verification
 * 2. Create project brief
 * 3. View AI-generated designer matches
 * 4. Purchase matches using OSAMA discount code (100% free)
 * 5. Unlock designer contact information
 * 6. Send working request to designer
 * 7. Verify designer receives the request
 */

describe('Complete Client Journey with OSAMA Discount Code', () => {
  const testEmail = 'cypress-client-' + Date.now() + '@example.com'
  const designerEmail = 'cypress-designer-' + Date.now() + '@example.com'

  before(() => {
    // Reset database and create test data
    cy.task('resetDatabase')
    cy.task('seedTestData')
  })

  after(() => {
    // Clean up test data
    cy.task('cleanupTestData')
  })

  beforeEach(() => {
    // Ensure we start with a clean state
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  it('should complete the full client journey with OSAMA discount code', () => {

    // =================================
    // STEP 1: CLIENT SIGNUP & VERIFICATION
    // =================================

    cy.log('🔐 Step 1: Client Signup & Verification')

    // Visit signup page
    cy.visit('/client/signup')
    cy.url().should('include', '/client/signup')

    // Fill signup form
    cy.get('input[type="email"]').should('be.visible').type(testEmail)
    cy.get('button[type="submit"]').should('contain.text', /sign up|create account/i).click()

    // Should redirect to OTP verification
    cy.url().should('include', '/client/signup/verify')
    cy.contains(/verify|confirmation|enter.*code/i).should('be.visible')

    // Enter OTP (using mock OTP for testing)
    cy.enterOTP('123456')

    // Should redirect to brief creation after verification
    cy.url().should('include', '/brief')
    cy.contains(/create.*brief|tell us about|project/i).should('be.visible')

    // =================================
    // STEP 2: CREATE PROJECT BRIEF
    // =================================

    cy.log('📋 Step 2: Create Project Brief')

    // Fill the project brief form
    cy.get('select[name="projectType"]').select('logo-design')
    cy.get('input[name="industry"]').type('Technology')
    cy.get('select[name="budget"]').select('$5,000 - $10,000')
    cy.get('select[name="timeline"]').select('2-4 weeks')
    cy.get('textarea[name="description"]').type('Need a modern logo for our AI startup focusing on machine learning solutions')

    // Select design styles
    cy.get('input[value="modern"]').check()
    cy.get('input[value="minimal"]').check()

    // Submit the brief
    cy.get('button[type="submit"]').contains(/submit|continue|create brief/i).click()

    // =================================
    // STEP 3: VIEW AI MATCHES
    // =================================

    cy.log('🤖 Step 3: View AI-Generated Matches')

    // Wait for AI matching to complete
    cy.waitForAIMatching()

    // Should be on matches page
    cy.url().should('include', '/client/matches')
    cy.contains(/designer.*match|found.*designer/i).should('be.visible')

    // Verify at least one match is shown
    cy.get('[data-testid="match-card"]').should('have.length.at.least', 1)

    // Check match score is realistic (50-85% range)
    cy.get('[data-testid="match-score"]').first().should(($score) => {
      const scoreText = $score.text()
      const score = parseInt(scoreText.replace('%', ''))
      expect(score).to.be.within(50, 85)
    })

    // =================================
    // STEP 4: PURCHASE WITH OSAMA CODE
    // =================================

    cy.log('💳 Step 4: Purchase Matches with OSAMA Discount Code')

    // Click to purchase more credits
    cy.contains(/buy.*match|purchase|get.*credit/i).click()

    // Should be on purchase page
    cy.url().should('include', '/purchase')
    cy.contains(/pricing|packages|matches/i).should('be.visible')

    // Apply OSAMA discount code
    cy.get('[data-testid="discount-code-input"]').should('be.visible').type('OSAMA')
    cy.get('[data-testid="apply-discount-btn"]').click()

    // Verify discount is applied
    cy.contains('✅ OSAMA Applied!').should('be.visible')
    cy.contains('100% discount').should('be.visible')
    cy.contains('Free matches for Cypress testing').should('be.visible')

    // Verify pricing shows $0
    cy.get('[data-package="GROWTH_PACK"]').within(() => {
      cy.contains('$0').should('be.visible') // Should show $0 after discount
      cy.contains('$15').should('have.class', 'line-through') // Original price crossed out
    })

    // Purchase the Growth Pack (10 matches for free)
    cy.get('[data-package="GROWTH_PACK"]').within(() => {
      cy.get('button').contains(/get|purchase/i).click()
    })

    // Should redirect to dashboard with success message (no LemonSqueezy redirect)
    cy.url().should('include', '/client/dashboard')
    cy.url().should('include', 'purchase=success')
    cy.url().should('include', 'type=free')

    // Verify credits were added
    cy.get('[data-testid="credits-display"]').should('contain', '10')
    cy.contains(/credits.*added|purchase.*success/i).should('be.visible')

    // =================================
    // STEP 5: UNLOCK DESIGNER CONTACT
    // =================================

    cy.log('🔓 Step 5: Unlock Designer Contact Information')

    // Go back to matches
    cy.visit('/client/matches')

    // Click unlock on the first match
    cy.get('[data-testid="match-card"]').first().within(() => {
      cy.get('button').contains(/unlock|view.*contact/i).click()
    })

    // Confirm unlock in modal
    cy.get('[data-testid="unlock-modal"]').should('be.visible')
    cy.get('button').contains(/confirm|yes|unlock/i).click()

    // Verify credits decreased
    cy.get('[data-testid="credits-display"]').should('contain', '9')

    // Should now see designer contact information
    cy.get('[data-testid="designer-contact"]').should('be.visible')
    cy.get('[data-testid="designer-email"]').should('be.visible')
    cy.get('[data-testid="designer-phone"]').should('be.visible')

    // =================================
    // STEP 6: SEND WORKING REQUEST
    // =================================

    cy.log('📨 Step 6: Send Working Request to Designer')

    // Click send working request button
    cy.get('button').contains(/send.*working.*request|contact.*designer/i).click()

    // Working request modal should open
    cy.get('[data-testid="working-request-modal"]').should('be.visible')

    // Message should be pre-filled
    cy.get('textarea[name="message"]').should('not.be.empty')

    // Can add custom message
    cy.get('textarea[name="message"]').clear().type(
      'Hi! I saw your portfolio and I\'m really impressed with your work. ' +
      'I have an AI startup project that needs a modern logo design. ' +
      'Would you be interested in discussing this further?'
    )

    // Send the request
    cy.get('button').contains(/send.*request|contact/i).click()

    // Success message should appear
    cy.contains(/request.*sent|message.*sent|designer.*contacted/i).should('be.visible')

    // Modal should close
    cy.get('[data-testid="working-request-modal"]').should('not.exist')

    // =================================
    // STEP 7: VERIFY DESIGNER RECEIVES REQUEST
    // =================================

    cy.log('👨‍🎨 Step 7: Verify Designer Receives Working Request')

    // Logout client
    cy.logout()

    // Login as the matched designer (simulate designer login)
    cy.loginAsDesigner(designerEmail)

    // Should be on designer dashboard
    cy.url().should('include', '/designer/dashboard')

    // Should see new working request notification
    cy.contains(/new.*request|working.*request|project.*request/i).should('be.visible')
    cy.contains('AI startup').should('be.visible') // Part of our message
    cy.contains('logo design').should('be.visible') // Project type

    // Check request details
    cy.get('[data-testid="working-request-card"]').first().within(() => {
      cy.contains('Technology').should('be.visible') // Industry
      cy.contains('$5,000 - $10,000').should('be.visible') // Budget
      cy.contains('2-4 weeks').should('be.visible') // Timeline

      // Should show countdown timer
      cy.contains(/72.*hour|respond.*by/i).should('be.visible')

      // Should have accept/decline buttons
      cy.get('button').contains(/accept/i).should('be.visible')
      cy.get('button').contains(/decline/i).should('be.visible')
    })

    // =================================
    // STEP 8: DESIGNER ACCEPTS REQUEST
    // =================================

    cy.log('✅ Step 8: Designer Accepts Working Request')

    // Accept the working request
    cy.get('[data-testid="working-request-card"]').first().within(() => {
      cy.get('button').contains(/accept/i).click()
    })

    // Confirmation modal should appear
    cy.get('[data-testid="confirmation-modal"]').should('be.visible')
    cy.contains(/confirm.*accept|yes.*accept/i).should('be.visible')
    cy.get('button').contains(/confirm|yes/i).click()

    // Success message
    cy.contains(/accepted.*successfully|request.*accepted/i).should('be.visible')

    // Should now see client contact information
    cy.contains(testEmail).should('be.visible') // Client email should be visible

    // =================================
    // STEP 9: VERIFY COMPLETE FLOW
    // =================================

    cy.log('🎉 Step 9: Verify Complete Flow Success')

    // Check that all systems worked correctly
    cy.checkCentralizedServices()

    // Verify final state - logout designer and login as client
    cy.logout()
    cy.loginAsClient(testEmail)

    // Client should see accepted status
    cy.visit('/client/dashboard')
    cy.contains(/accepted|in.*progress|designer.*accepted/i).should('be.visible')

    // Should show designer contact info is now available
    cy.visit('/client/matches')
    cy.get('[data-testid="match-card"]').first().within(() => {
      cy.contains(/accepted|in.*contact|working/i).should('be.visible')
    })
  })

  it('should handle edge cases and errors gracefully', () => {
    cy.log('🔍 Testing Edge Cases and Error Handling')

    // Test invalid discount code
    cy.visit('/client/purchase')
    cy.loginAsClient()

    cy.get('[data-testid="discount-code-input"]').type('INVALID')
    cy.get('[data-testid="apply-discount-btn"]').click()
    cy.contains('Invalid or expired discount code').should('be.visible')

    // Test empty discount code
    cy.get('[data-testid="discount-code-input"]').clear()
    cy.get('[data-testid="apply-discount-btn"]').click()
    cy.contains('Please enter a discount code').should('be.visible')

    // Test successful OSAMA code application and removal
    cy.get('[data-testid="discount-code-input"]').type('OSAMA')
    cy.get('[data-testid="apply-discount-btn"]').click()
    cy.contains('✅ OSAMA Applied!').should('be.visible')

    // Remove discount
    cy.get('[data-testid="remove-discount-btn"]').click()
    cy.contains('✅ OSAMA Applied!').should('not.exist')
    cy.get('[data-testid="discount-code-input"]').should('have.value', '')
  })

  it('should verify all 8 centralized services are working', () => {
    cy.log('⚙️ Verifying All Centralized Services')

    // Check health endpoint shows all services active
    cy.request('/api/health').then((response) => {
      expect(response.status).to.eq(200)
      const services = response.body.services

      // Verify all 8 phases are active
      expect(services.dataService).to.equal('active')
      expect(services.errorManager).to.equal('active')
      expect(services.requestPipeline).to.equal('active')
      expect(services.configManager).to.equal('active')
      expect(services.businessRules).to.equal('active')
      expect(services.loggingService).to.equal('active')
      expect(services.otpService).to.equal('active')
      expect(services.emailService).to.equal('active')
    })
  })
})