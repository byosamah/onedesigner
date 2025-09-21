import { defineConfig } from 'cypress'

export default defineConfig({
  projectId: 'enb4g2', // Cypress Cloud project ID for recording test runs
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,

    // Test isolation and retries
    testIsolation: true,
    retries: {
      runMode: 2,
      openMode: 0,
    },

    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,

    // Environment variables for OneDesigner
    env: {
      // Test accounts
      ADMIN_EMAIL: 'osamah96@gmail.com',
      TEST_CLIENT_EMAIL: 'test-client@example.com',
      TEST_DESIGNER_EMAIL: 'test-designer@example.com',

      // API endpoints
      API_URL: 'http://localhost:3000/api',

      // Feature flags for testing
      USE_NEW_DATA_SERVICE: true,
      USE_ERROR_MANAGER: true,
      USE_REQUEST_PIPELINE: true,
      USE_CONFIG_MANAGER: true,
      USE_BUSINESS_RULES: true,
      USE_CENTRALIZED_LOGGING: true,
      USE_OTP_SERVICE: true,
      USE_EMAIL_SERVICE: true,
    },

    setupNodeEvents(on, config) {
      // Implement node event listeners here
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
        // Add custom tasks for database operations
        async resetDatabase() {
          // Custom task to reset test database
          const { createClient } = require('@supabase/supabase-js')

          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
          )

          try {
            // Clean up test data in reverse order of dependencies
            await supabase.from('project_requests').delete().neq('id', '')
            await supabase.from('client_designers').delete().neq('id', '')
            await supabase.from('matches').delete().neq('id', '')
            await supabase.from('briefs').delete().neq('id', '')
            await supabase.from('clients').delete().like('email', '%test%')
            await supabase.from('designers').delete().like('email', '%test%')

            console.log('Test database reset completed')
            return { success: true, message: 'Database reset successfully' }
          } catch (error) {
            console.error('Database reset failed:', error)
            return { success: false, error: error.message }
          }
        },
        async seedTestData() {
          // Custom task to seed test data
          const { createClient } = require('@supabase/supabase-js')

          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
          )

          try {
            // Create test client
            const { data: client } = await supabase
              .from('clients')
              .insert({
                email: 'test-client@example.com',
                name: 'Test Client',
                company: 'Test Company',
                match_credits: 10
              })
              .select()
              .single()

            // Create test designer
            const { data: designer } = await supabase
              .from('designers')
              .insert({
                email: 'test-designer@example.com',
                first_name: 'Test',
                last_name: 'Designer',
                is_approved: true,
                is_verified: true,
                portfolio_url: 'https://example.com/portfolio',
                skills: ['UI/UX', 'Branding'],
                experience_level: 'intermediate'
              })
              .select()
              .single()

            // Create test brief
            const { data: brief } = await supabase
              .from('briefs')
              .insert({
                client_id: client.id,
                project_type: 'mobile-app',
                industry: 'Technology',
                timeline: '4-6 weeks',
                budget: '$5,000 - $10,000',
                requirements: 'Test project requirements',
                styles: ['modern', 'minimal']
              })
              .select()
              .single()

            console.log('Test data seeded successfully')
            return {
              success: true,
              data: { clientId: client.id, designerId: designer.id, briefId: brief.id }
            }
          } catch (error) {
            console.error('Data seeding failed:', error)
            return { success: false, error: error.message }
          }
        },
      })

      // Load environment-specific configuration
      const environment = config.env.environment || 'local'
      if (environment === 'staging') {
        config.baseUrl = 'https://onedesigner-staging.vercel.app'
      } else if (environment === 'production') {
        config.baseUrl = 'https://onedesigner.app'
      }

      return config
    },
  },

  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
  },
})