/**
 * OneDesigner Logo Component for Email Templates
 * 
 * This ensures consistent logo usage across all email templates.
 * Based on the official OneDesigner logo (4-petal flower/clover shape).
 */

export interface LogoProps {
  size?: number
  color?: string
}

/**
 * Generate the OneDesigner logo SVG
 */
export function getOneDesignerLogoSVG({ size = 48, color = '#f0ad4e' }: LogoProps = {}): string {
  return `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: ${size}px; height: ${size}px;">
      <g fill="${color}">
        <!-- Top petal -->
        <ellipse cx="50" cy="30" rx="20" ry="25" />
        <!-- Right petal -->
        <ellipse cx="70" cy="50" rx="25" ry="20" />
        <!-- Bottom petal -->
        <ellipse cx="50" cy="70" rx="20" ry="25" />
        <!-- Left petal -->
        <ellipse cx="30" cy="50" rx="25" ry="20" />
        <!-- Center circle to blend petals -->
        <circle cx="50" cy="50" r="12" />
      </g>
    </svg>
  `.trim()
}

/**
 * Generate the complete golden text header for emails (NEW STANDARD)
 */
export function getEmailLogoHeader({ brandNameColor = '#f0ad4e' }: {
  brandNameColor?: string
} = {}): string {
  return `
    <div style="text-align: center; padding: 32px; border-bottom: 1px solid #F3F4F6;">
      <span style="font-size: 24px; font-weight: 700; color: ${brandNameColor}; letter-spacing: -0.02em;">OneDesigner</span>
    </div>
  `.trim()
}

/**
 * Standard email header with golden OneDesigner text (NEW STANDARD)
 */
export const EMAIL_LOGO_HEADER = getEmailLogoHeader()

/**
 * For use in email subject lines or text-only contexts
 */
export const LOGO_TEXT = 'OneDesigner'

/**
 * Brand colors for consistency
 */
export const BRAND_COLORS = {
  primary: '#f0ad4e',
  primaryDark: '#ec971f',
  text: '#111827',
  textSecondary: '#4B5563',
  background: '#FAFAFA',
  white: '#FFFFFF'
} as const