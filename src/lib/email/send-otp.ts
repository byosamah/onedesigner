export async function sendOTPEmail(email: string, otp: string) {
  // In development, log the OTP
  if (process.env.NODE_ENV === 'development') {
    console.log('\n' + '='.repeat(50))
    console.log('🎨 OneDesigner OTP Code')
    console.log('='.repeat(50))
    console.log(`Email: ${email}`)
    console.log(`Code: ${otp}`)
    console.log('='.repeat(50) + '\n')
    return true
  }

  // In production, you would use a real email service here
  // For now, we'll just log it
  console.log(`OTP ${otp} sent to ${email}`)
  
  return true
}