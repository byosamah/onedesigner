const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanupAllData() {
  console.log('🗑️  Starting complete data cleanup...\n')
  console.log('⚠️  WARNING: This will DELETE all designers, clients, and related data!')
  console.log('─'.repeat(60))
  
  try {
    // Track deletion counts
    let deletionStats = {
      designers: 0,
      clients: 0,
      matches: 0,
      briefs: 0,
      projectRequests: 0,
      clientDesigners: 0,
      designerEmbeddings: 0,
      matchCache: 0,
      portfolioImages: 0,
      authTokens: 0,
      conversations: 0,
      messages: 0
    }

    // Order matters due to foreign key constraints
    // Delete dependent tables first

    // 1. Delete messages first (depends on conversations)
    console.log('\n💬 Deleting messages...')
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('id')
    
    if (!msgError && messages && messages.length > 0) {
      const { error } = await supabase
        .from('messages')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000') // Delete all
      
      if (!error) {
        deletionStats.messages = messages.length
        console.log(`✅ Deleted ${messages.length} messages`)
      } else {
        console.error('Error deleting messages:', error.message)
      }
    } else {
      console.log('✓ No messages to delete')
    }

    // 2. Delete conversations
    console.log('\n💬 Deleting conversations...')
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id')
    
    if (!convError && conversations && conversations.length > 0) {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000')
      
      if (!error) {
        deletionStats.conversations = conversations.length
        console.log(`✅ Deleted ${conversations.length} conversations`)
      } else {
        console.error('Error deleting conversations:', error.message)
      }
    } else {
      console.log('✓ No conversations to delete')
    }

    // 3. Delete project requests (depends on designers and clients)
    console.log('\n📨 Deleting project requests...')
    const { data: projectRequests, error: prError } = await supabase
      .from('project_requests')
      .select('id')
    
    if (!prError && projectRequests && projectRequests.length > 0) {
      const { error } = await supabase
        .from('project_requests')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000')
      
      if (!error) {
        deletionStats.projectRequests = projectRequests.length
        console.log(`✅ Deleted ${projectRequests.length} project requests`)
      } else {
        console.error('Error deleting project requests:', error.message)
      }
    } else {
      console.log('✓ No project requests to delete')
    }

    // 4. Delete matches (depends on briefs, clients, designers)
    console.log('\n📊 Deleting matches...')
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select('id')
    
    if (!matchError && matches && matches.length > 0) {
      const { error } = await supabase
        .from('matches')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000')
      
      if (!error) {
        deletionStats.matches = matches.length
        console.log(`✅ Deleted ${matches.length} matches`)
      } else {
        console.error('Error deleting matches:', error.message)
      }
    } else {
      console.log('✓ No matches to delete')
    }

    // 5. Delete briefs (depends on clients)
    console.log('\n📝 Deleting briefs...')
    const { data: briefs, error: briefError } = await supabase
      .from('briefs')
      .select('id')
    
    if (!briefError && briefs && briefs.length > 0) {
      const { error } = await supabase
        .from('briefs')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000')
      
      if (!error) {
        deletionStats.briefs = briefs.length
        console.log(`✅ Deleted ${briefs.length} briefs`)
      } else {
        console.error('Error deleting briefs:', error.message)
      }
    } else {
      console.log('✓ No briefs to delete')
    }

    // 6. Delete client_designers junction table
    console.log('\n🔗 Deleting client-designer relationships...')
    const { data: clientDesigners, error: cdError } = await supabase
      .from('client_designers')
      .select('id')
    
    if (!cdError && clientDesigners && clientDesigners.length > 0) {
      const { error } = await supabase
        .from('client_designers')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000')
      
      if (!error) {
        deletionStats.clientDesigners = clientDesigners.length
        console.log(`✅ Deleted ${clientDesigners.length} client-designer relationships`)
      } else {
        console.error('Error deleting client_designers:', error.message)
      }
    } else {
      console.log('✓ No client-designer relationships to delete')
    }

    // 7. Delete designer embeddings
    console.log('\n🔢 Deleting designer embeddings...')
    const { data: embeddings, error: embError } = await supabase
      .from('designer_embeddings')
      .select('id')
    
    if (!embError && embeddings && embeddings.length > 0) {
      const { error } = await supabase
        .from('designer_embeddings')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000')
      
      if (!error) {
        deletionStats.designerEmbeddings = embeddings.length
        console.log(`✅ Deleted ${embeddings.length} designer embeddings`)
      } else {
        console.error('Error deleting embeddings:', error.message)
      }
    } else {
      console.log('✓ No designer embeddings to delete')
    }

    // 8. Delete match cache
    console.log('\n💾 Deleting match cache...')
    const { data: matchCache, error: mcError } = await supabase
      .from('match_cache')
      .select('id')
    
    if (!mcError && matchCache && matchCache.length > 0) {
      const { error } = await supabase
        .from('match_cache')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000')
      
      if (!error) {
        deletionStats.matchCache = matchCache.length
        console.log(`✅ Deleted ${matchCache.length} match cache entries`)
      } else {
        console.error('Error deleting match cache:', error.message)
      }
    } else {
      console.log('✓ No match cache to delete')
    }

    // 9. Delete portfolio images
    console.log('\n🖼️  Deleting portfolio images...')
    const { data: portfolioImages, error: piError } = await supabase
      .from('portfolio_images')
      .select('id')
    
    if (!piError && portfolioImages && portfolioImages.length > 0) {
      const { error } = await supabase
        .from('portfolio_images')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000')
      
      if (!error) {
        deletionStats.portfolioImages = portfolioImages.length
        console.log(`✅ Deleted ${portfolioImages.length} portfolio images`)
      } else {
        console.error('Error deleting portfolio images:', error.message)
      }
    } else {
      console.log('✓ No portfolio images to delete')
    }

    // 10. Delete auth tokens
    console.log('\n🔐 Deleting auth tokens...')
    const { data: authTokens, error: atError } = await supabase
      .from('auth_tokens')
      .select('id')
    
    if (!atError && authTokens && authTokens.length > 0) {
      const { error } = await supabase
        .from('auth_tokens')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000')
      
      if (!error) {
        deletionStats.authTokens = authTokens.length
        console.log(`✅ Deleted ${authTokens.length} auth tokens`)
      } else {
        console.error('Error deleting auth tokens:', error.message)
      }
    } else {
      console.log('✓ No auth tokens to delete')
    }

    // 11. Delete all designers
    console.log('\n👨‍🎨 Deleting all designers...')
    const { data: designers, error: designerError } = await supabase
      .from('designers')
      .select('id, first_name, last_name, email')
    
    if (!designerError && designers && designers.length > 0) {
      const { error } = await supabase
        .from('designers')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000')
      
      if (!error) {
        deletionStats.designers = designers.length
        console.log(`✅ Deleted ${designers.length} designers`)
        // Show first few deleted designers
        designers.slice(0, 3).forEach(d => {
          console.log(`   - ${d.first_name} ${d.last_name} (${d.email})`)
        })
        if (designers.length > 3) {
          console.log(`   ... and ${designers.length - 3} more`)
        }
      } else {
        console.error('Error deleting designers:', error.message)
      }
    } else {
      console.log('✓ No designers to delete')
    }

    // 12. Delete all clients
    console.log('\n💼 Deleting all clients...')
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('id, email')
    
    if (!clientError && clients && clients.length > 0) {
      const { error } = await supabase
        .from('clients')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000')
      
      if (!error) {
        deletionStats.clients = clients.length
        console.log(`✅ Deleted ${clients.length} clients`)
        // Show first few deleted clients
        clients.slice(0, 3).forEach(c => {
          console.log(`   - ${c.email}`)
        })
        if (clients.length > 3) {
          console.log(`   ... and ${clients.length - 3} more`)
        }
      } else {
        console.error('Error deleting clients:', error.message)
      }
    } else {
      console.log('✓ No clients to delete')
    }

    // Print summary
    console.log('\n' + '═'.repeat(60))
    console.log('🎉 CLEANUP COMPLETE - Summary:')
    console.log('═'.repeat(60))
    
    const totalDeleted = Object.values(deletionStats).reduce((a, b) => a + b, 0)
    
    if (totalDeleted > 0) {
      console.log('\nDeleted records by type:')
      Object.entries(deletionStats).forEach(([key, value]) => {
        if (value > 0) {
          const formattedKey = key.replace(/([A-Z])/g, ' $1').trim()
          console.log(`  • ${formattedKey}: ${value}`)
        }
      })
      console.log(`\n📊 Total records deleted: ${totalDeleted}`)
    } else {
      console.log('\n✨ Database was already clean - no records to delete')
    }
    
    console.log('\n✅ Your database is now completely clean!')
    console.log('   All designer and client data has been removed.')
    console.log('   The database structure remains intact.\n')
    
  } catch (error) {
    console.error('\n❌ Fatal error during cleanup:', error)
    console.error('Some data may have been partially deleted.')
    console.error('Please check your database manually.')
  }
}

// Ask for confirmation
const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log('═'.repeat(60))
console.log('  ONEDESIGNER DATABASE CLEANUP TOOL')
console.log('═'.repeat(60))
console.log('\n⚠️  WARNING: This will delete ALL data from the following tables:')
console.log('  Primary Tables:')
console.log('    • designers - All designer profiles')
console.log('    • clients - All client accounts')
console.log('')
console.log('  Related Tables:')
console.log('    • matches - All AI-generated matches')
console.log('    • briefs - All project briefs')
console.log('    • project_requests - All project requests')
console.log('    • client_designers - All client-designer relationships')
console.log('    • designer_embeddings - All designer AI embeddings')
console.log('    • match_cache - All cached match results')
console.log('    • portfolio_images - All portfolio images')
console.log('    • auth_tokens - All authentication tokens (OTP codes)')
console.log('    • conversations - All chat conversations')
console.log('    • messages - All chat messages')
console.log('')
console.log('⚠️  THIS ACTION CANNOT BE UNDONE!')
console.log('═'.repeat(60))
console.log('')

rl.question('Type "DELETE ALL" to confirm, or anything else to cancel: ', (answer) => {
  if (answer === 'DELETE ALL') {
    console.log('\n🚀 Starting cleanup process...\n')
    cleanupAllData().then(() => {
      rl.close()
    })
  } else {
    console.log('\n✅ Cleanup cancelled. No data was deleted.')
    rl.close()
  }
})