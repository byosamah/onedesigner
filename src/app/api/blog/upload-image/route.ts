import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Check admin key
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== 'onedesigner_admin_2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size too large. Maximum size is 5MB.' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExt = file.name.split('.').pop();
    const fileName = `blog-${timestamp}-${randomString}.${fileExt}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      
      // If bucket doesn't exist, try to create it
      if (error.message?.includes('not found')) {
        const { error: bucketError } = await supabase.storage.createBucket('blog-images', {
          public: true,
          allowedMimeTypes: allowedTypes,
          fileSizeLimit: maxSize
        });
        
        if (bucketError && !bucketError.message?.includes('already exists')) {
          return NextResponse.json({ error: 'Failed to create storage bucket' }, { status: 500 });
        }
        
        // Retry upload after creating bucket
        const { data: retryData, error: retryError } = await supabase.storage
          .from('blog-images')
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: false
          });
          
        if (retryError) {
          return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
      }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName);

    return NextResponse.json({ 
      url: publicUrl,
      fileName: fileName 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}