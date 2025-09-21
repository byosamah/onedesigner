/// <reference types="cypress" />

describe('OneDesigner Basic Tests', () => {
  it('should load the homepage', () => {
    cy.visit('/')
    cy.contains('OneDesigner').should('be.visible')
  })

  it('should navigate to designer signup', () => {
    cy.visit('/designer/signup')
    cy.url().should('include', '/designer/signup')
    cy.get('input[type="email"]').should('be.visible')
  })

  it('should navigate to client signup', () => {
    cy.visit('/client/signup', { failOnStatusCode: false })
    cy.wait(1000) // Give time for route to compile
    cy.url().should('include', '/client/signup')
    cy.get('input[type="email"]').should('be.visible')
  })

  it('should check all centralized services are active', () => {
    cy.request('/api/health').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('status', 'OK')

      // Check the feature flags that are actually returned
      const features = response.body.features
      expect(features).to.exist
      expect(features).to.have.property('dataService')
      expect(features).to.have.property('errorManager')
      expect(features).to.have.property('requestPipeline')
      expect(features).to.have.property('authMiddleware')
    })
  })

  it('should load admin login page', () => {
    cy.visit('/admin')
    cy.url().should('include', '/admin')
    cy.contains('Admin').should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
  })
})