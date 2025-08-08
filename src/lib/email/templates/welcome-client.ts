import { createWelcomeClientEmail } from '../template-base'

interface WelcomeClientEmailProps {
  clientName: string
  dashboardUrl: string
}

export function welcomeClientEmail({
  clientName,
  dashboardUrl,
}: WelcomeClientEmailProps) {
  return createWelcomeClientEmail({
    clientName,
    dashboardUrl
  })
}