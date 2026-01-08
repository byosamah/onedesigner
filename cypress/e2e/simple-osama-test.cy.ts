/// <reference types="cypress" />

/**
 * Simple OSAMA Discount Code Test
 * Focuses purely on the discount code UI functionality
 */

describe('Simple OSAMA Discount Code UI Test', () => {

  it('should display and apply OSAMA discount code correctly', () => {

    // Visit purchase page directly
    cy.visit('/client/purchase')

    // Should see pricing packages
    cy.contains('pricing', { timeout: 10000 }).should('be.visible')
    cy.get('[data-package="GROWTH_PACK"]').should('be.visible')

    // Check original pricing
    cy.get('[data-package="GROWTH_PACK"]').within(() => {
      cy.contains('$15').should('be.visible')
      cy.contains('10 matches').should('be.visible')
    })

    // Apply OSAMA discount code
    cy.get('[data-testid="discount-code-input"]').should('be.visible').type('OSAMA')
    cy.get('[data-testid="apply-discount-btn"]').click()

    // Verify discount is applied
    cy.contains('✅ OSAMA Applied!').should('be.visible')
    cy.contains('100% discount').should('be.visible')
    cy.contains('Free matches for Cypress testing').should('be.visible')

    // Verify pricing updates to show $0
    cy.get('[data-package="GROWTH_PACK"]').within(() => {
      cy.contains('$0').should('be.visible') // New price should show $0
    })

    // Test removing discount
    cy.get('[data-testid="remove-discount-btn"]').click()
    cy.get('[data-testid="discount-code-input"]').should('have.value', '')
    cy.contains('✅ OSAMA Applied!').should('not.exist')

    // Pricing should return to normal
    cy.get('[data-package="GROWTH_PACK"]').within(() => {
      cy.contains('$15').should('be.visible')
    })
  })

  it('should handle invalid discount codes', () => {
    cy.visit('/client/purchase')

    // Test invalid code
    cy.get('[data-testid="discount-code-input"]').type('INVALID')
    cy.get('[data-testid="apply-discount-btn"]').click()
    cy.contains('Invalid or expired discount code').should('be.visible')

    // Test empty code
    cy.get('[data-testid="discount-code-input"]').clear()
    cy.get('[data-testid="apply-discount-btn"]').click()
    cy.contains('Please enter a discount code').should('be.visible')

    // Test case sensitivity (osama should work)
    cy.get('[data-testid="discount-code-input"]').clear().type('osama')
    cy.get('[data-testid="apply-discount-btn"]').click()
    cy.contains('✅ OSAMA Applied!').should('be.visible')
  })

  it('should show correct discount information', () => {
    cy.visit('/client/purchase')

    // Apply OSAMA code
    cy.get('[data-testid="discount-code-input"]').type('OSAMA')
    cy.get('[data-testid="apply-discount-btn"]').click()

    // Check all discount details are shown
    cy.contains('✅ OSAMA Applied!').should('be.visible')
    cy.contains('100% discount').should('be.visible')
    cy.contains('Free matches for Cypress testing').should('be.visible')

    // Check all packages show $0
    cy.get('[data-package="STARTER_PACK"]').within(() => {
      cy.contains('$0').should('be.visible')
    })

    cy.get('[data-package="GROWTH_PACK"]').within(() => {
      cy.contains('$0').should('be.visible')
    })

    cy.get('[data-package="SCALE_PACK"]').within(() => {
      cy.contains('$0').should('be.visible')
    })
  })
})