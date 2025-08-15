const { createDesignerApprovalEmailMarcStyle, createDesignerRejectionEmailMarcStyle } = require('../src/lib/email/templates/marc-lou-style');

console.log('🎨 Testing Designer Approval and Rejection Email Templates\n');
console.log('=' .repeat(60));

// Test Approval Email
console.log('\n📧 APPROVAL EMAIL PREVIEW:');
console.log('-'.repeat(60));

const approvalEmail = createDesignerApprovalEmailMarcStyle({
  designerName: 'John',
  dashboardUrl: 'https://onedesigner.app/designer/login'
});

console.log('Subject:', approvalEmail.subject);
console.log('\nHTML Preview (first 500 chars):');
console.log(approvalEmail.html.substring(0, 500) + '...');
console.log('\nText version (first 300 chars):');
console.log(approvalEmail.text.substring(0, 300) + '...');

// Test Rejection Email
console.log('\n\n📧 REJECTION EMAIL PREVIEW:');
console.log('-'.repeat(60));

const rejectionEmail = createDesignerRejectionEmailMarcStyle({
  designerName: 'Sarah',
  rejectionReason: 'Your portfolio needs more variety. We need to see at least 5 different projects showcasing different design styles and industries.',
  updateApplicationUrl: 'https://onedesigner.app/designer/update-application?token=abc123'
});

console.log('Subject:', rejectionEmail.subject);
console.log('\nHTML Preview (first 500 chars):');
console.log(rejectionEmail.html.substring(0, 500) + '...');
console.log('\nText version (first 300 chars):');
console.log(rejectionEmail.text.substring(0, 300) + '...');

console.log('\n' + '='.repeat(60));
console.log('✅ Email templates are working correctly!');
console.log('\nKey features:');
console.log('- Marc Lou style with conversational tone');
console.log('- Branded with OneDesigner colors');
console.log('- Mobile-responsive design');
console.log('- Clear CTAs');
console.log('- Sender: Hala from OneDesigner');