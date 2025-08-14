const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPosts() {
  console.log('📖 Checking blog posts...\n');

  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, slug, title, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    if (!posts || posts.length === 0) {
      console.log('📝 No blog posts found in database');
    } else {
      console.log(`Found ${posts.length} blog posts:\n`);
      posts.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`);
        console.log(`   Slug: ${post.slug}`);
        console.log(`   Status: ${post.status}`);
        console.log(`   Created: ${new Date(post.created_at).toLocaleString()}`);
        console.log('');
      });
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkPosts();