// Admin configuration
// Admin emails are loaded from environment variable for security
// Set ADMIN_EMAILS as comma-separated list: "admin1@example.com,admin2@example.com"

const adminEmailsEnv = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || ''

export const ADMIN_EMAILS: string[] = adminEmailsEnv
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(email => email.length > 0)

// Check if an email is an admin
export function isAdminEmail(email: string): boolean {
  if (ADMIN_EMAILS.length === 0) {
    console.warn('⚠️ No admin emails configured. Set ADMIN_EMAILS or ADMIN_EMAIL environment variable.')
    return false
  }
  return ADMIN_EMAILS.includes(email.toLowerCase())
}