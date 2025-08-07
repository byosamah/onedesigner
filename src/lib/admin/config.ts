// Admin configuration
// Add your admin email addresses here
export const ADMIN_EMAILS = [
  'osamah96@gmail.com', // Primary admin
  // Add more admin emails as needed:
  // 'another-admin@example.com',
]

// Check if an email is an admin
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}