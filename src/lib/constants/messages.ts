// Contact Designer Messages
export const CONTACT_MESSAGES = {
  DEFAULT: 'I would like to work with you on my project.',
  SUGGESTIONS: [
    "I'd love to work with you on my project. Your portfolio perfectly matches what I'm looking for.",
    "Your design style aligns perfectly with my vision. Let's discuss the project details.",
    "I'm impressed by your work and would like to collaborate on my upcoming project.",
    "Your expertise in this area is exactly what my project needs. Looking forward to working together."
  ]
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  CONTACT_SENT: {
    title: 'Message Sent!',
    message: 'The designer will receive an email notification and can approve your project request.'
  },
  PROJECT_APPROVED: {
    title: 'Project Approved!',
    message: 'You can now contact the client directly to discuss project details.'
  },
  PROJECT_REJECTED: {
    title: 'Request Declined',
    message: 'The project request has been declined.'
  },
  PROFILE_UPDATED: {
    title: 'Profile Updated!',
    message: 'Your profile has been successfully updated.'
  }
} as const

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'An error occurred. Please try again.',
  UNAUTHORIZED: 'Please log in to continue.',
  NOT_FOUND: 'The requested resource was not found.',
  ALREADY_EXISTS: 'This resource already exists.',
  VALIDATION_FAILED: 'Please check your input and try again.'
} as const