const fetch = require('node-fetch');

async function createTestDesigner() {
  try {
    const response = await fetch('https://onedesigner2-2n1atvjqx-onedesigners-projects.vercel.app/api/test/create-designer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: 'Sarah',
        lastName: 'Mitchell',
        email: 'sarah.mitchell@example.com',
        title: 'Senior UI/UX Designer',
        categories: ['web-mobile-design', 'branding-logo-design'],
        yearsExperience: 8,
        bio: 'Passionate about creating intuitive and beautiful digital experiences.',
        styles: ['Minimalist', 'Modern', 'Clean'],
        industries: ['Technology', 'SaaS', 'Mobile Apps'],
        city: 'San Francisco',
        country: 'USA',
        hourlyRate: 150,
        isApproved: true
      })
    });

    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', result);

    if (response.ok) {
      console.log('✅ Test designer created successfully');
    } else {
      console.log('❌ Failed to create test designer');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createTestDesigner();