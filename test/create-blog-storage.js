const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBlogStorage() {
  try {
    console.log('Creating blog-images storage bucket...');
    
    // Create the bucket
    const { data: bucket, error: createError } = await supabase.storage.createBucket('blog-images', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    });
    
    if (createError) {
      if (createError.message.includes('already exists')) {
        console.log('✓ Bucket already exists');
        
        // Update bucket settings if it exists
        const { error: updateError } = await supabase.storage.updateBucket('blog-images', {
          public: true,
          fileSizeLimit: 5242880,
          allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        });
        
        if (updateError) {
          console.error('Error updating bucket:', updateError);
        } else {
          console.log('✓ Bucket settings updated');
        }
      } else {
        console.error('Error creating bucket:', createError);
      }
    } else {
      console.log('✓ Blog images bucket created successfully');
    }
    
    // Test upload a sample file
    console.log('\nTesting bucket access...');
    const testFile = Buffer.from('test');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload('test/test.txt', testFile, {
        contentType: 'text/plain',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Error testing upload:', uploadError);
    } else {
      console.log('✓ Test upload successful');
      
      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from('blog-images')
        .remove(['test/test.txt']);
      
      if (!deleteError) {
        console.log('✓ Test file cleaned up');
      }
    }
    
    // Get public URL format
    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl('example.jpg');
    
    console.log('\n📁 Storage Configuration:');
    console.log('Bucket Name: blog-images');
    console.log('Max File Size: 5MB');
    console.log('Allowed Types: JPEG, PNG, GIF, WebP');
    console.log('Public URL Format:', publicUrl.replace('example.jpg', '[filename]'));
    
  } catch (error) {
    console.error('Error setting up blog storage:', error);
  }
}

createBlogStorage();