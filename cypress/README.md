# OneDesigner Cypress Testing Guide

## Overview

This directory contains end-to-end (E2E) and component tests for the OneDesigner platform using Cypress v15.2.0.

## Quick Start

### Running Tests

```bash
# Run tests in headless mode
npm run cypress:run

# Open Cypress Test Runner (interactive mode)
npm run cypress:open

# Run tests in headed mode (see browser)
npm run cypress:headed

# Run tests and record to Cypress Cloud
npm run cypress:record

# Run E2E tests with dev server
npm run test:e2e

# Open E2E tests with dev server (interactive)
npm run test:e2e:open

# Run E2E tests with recording to Cypress Cloud
npm run test:e2e:record
```

### Cypress Cloud Integration

This project is configured with Cypress Cloud (Project ID: `enb4g2`) for:
- Test recording and playback
- Parallel test execution
- Test analytics and insights
- Flake detection
- Visual debugging with screenshots and videos

To record tests to Cypress Cloud, you need to set the record key:

```bash
# Set record key as environment variable
export CYPRESS_RECORD_KEY="your-record-key"

# Run tests with recording
npm run cypress:record

# Or inline
CYPRESS_RECORD_KEY="your-record-key" npm run test:e2e:record
```

## Test Structure

```
cypress/
├── e2e/                      # End-to-end tests
│   └── designer-client-flow.cy.ts
├── fixtures/                 # Test data
│   └── test-data.json
├── support/                  # Support files and custom commands
│   ├── commands.ts          # Custom Cypress commands
│   ├── component.ts         # Component testing setup
│   └── e2e.ts              # E2E testing setup
├── downloads/               # Downloaded files during tests
├── screenshots/             # Test failure screenshots
└── videos/                  # Test execution videos
```

## Custom Commands

### Authentication
- `cy.loginAsAdmin()` - Login as admin user
- `cy.loginAsClient()` - Login as client
- `cy.loginAsDesigner()` - Login as designer
- `cy.logout()` - Clear session and logout

### OTP Handling
- `cy.enterOTP(code)` - Enter OTP verification code
- `cy.getLatestOTP(email)` - Retrieve OTP for email

### Designer Flow
- `cy.fillDesignerApplication(data)` - Complete designer application
- `cy.approveDesigner(designerId)` - Admin approve designer

### Client Flow
- `cy.createBrief(data)` - Create project brief
- `cy.unlockDesigner(matchId)` - Unlock designer contact
- `cy.purchasePackage(type)` - Purchase credit package

### Working Requests
- `cy.sendWorkingRequest(matchId, message)` - Send working request
- `cy.respondToWorkingRequest(requestId, accept)` - Accept/decline request

### Utilities
- `cy.waitForAIMatching()` - Wait for AI matching to complete
- `cy.checkCentralizedServices()` - Verify all 8 services are active
- `cy.interceptAPICall(endpoint, alias)` - Intercept API calls

## Environment Variables

Tests use these environment variables (configured in `cypress.config.ts`):

- `ADMIN_EMAIL` - Admin test account
- `TEST_CLIENT_EMAIL` - Client test account
- `TEST_DESIGNER_EMAIL` - Designer test account
- `API_URL` - API base URL
- All 8 centralized service feature flags

## Writing Tests

### Example E2E Test

```typescript
describe('Designer Application Flow', () => {
  beforeEach(() => {
    cy.resetDatabase()
    cy.seedTestData()
  })

  it('should allow designer to apply and get approved', () => {
    // Designer signs up
    cy.visit('/designer/signup')
    cy.get('input[type="email"]').type('new@designer.com')
    cy.get('button[type="submit"]').click()

    // Verify OTP
    cy.enterOTP('123456')

    // Fill application
    cy.fillDesignerApplication({
      firstName: 'Test',
      lastName: 'Designer',
      skills: ['UI Design', 'Branding']
    })

    // Admin approves
    cy.loginAsAdmin()
    cy.approveDesigner('designer-id')
  })
})
```

### Testing Centralized Services

All tests should verify the 8 centralized services are functioning:

```typescript
it('should validate centralized services', () => {
  cy.checkCentralizedServices()

  // Test specific service behavior
  cy.intercept('POST', '/api/match/find').as('matching')
  cy.createBrief()
  cy.wait('@matching')

  // Verify error handling
  cy.get('@matching').should((xhr) => {
    expect(xhr.response.headers).to.have.property('x-correlation-id')
  })
})
```

## Best Practices

1. **Test Isolation**: Each test should be independent and reset state
2. **Use Fixtures**: Store test data in fixtures for reusability
3. **Custom Commands**: Use custom commands for common workflows
4. **Wait for Elements**: Use proper Cypress waiting strategies
5. **Test Real Flows**: Test complete user journeys, not just UI

## Running in CI/CD

For CI/CD pipelines (e.g., GitHub Actions):

```yaml
- name: Run E2E Tests
  run: |
    npm ci
    npm run build
    npm run test:e2e
  env:
    CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}

# With Cypress Cloud recording
- name: Run E2E Tests with Recording
  run: |
    npm ci
    npm run build
    npm run test:e2e:record
  env:
    CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
    CYPRESS_PROJECT_ID: enb4g2  # Optional, already in config

# Parallel execution (requires Cypress Cloud)
- name: Run E2E Tests in Parallel
  run: |
    npm ci
    npm run build
    npm run cypress:record -- --parallel --ci-build-id ${{ github.run_id }}
  env:
    CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
```

## Debugging

1. **Screenshots**: Automatically captured on failure in `cypress/screenshots/`
2. **Videos**: Test execution videos in `cypress/videos/`
3. **Console Logs**: Captured via `cy.spy()` in support file
4. **Network Logs**: Use `cy.intercept()` to debug API calls

## Common Issues

### Port Already in Use
If port 3000 is in use, update `cypress.config.ts`:
```typescript
baseUrl: 'http://localhost:3001'
```

### OTP Verification
Tests use mock OTPs. In production tests, implement:
```typescript
cy.task('getOTPFromDatabase', email)
```

### Rate Limiting
Tests may trigger rate limits. Add delays:
```typescript
cy.wait(1000) // Wait 1 second between OTP requests
```

## Coverage

Current test coverage includes:
- ✅ Designer signup and application flow
- ✅ Admin approval process
- ✅ Client brief creation
- ✅ AI-powered matching
- ✅ Working request system
- ✅ Payment and credits
- ✅ All 8 centralized services
- ✅ Error handling and edge cases

## Contributing

When adding new tests:
1. Follow existing patterns
2. Use TypeScript for type safety
3. Add custom commands for reusable workflows
4. Update this README with new commands/tests
5. Ensure tests pass locally before committing