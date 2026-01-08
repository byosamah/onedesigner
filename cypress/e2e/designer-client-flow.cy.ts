/// <reference types="cypress" />

describe.skip('Designer-Client Matching Flow (Advanced - Requires Mock Setup)', () => {
  // These tests require mock database functions and test API endpoints
  // They are skipped until the test infrastructure is complete

  beforeEach(() => {
    // Reset database to clean state before each test
    // cy.resetDatabase()
    // cy.seedTestData()
  })

  afterEach(() => {
    // Clean up test data
    // cy.cleanupTestData()
  })

  it('should complete full designer application to client match flow', () => {
    // Step 1: Designer signs up and fills application
    cy.visit('/designer/signup')
    cy.get('input[type="email"]').type('newdesigner@test.com')
    cy.get('button[type="submit"]').click()

    // Verify OTP
    cy.url().should('include', '/designer/signup/verify')
    cy.enterOTP('123456')

    // Should redirect to application form
    cy.url().should('include', '/designer/apply')

    // Fill designer application
    cy.fillDesignerApplication({
      firstName: 'John',
      lastName: 'Designer',
      portfolio: 'https://johndesigner.com',
      bio: 'Creative designer specializing in modern branding',
      skills: ['Logo Design', 'Branding', 'UI Design'],
      hourlyRate: 100,
    })

    // Should see pending approval message
    cy.contains('Your application has been submitted').should('be.visible')
    cy.contains('under review').should('be.visible')

    // Step 2: Admin approves the designer
    cy.logout()
    cy.loginAsAdmin()

    // Navigate to designers management
    cy.visit('/admin/designers')
    cy.contains('John Designer').should('be.visible')

    // Check designer details
    cy.contains('John Designer').closest('tr').within(() => {
      cy.get('button').contains('View').click()
    })

    // Approve designer
    cy.get('button').contains('Approve').click()
    cy.contains('Designer approved successfully').should('be.visible')

    // Step 3: Client creates brief and sees match
    cy.logout()
    cy.visit('/client/signup')
    cy.get('input[type="email"]').type('newclient@test.com')
    cy.get('button[type="submit"]').click()

    // Verify OTP
    cy.url().should('include', '/client/signup/verify')
    cy.enterOTP('123456')

    // Should redirect to brief creation
    cy.url().should('include', '/brief')

    // Create a brief that matches the designer's skills
    cy.createBrief({
      projectType: 'logo-design',
      industry: 'Technology',
      budget: '$5,000 - $10,000',
      timeline: '2-4 weeks',
      description: 'Need a modern logo for our tech startup focusing on AI',
      styles: ['Modern', 'Minimalist', 'Tech'],
    })

    // Wait for AI matching to complete
    cy.waitForAIMatching()

    // Should see match results
    cy.url().should('include', '/client/matches')
    cy.contains('John Designer').should('be.visible')

    // Check match score (should be realistic)
    cy.get('[data-testid="match-score"]').should(($score) => {
      const score = parseInt($score.text())
      expect(score).to.be.within(50, 85)
    })

    // Step 4: Client sends working request
    cy.get('[data-testid="match-card"]').first().within(() => {
      cy.get('button').contains('Send Working Request').click()
    })

    // Modal should open
    cy.get('[data-testid="working-request-modal"]').should('be.visible')
    cy.get('textarea[name="message"]').should('not.be.empty') // Auto-generated message
    cy.get('button').contains('Send Request').click()

    // Success message
    cy.contains('Working request sent successfully').should('be.visible')

    // Step 5: Designer accepts the working request
    cy.logout()
    cy.loginAsDesigner('newdesigner@test.com')

    // Should see pending request on dashboard
    cy.visit('/designer/dashboard')
    cy.contains('New Working Request').should('be.visible')
    cy.contains('72 hours to respond').should('be.visible')

    // View request details
    cy.get('[data-testid="working-request-card"]').first().within(() => {
      cy.contains('Technology').should('be.visible') // Industry
      cy.contains('Logo Design').should('be.visible') // Project type
      cy.get('button').contains('Accept').click()
    })

    // Confirm acceptance
    cy.get('[data-testid="confirmation-modal"]').within(() => {
      cy.get('button').contains('Confirm').click()
    })

    cy.contains('Request accepted successfully').should('be.visible')

    // Step 6: Verify both parties can see contact information
    // Designer should see client email
    cy.contains('newclient@test.com').should('be.visible')

    // Client should receive notification
    cy.logout()
    cy.loginAsClient('newclient@test.com')
    cy.visit('/client/dashboard')
    cy.contains('John Designer accepted your request').should('be.visible')
  })

  it('should handle edge cases in the matching flow', () => {
    // Test: No approved designers available
    cy.loginAsClient()
    cy.createBrief({
      projectType: 'motion-graphics', // Rare skill
      industry: 'Aerospace', // Niche industry
    })

    cy.waitForAIMatching()
    cy.contains(/no designers.*match.*criteria/i).should('be.visible')

    // Test: Client runs out of credits
    cy.visit('/client/dashboard')
    cy.get('[data-testid="credits-display"]').should('contain', '0')
    cy.get('button').contains('Unlock').should('be.disabled')

    // Test: Designer edits profile after approval
    cy.logout()
    cy.loginAsDesigner()
    cy.visit('/designer/profile')
    cy.get('input[name="hourlyRate"]').clear().type('150')
    cy.get('button').contains('Save').click()

    // Should require re-approval
    cy.contains('pending approval').should('be.visible')
  })

  it('should validate all 8 centralized services are working', () => {
    // Check health endpoint
    cy.checkCentralizedServices()

    // Test OTP service rate limiting
    cy.visit('/client/login')
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('button[type="submit"]').click()

    // Try to request OTP again immediately
    cy.visit('/client/login')
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('button[type="submit"]').click()

    // Should see rate limit error
    cy.contains(/please wait.*before requesting/i).should('be.visible')

    // Test error handling
    cy.intercept('POST', '/api/match/find', { statusCode: 500 })
    cy.loginAsClient()
    cy.createBrief()

    // Should see user-friendly error message
    cy.contains(/something went wrong/i).should('be.visible')
    cy.contains(/please try again/i).should('be.visible')
  })

  it('should properly handle payment and credit flow', () => {
    cy.loginAsClient()

    // Check initial credits
    cy.visit('/client/dashboard')
    cy.get('[data-testid="credits-display"]').should('contain', '3') // Starter credits

    // Create brief and get match
    cy.createBrief()
    cy.waitForAIMatching()

    // Unlock first designer
    cy.get('[data-testid="match-card"]').first().within(() => {
      cy.get('button').contains('Unlock').click()
    })

    // Credits should decrease
    cy.get('[data-testid="credits-display"]').should('contain', '2')

    // Purchase more credits
    cy.visit('/pricing')
    cy.get('[data-package="growth"]').within(() => {
      cy.get('button').contains('Purchase').click()
    })

    // Mock LemonSqueezy webhook
    cy.request({
      method: 'POST',
      url: '/api/webhooks/lemonsqueezy',
      body: {
        meta: {
          custom_data: {
            credits: 10,
            client_id: 'test-client-id'
          }
        }
      }
    })

    // Credits should be updated
    cy.visit('/client/dashboard')
    cy.get('[data-testid="credits-display"]').should('contain', '12')
  })
})