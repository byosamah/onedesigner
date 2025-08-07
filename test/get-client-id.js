#!/usr/bin/env node

// Get a client ID from your database for testing
// You'll need to run this and copy a real client ID

console.log('To get a real client ID for testing:')
console.log('')
console.log('Option 1: Check your database directly')
console.log('- Go to your Supabase dashboard')
console.log('- Open Table Editor → clients table') 
console.log('- Copy an ID from the "id" column')
console.log('')
console.log('Option 2: Create a test client')
console.log('- Go through your app signup flow')
console.log('- Check the browser dev tools network tab for the client ID')
console.log('')
console.log('Option 3: Add console.log to your app')
console.log('- In your client registration/login code, add:')
console.log('- console.log("Client ID:", clientId)')
console.log('')
console.log('Once you have the client ID, update manual-webhook-test.js')
console.log('and run: node test/manual-webhook-test.js')