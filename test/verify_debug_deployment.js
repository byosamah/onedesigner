async function verifyDebugDeployment() {
  console.log('🔍 Verifying Debug Deployment...\n');
  
  // The latest deployment URL
  const deploymentUrl = 'https://onedesigner2-osn4ihgxy-onedesigners-projects.vercel.app';
  
  console.log('Latest deployment URL:', deploymentUrl);
  console.log('');
  
  // Test a few different match IDs that might exist
  const testMatchIds = [
    'd4a262ed-7dff-47e0-92ba-7a3be2cd8236', // Muhammad Garcia
    '68c1e6c3-face-437e-8740-eb7435394e66'  // From the console (Paul R.)
  ];
  
  console.log('🧪 Test URLs to try:');
  for (const matchId of testMatchIds) {
    const testUrl = `${deploymentUrl}/client/match/${matchId}`;
    console.log(`- ${testUrl}`);
  }
  
  console.log('\n🚨 **CRITICAL DEBUGGING STEPS:**');
  console.log('1. Make sure you are using the correct URL above');
  console.log('2. Open the correct match page');  
  console.log('3. Check if you are logged in as a client');
  console.log('4. Hard refresh with Ctrl+Shift+R (or Cmd+Shift+R on Mac)');
  console.log('5. Check Console tab immediately after refresh');
  console.log('');
  
  console.log('🔍 **DEBUG MESSAGES TO LOOK FOR:**');
  console.log('- 🔍 Full API response:');
  console.log('- 🔍 Designer data:');
  console.log('- 🔍 Avatar URL:');
  console.log('- 🔍 firstName:');
  console.log('- 🎭 DesignerAvatar component render:');
  console.log('- 🚨 Showing initials because:');
  console.log('- Avatar image loaded successfully: OR Avatar image failed to load:');
  console.log('');
  
  console.log('⚠️  **IF STILL NO DEBUG MESSAGES:**');
  console.log('1. The deployment might not have the debug code');
  console.log('2. You might be looking at a cached version');
  console.log('3. JavaScript might be disabled or erroring');
  console.log('4. You might not be authenticated');
  console.log('');
  
  console.log('🔧 **ALTERNATIVE APPROACH:**');
  console.log('If debug messages still don\'t appear, try:');
  console.log('1. Right-click on the avatar → Inspect Element');
  console.log('2. Look at the HTML structure');
  console.log('3. See if it\'s showing <img> tag or <div> with initials');
  console.log('4. Check Network tab for any failed image requests');
}

verifyDebugDeployment().catch(console.error);