// ***********************************************************
// This file is processed and loaded automatically before test files.
// You can change the location of this file or turn off processing it by
// setting the supportFile config option.
// ***********************************************************

import './commands'

// Preserve cookies and local storage between tests
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // on uncaught exceptions (useful for Next.js hydration errors)
  if (err.message.includes('Hydration failed')) {
    return false
  }
  if (err.message.includes('Text content does not match')) {
    return false
  }
  return true
})

// Add console log capture
Cypress.on('window:before:load', (win) => {
  cy.spy(win.console, 'log').as('consoleLog')
  cy.spy(win.console, 'error').as('consoleError')
  cy.spy(win.console, 'warn').as('consoleWarn')
})

// Custom TypeScript definitions
declare global {
  namespace Cypress {
    interface Chainable {
      // Authentication commands
      loginAsAdmin(email?: string): Chainable<void>
      loginAsClient(email?: string): Chainable<void>
      loginAsDesigner(email?: string): Chainable<void>
      logout(): Chainable<void>

      // OTP commands
      enterOTP(otp: string): Chainable<void>
      getLatestOTP(email: string): Chainable<string>

      // Designer flow commands
      fillDesignerApplication(data?: Partial<DesignerApplicationData>): Chainable<void>
      approveDesigner(designerId: string): Chainable<void>

      // Client flow commands
      createBrief(briefData?: Partial<BriefData>): Chainable<void>
      unlockDesigner(matchId: string): Chainable<void>
      purchasePackage(packageType: 'starter' | 'growth' | 'scale'): Chainable<void>

      // Working request commands
      sendWorkingRequest(matchId: string, message?: string): Chainable<void>
      respondToWorkingRequest(requestId: string, accept: boolean): Chainable<void>

      // Database commands
      resetDatabase(): Chainable<void>
      seedTestData(): Chainable<void>
      cleanupTestData(): Chainable<void>

      // Utility commands
      waitForAIMatching(): Chainable<void>
      checkCentralizedServices(): Chainable<void>
      interceptAPICall(endpoint: string, alias: string): Chainable<void>
    }
  }
}

interface DesignerApplicationData {
  firstName: string
  lastName: string
  email: string
  portfolio: string
  bio: string
  skills: string[]
  experience: string
  hourlyRate: number
}

interface BriefData {
  projectType: string
  industry: string
  budget: string
  timeline: string
  description: string
  styles: string[]
}

// Prevent TypeScript errors
export {}