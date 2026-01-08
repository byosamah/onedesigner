/// <reference types="cypress" />

describe('Basic Connection Test', () => {
  it('should connect to the homepage', () => {
    cy.visit('/')
    cy.contains('OneDesigner', { timeout: 10000 }).should('be.visible')
  })

  it('should navigate to purchase page', () => {
    cy.visit('/client/purchase')
    cy.contains('pricing', { timeout: 10000 }).should('be.visible')
  })

  it('should check if discount code input exists', () => {
    cy.visit('/client/purchase')
    cy.get('[data-testid="discount-code-input"]', { timeout: 10000 }).should('be.visible')
  })
})