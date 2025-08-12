async function testRealMatchAvatar() {
  console.log('🎯 Testing Avatar with REAL Match ID...\n')
  
  const deploymentUrl = 'https://onedesigner2-k2le3nk9f-onedesigners-projects.vercel.app'
  
  // Use real match IDs from the database
  const realMatchIds = [
    'd4a262ed-7dff-47e0-92ba-7a3be2cd8236', // Unlocked match
    'f2bb6bc1-484f-474d-a527-ee0a143cccdf', // Unlocked match  
    '4d53efaf-ac2f-4c36-8ee1-a269548cf8b7', // Unlocked match
    'e24a1852-12bf-4abd-b0df-bd3455bf24cb'  // Unlocked match
  ]
  
  console.log('✅ **REAL MATCH URLs TO TEST:**')
  realMatchIds.forEach((matchId, index) => {
    const testUrl = `${deploymentUrl}/client/match/${matchId}`
    console.log(`${index + 1}. ${testUrl}`)
  })
  console.log('')
  
  console.log('🔑 **CLIENT LOGIN INFO:**')
  console.log('- Email: osamah96@gmail.com')
  console.log('- Client ID: 52cc18a2-8aaf-40c6-971a-4a4f876e1ff5')
  console.log('- Credits: 1 match available')
  console.log('')
  
  console.log('🚨 **WHAT SHOULD HAPPEN NOW:**')
  console.log('1. ✅ No more "Match Not Found" error')
  console.log('2. ✅ Should redirect to /client/login if not authenticated')
  console.log('3. ✅ After login, should show the match page')
  console.log('4. ✅ Should see RED DEBUG BOX below avatar')
  console.log('')
  
  console.log('🔍 **DEBUG INFO TO LOOK FOR:**')
  console.log('- Red debug box showing:')
  console.log('  URL: [actual avatar URL or NULL]')
  console.log('  Error: true/false')
  console.log('  firstName: [actual designer name]')
  console.log('')
  
  console.log('🎯 **RECOMMENDED TEST URL:**')
  console.log(`👉 ${deploymentUrl}/client/match/d4a262ed-7dff-47e0-92ba-7a3be2cd8236`)
  console.log('')
  console.log('This match is UNLOCKED so you should see:')
  console.log('- Designer full name (not blurred)')
  console.log('- Contact information visible')
  console.log('- Portfolio images (not blurred)')
  console.log('- RED DEBUG BOX showing avatar URL')
}

testRealMatchAvatar().catch(console.error)