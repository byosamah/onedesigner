/**
 * Availability utility functions for consistent display across the application
 */

export type AvailabilityStatus = 'immediate' | '1-2weeks' | '2-4weeks' | '1-2months' | 'unavailable'

export const AVAILABILITY_OPTIONS = [
  { value: 'immediate', label: 'Immediate', icon: '⚡' },
  { value: '1-2weeks', label: '1-2 weeks', icon: '📅' },
  { value: '2-4weeks', label: '2-4 weeks', icon: '📆' },
  { value: '1-2months', label: '1+ months', icon: '🗓️' },
  { value: 'unavailable', label: 'Unavailable', icon: '⏸️' }
] as const

/**
 * Get user-friendly availability display text
 * @param availability The availability status from the database
 * @param includeIcon Whether to include the emoji icon
 * @returns Formatted availability text
 */
export function getAvailabilityDisplay(
  availability: AvailabilityStatus | string | null | undefined,
  includeIcon: boolean = false
): string {
  if (!availability) return 'Not specified'

  const option = AVAILABILITY_OPTIONS.find(opt => opt.value === availability)

  if (option) {
    const text = availability === 'immediate' ? 'Available Now' :
                 availability === '1-2weeks' ? 'Available in 1-2 weeks' :
                 availability === '2-4weeks' ? 'Available in 2-4 weeks' :
                 availability === '1-2months' ? 'Available in 1+ months' :
                 availability === 'unavailable' ? 'Currently Unavailable' :
                 option.label

    return includeIcon ? `${option.icon} ${text}` : text
  }

  // Fallback for unknown values
  return availability
}

/**
 * Get availability option by value
 * @param value The availability value
 * @returns The availability option object or null
 */
export function getAvailabilityOption(value: string) {
  return AVAILABILITY_OPTIONS.find(option => option.value === value) || null
}

/**
 * Check if availability indicates the designer is currently available
 * @param availability The availability status
 * @returns True if available (immediate or within timeframes), false if unavailable
 */
export function isDesignerAvailable(availability: AvailabilityStatus | string | null | undefined): boolean {
  return availability !== 'unavailable' && availability !== null && availability !== undefined
}