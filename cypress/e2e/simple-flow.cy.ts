/// <reference types="cypress" />

describe('OneDesigner Simple User Flows', () => {
  beforeEach(() => {
    // Start fresh for each test
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  describe('Designer Flow', () => {
    it('should allow designer to start signup process', () => {
      cy.visit('/designer/signup', { failOnStatusCode: false })
      cy.wait(1000) // Allow time for page to load

      // Check page loaded correctly
      cy.get('input[type="email"]').should('be.visible')

      // Enter valid email
      cy.get('input[type="email"]').type('test-designer@example.com')
      cy.get('button[type="submit"]').click()

      // Should redirect to verify page
      cy.url().should('include', '/designer/signup/verify')
      cy.contains(/verification|verify|code/i).should('be.visible')
    })

    it('should show designer login page', () => {
      cy.visit('/designer/login')

      // Check page elements
      cy.contains('Welcome back, designer!').should('be.visible')
      cy.get('input[type="email"]').should('be.visible')
      cy.contains('Apply as a designer').should('be.visible') // Link to signup

      // Test email input
      cy.get('input[type="email"]').type('designer@example.com')
      cy.get('input[type="email"]').should('have.value', 'designer@example.com')
    })

    it('should navigate between designer login and signup', () => {
      // Start at login
      cy.visit('/designer/login')

      // Find and click signup link
      cy.contains('Apply as a designer').click()
      cy.url().should('include', '/designer/signup')

      // Find and click login link
      cy.contains('Log in').click()
      cy.url().should('include', '/designer/login')
    })
  })

  describe('Client Flow', () => {
    it('should allow client to start signup process', () => {
      cy.visit('/client/signup')

      // Check page loaded correctly
      cy.get('input[type="email"]').should('be.visible')

      // Enter email
      cy.get('input[type="email"]').type('test-client@example.com')
      cy.get('button[type="submit"]').click()

      // Should redirect to verify page
      cy.url().should('include', '/client/signup/verify')
      cy.contains(/verification|verify|code/i).should('be.visible')
    })

    it('should show client login page', () => {
      cy.visit('/client/login')

      // Check page elements
      cy.contains('Welcome back!').should('be.visible')
      cy.get('input[type="email"]').should('be.visible')

      // Test navigation to signup
      cy.contains('Find your perfect designer').should('be.visible')
    })
  })

  describe('Admin Flow', () => {
    it('should show admin login page', () => {
      cy.visit('/admin')

      // Check admin login elements
      cy.contains('Admin').should('be.visible')
      cy.get('input[type="email"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')

      // Test email input
      cy.get('input[type="email"]').type('admin@onedesigner.app')
      cy.get('input[type="email"]').should('have.value', 'admin@onedesigner.app')
    })
  })

  describe('API Health Checks', () => {
    it('should verify all centralized services are configured', () => {
      cy.request('/api/health').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.status).to.eq('OK')

        // Check services object exists
        expect(response.body).to.have.property('services')
        const services = response.body.services

        // Verify all 8 services are present
        expect(services).to.have.property('dataService')
        expect(services).to.have.property('errorManager')
        expect(services).to.have.property('requestPipeline')
        expect(services).to.have.property('configManager')
        expect(services).to.have.property('businessRules')
        expect(services).to.have.property('loggingService')
        expect(services).to.have.property('otpService')
        expect(services).to.have.property('emailService')

        // Log service status for debugging
        cy.log('Service Status:', JSON.stringify(services))
      })
    })
  })

  describe('Navigation', () => {
    it('should navigate to key pages without errors', () => {
      // Test main pages
      const pages = [
        '/',
        '/designer/login',
        '/designer/signup',
        '/client/login',
        '/client/signup',
        '/admin'
      ]

      pages.forEach(page => {
        cy.visit(page)
        // Check page loaded (no 404 or 500 errors)
        cy.get('body').should('be.visible')
        // Give time for any async operations
        cy.wait(100)
      })
    })

    it('should have working navigation links', () => {
      cy.visit('/')

      // Check for navigation elements
      cy.get('nav, header').should('exist')

      // Check for OneDesigner branding
      cy.contains('OneDesigner').should('be.visible')
    })
  })
})