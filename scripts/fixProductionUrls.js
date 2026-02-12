require('dotenv').config();
const Event = require('../models/Event');
const Danweem = require('../models/Danweem');

/**
 * Fix URLs in database - Replace localhost with production domain
 */
async function fixProductionUrls() {
  console.log('Starting URL fix for production...\n');
  
  const LOCALHOST_PATTERNS = [
    'http://localhost:5000',
    'http://localhost:5000/',
    'http://127.0.0.1:5000',
  ];
  
  const PRODUCTION_BASE = process.env.BASE_URL || 'https://backend.dharmadeshana.lk';
  
  try {
    // Fix Events
    console.log('=== Fixing Event URLs ===');
    const events = await Event.getAll();
    let eventCount = 0;
    
    for (const event of events) {
      let updated = false;
      const updates = { ...event };
      
      // Fix imageUrl
      if (event.imageUrl) {
        for (const pattern of LOCALHOST_PATTERNS) {
          if (event.imageUrl.includes(pattern)) {
            updates.imageUrl = event.imageUrl.replace(pattern, PRODUCTION_BASE);
            updated = true;
            console.log(`Fixed imageUrl: ${event.imageUrl} -> ${updates.imageUrl}`);
            break;
          }
        }
      }
      
      // Fix proofDocumentUrl
      if (event.proofDocumentUrl) {
        for (const pattern of LOCALHOST_PATTERNS) {
          if (event.proofDocumentUrl.includes(pattern)) {
            updates.proofDocumentUrl = event.proofDocumentUrl.replace(pattern, PRODUCTION_BASE);
            updated = true;
            console.log(`Fixed proofDocumentUrl: ${event.proofDocumentUrl} -> ${updates.proofDocumentUrl}`);
            break;
          }
        }
      }
      
      if (updated) {
        await Event.update(event.eventId, {
          imageUrl: updates.imageUrl,
          proofDocumentUrl: updates.proofDocumentUrl
        });
        eventCount++;
        console.log(`✓ Updated event: ${event.eventName} (${event.eventId})\n`);
      }
    }
    
    console.log(`Total events updated: ${eventCount}\n`);
    
    // Fix Danweem
    console.log('=== Fixing Danweem URLs ===');
    const danweemList = await Danweem.getAll();
    let danweemCount = 0;
    
    for (const danweem of danweemList) {
      let updated = false;
      const updates = { ...danweem };
      
      // Fix mediaUrl
      if (danweem.mediaUrl) {
        for (const pattern of LOCALHOST_PATTERNS) {
          if (danweem.mediaUrl.includes(pattern)) {
            updates.mediaUrl = danweem.mediaUrl.replace(pattern, PRODUCTION_BASE);
            updated = true;
            console.log(`Fixed mediaUrl: ${danweem.mediaUrl} -> ${updates.mediaUrl}`);
            break;
          }
        }
      }
      
      // Fix thumbnailUrl
      if (danweem.thumbnailUrl) {
        for (const pattern of LOCALHOST_PATTERNS) {
          if (danweem.thumbnailUrl.includes(pattern)) {
            updates.thumbnailUrl = danweem.thumbnailUrl.replace(pattern, PRODUCTION_BASE);
            updated = true;
            console.log(`Fixed thumbnailUrl: ${danweem.thumbnailUrl} -> ${updates.thumbnailUrl}`);
            break;
          }
        }
      }
      
      // Fix proofDocumentUrl
      if (danweem.proofDocumentUrl) {
        for (const pattern of LOCALHOST_PATTERNS) {
          if (danweem.proofDocumentUrl.includes(pattern)) {
            updates.proofDocumentUrl = danweem.proofDocumentUrl.replace(pattern, PRODUCTION_BASE);
            updated = true;
            console.log(`Fixed proofDocumentUrl: ${danweem.proofDocumentUrl} -> ${updates.proofDocumentUrl}`);
            break;
          }
        }
      }
      
      if (updated) {
        await Danweem.update(danweem.danweemId, {
          mediaUrl: updates.mediaUrl,
          thumbnailUrl: updates.thumbnailUrl,
          proofDocumentUrl: updates.proofDocumentUrl
        });
        danweemCount++;
        console.log(`✓ Updated danweem: ${danweem.title} (${danweem.danweemId})\n`);
      }
    }
    
    console.log(`Total danweem updated: ${danweemCount}\n`);
    console.log('✅ URL fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing URLs:', error);
    console.error(error.stack);
  }
  
  process.exit(0);
}

// Run the fix
if (require.main === module) {
  fixProductionUrls();
}

module.exports = { fixProductionUrls };
