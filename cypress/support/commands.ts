/// <reference types="cypress" />

// ============================================
// Authentication Commands
// ============================================

Cypress.Commands.add('loginAsAdmin', (email = Cypress.env('ADMIN_EMAIL')) => {
  cy.visit('/admin/login')
  cy.get('input[type="email"]').type(email)
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/admin/login/verify')
  // In real tests, you'd get the OTP from database or email
  cy.enterOTP('123456') // Mock OTP for testing
  cy.url().should('include', '/admin/dashboard')
})

Cypress.Commands.add('loginAsClient', (email = Cypress.env('TEST_CLIENT_EMAIL')) => {
  cy.visit('/client/login')
  cy.get('input[type="email"]').type(email)
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/client/login/verify')
  cy.enterOTP('123456')
  cy.url().should('include', '/client/dashboard')
})

Cypress.Commands.add('loginAsDesigner', (email = Cypress.env('TEST_DESIGNER_EMAIL')) => {
  cy.visit('/designer/login')
  cy.get('input[type="email"]').type(email)
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/designer/login/verify')
  cy.enterOTP('123456')
  cy.url().should('include', '/designer/dashboard')
})

Cypress.Commands.add('logout', () => {
  cy.clearCookies()
  cy.clearLocalStorage()
  cy.visit('/')
})

// ============================================
// OTP Commands
// ============================================

Cypress.Commands.add('enterOTP', (otp: string) => {
  // The OTP verification page uses a single input field, not separate fields
  cy.get('input[type="text"]').should('be.visible').clear().type(otp)
  cy.get('button[type="submit"]').contains(/verify|confirm|let.*go/i).click()
})

Cypress.Commands.add('getLatestOTP', (email: string) => {
  // This would typically query your test database or intercept the email
  // For now, returning a mock OTP
  return cy.wrap('123456')
})

// ============================================
// Designer Flow Commands
// ============================================

Cypress.Commands.add('fillDesignerApplication', (data = {}) => {
  const defaultData = {
    firstName: 'Test',
    lastName: 'Designer',
    email: Cypress.env('TEST_DESIGNER_EMAIL'),
    portfolio: 'https://portfolio.example.com',
    bio: 'Experienced designer with 5 years in UI/UX',
    skills: ['UI Design', 'Branding', 'Web Design'],
    experience: '5 years',
    hourlyRate: 75,
  }

  const applicationData = { ...defaultData, ...data }

  cy.visit('/designer/apply')

  // Fill personal information
  cy.get('input[name="firstName"]').type(applicationData.firstName)
  cy.get('input[name="lastName"]').type(applicationData.lastName)
  cy.get('input[name="portfolio"]').type(applicationData.portfolio)
  cy.get('textarea[name="bio"]').type(applicationData.bio)

  // Select skills
  applicationData.skills.forEach(skill => {
    cy.get(`input[value="${skill}"]`).check()
  })

  cy.get('input[name="hourlyRate"]').type(applicationData.hourlyRate.toString())

  cy.get('button[type="submit"]').click()
})

Cypress.Commands.add('approveDesigner', (designerId: string) => {
  cy.request({
    method: 'POST',
    url: `/api/admin/designers/${designerId}/approve`,
    headers: {
      'Content-Type': 'application/json',
    },
  })
})

// ============================================
// Discount Code Commands
// ============================================

Cypress.Commands.add('applyDiscountCode', (code: string) => {
  cy.get('[data-testid="discount-code-input"]').should('be.visible').clear().type(code)
  cy.get('[data-testid="apply-discount-btn"]').click()
})

Cypress.Commands.add('verifyDiscountApplied', (code: string, discount: number, description: string) => {
  cy.contains(`✅ ${code} Applied!`).should('be.visible')
  cy.contains(`${discount}% discount`).should('be.visible')
  cy.contains(description).should('be.visible')
})

Cypress.Commands.add('removeDiscountCode', () => {
  cy.get('[data-testid="remove-discount-btn"]').click()
  cy.get('[data-testid="discount-code-input"]').should('have.value', '')
})

Cypress.Commands.add('purchaseWithFreeCode', (packageType: 'STARTER_PACK' | 'GROWTH_PACK' | 'SCALE_PACK', discountCode = 'OSAMA') => {
  // Apply discount code
  cy.applyDiscountCode(discountCode)
  cy.verifyDiscountApplied(discountCode, 100, 'Free matches for Cypress testing')

  // Purchase package (should be free)
  cy.get(`[data-package="${packageType}"]`).within(() => {
    cy.contains('$0').should('be.visible') // Verify shows free
    cy.get('button').contains(/get|purchase/i).click()
  })

  // Should redirect to dashboard with success
  cy.url().should('include', '/client/dashboard')
  cy.url().should('include', 'purchase=success')
  cy.url().should('include', 'type=free')
})

// ============================================
// Client Flow Commands
// ============================================

Cypress.Commands.add('createBrief', (briefData = {}) => {
  const defaultBrief = {
    projectType: 'logo-design',
    industry: 'Technology',
    budget: '$1,000 - $5,000',
    timeline: '2-4 weeks',
    description: 'Need a modern logo for our tech startup',
    styles: ['Modern', 'Minimalist'],
  }

  const brief = { ...defaultBrief, ...briefData }

  cy.visit('/brief')

  cy.get('select[name="projectType"]').select(brief.projectType)
  cy.get('input[name="industry"]').type(brief.industry)
  cy.get('select[name="budget"]').select(brief.budget)
  cy.get('select[name="timeline"]').select(brief.timeline)
  cy.get('textarea[name="description"]').type(brief.description)

  brief.styles.forEach(style => {
    cy.get(`input[value="${style}"]`).check()
  })

  cy.get('button[type="submit"]').contains(/submit|continue/i).click()
})

Cypress.Commands.add('unlockDesigner', (matchId: string) => {
  cy.get(`[data-match-id="${matchId}"]`).within(() => {
    cy.get('button').contains(/unlock|view contact/i).click()
  })
  cy.get('.modal').should('be.visible')
  cy.get('button').contains(/confirm|yes/i).click()
})

Cypress.Commands.add('purchasePackage', (packageType: 'starter' | 'growth' | 'scale') => {
  cy.visit('/pricing')
  cy.get(`[data-package="${packageType}"]`).within(() => {
    cy.get('button').contains(/purchase|buy/i).click()
  })
  // Handle payment flow (would need to mock LemonSqueezy in tests)
})

// ============================================
// Working Request Commands
// ============================================

Cypress.Commands.add('sendWorkingRequest', (matchId: string, message?: string) => {
  cy.get(`[data-match-id="${matchId}"]`).within(() => {
    cy.get('button').contains(/send working request/i).click()
  })

  if (message) {
    cy.get('textarea[name="message"]').clear().type(message)
  }

  cy.get('button').contains(/send request/i).click()
  cy.get('.success-modal').should('be.visible')
})

Cypress.Commands.add('respondToWorkingRequest', (requestId: string, accept: boolean) => {
  cy.visit('/designer/dashboard')
  cy.get(`[data-request-id="${requestId}"]`).within(() => {
    const buttonText = accept ? /accept/i : /decline/i
    cy.get('button').contains(buttonText).click()
  })
  cy.get('.confirmation-modal button').contains(/confirm/i).click()
})

// ============================================
// Database Commands (Mock - Not Yet Implemented)
// ============================================

Cypress.Commands.add('resetDatabase', () => {
  // Mock implementation - requires test database setup
  cy.log('Mock: resetDatabase (not yet implemented)')
  // cy.task('resetDatabase')
})

Cypress.Commands.add('seedTestData', () => {
  // Mock implementation - requires test data seeding
  cy.log('Mock: seedTestData (not yet implemented)')
  // cy.task('seedTestData')
})

Cypress.Commands.add('cleanupTestData', () => {
  // Mock implementation - requires test API endpoint
  cy.log('Mock: cleanupTestData (not yet implemented)')
  // cy.request('POST', '/api/test/cleanup')
})

// ============================================
// Utility Commands
// ============================================

Cypress.Commands.add('waitForAIMatching', () => {
  // Wait for the 3-phase progressive matching to complete
  cy.intercept('GET', '/api/match/find-optimized*').as('aiMatching')
  cy.wait('@aiMatching', { timeout: 15000 })
})

Cypress.Commands.add('checkCentralizedServices', () => {
  cy.request('/api/health').then((response) => {
    expect(response.status).to.eq(200)
    const services = response.body.services

    // Check all 8 centralized services are active
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

Cypress.Commands.add('interceptAPICall', (endpoint: string, alias: string) => {
  cy.intercept('GET', endpoint).as(alias)
  cy.intercept('POST', endpoint).as(`${alias}Post`)
  cy.intercept('PUT', endpoint).as(`${alias}Put`)
  cy.intercept('DELETE', endpoint).as(`${alias}Delete`)
})

// Export to prevent TypeScript errors
export {}