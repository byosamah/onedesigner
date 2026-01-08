// ***********************************************************
// This file is processed and loaded automatically before
// your component test files.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
// ***********************************************************

import './commands'

// Import global styles for component testing
import '../../src/app/globals.css'

// Mount helper for React components
import { mount } from 'cypress/react18'

// Add custom mount command
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}

Cypress.Commands.add('mount', mount)

// Mock Next.js router for component tests
import { NextRouter } from 'next/router'

const mockRouter: NextRouter = {
  basePath: '',
  pathname: '/',
  route: '/',
  query: {},
  asPath: '/',
  push: cy.stub().resolves(true),
  replace: cy.stub().resolves(true),
  reload: cy.stub(),
  back: cy.stub(),
  forward: cy.stub(),
  prefetch: cy.stub().resolves(),
  beforePopState: cy.stub(),
  events: {
    on: cy.stub(),
    off: cy.stub(),
    emit: cy.stub(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  defaultLocale: 'en',
  domainLocales: [],
  isPreview: false,
}

// Make router available globally for tests
window.mockRouter = mockRouter

export {}