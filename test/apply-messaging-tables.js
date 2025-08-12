const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndCreateTables() {
  console.log('🔍 Checking if messaging tables exist...');
  
  try {
    // Check if conversations table exists
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .limit(1);
    
    if (convError && convError.message.includes('relation "public.conversations" does not exist')) {
      console.log('❌ Conversations table does not exist');
      console.log('📝 Please run the migration SQL manually in Supabase dashboard:');
      console.log('   1. Go to https://supabase.com/dashboard/project/frwchtwxpnrlpzksupgm/sql');
      console.log('   2. Copy and run the contents of migrations/012_messaging_system.sql');
      return false;
    }
    
    // Check if messages table exists
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('id')
      .limit(1);
    
    if (msgError && msgError.message.includes('relation "public.messages" does not exist')) {
      console.log('❌ Messages table does not exist');
      console.log('📝 Please run the migration SQL manually in Supabase dashboard');
      return false;
    }
    
    // Check if match_requests table exists
    const { data: requests, error: reqError } = await supabase
      .from('match_requests')
      .select('id')
      .limit(1);
    
    if (reqError && reqError.message.includes('relation "public.match_requests" does not exist')) {
      console.log('❌ Match requests table does not exist');
      console.log('📝 Please run the migration SQL manually in Supabase dashboard');
      return false;
    }
    
    console.log('✅ All messaging tables exist!');
    
    // Test creating a conversation
    console.log('\n🧪 Testing conversation creation...');
    
    // Get a sample match
    const { data: match } = await supabase
      .from('matches')
      .select('id, client_id, designer_id, brief_id')
      .limit(1)
      .single();
    
    if (match) {
      console.log('Found match:', match.id);
      
      // Check if conversation already exists for this match
      const { data: existingConvo } = await supabase
        .from('conversations')
        .select('*')
        .eq('match_id', match.id)
        .single();
      
      if (existingConvo) {
        console.log('✅ Conversation already exists for this match:', existingConvo.id);
      } else {
        // Create a test conversation
        const { data: newConvo, error: createError } = await supabase
          .from('conversations')
          .insert({
            match_id: match.id,
            client_id: match.client_id,
            designer_id: match.designer_id,
            brief_id: match.brief_id,
            status: 'pending',
            initiated_by: 'client'
          })
          .select()
          .single();
        
        if (createError) {
          console.error('❌ Error creating conversation:', createError);
        } else {
          console.log('✅ Test conversation created:', newConvo.id);
          
          // Clean up test conversation
          await supabase
            .from('conversations')
            .delete()
            .eq('id', newConvo.id);
          
          console.log('🧹 Test conversation cleaned up');
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error checking tables:', error);
    return false;
  }
}

checkAndCreateTables().then(success => {
  if (success) {
    console.log('\n✅ Messaging system is ready!');
  } else {
    console.log('\n⚠️  Messaging tables need to be created');
    console.log('Please run the migration in Supabase dashboard');
  }
  process.exit(success ? 0 : 1);
});