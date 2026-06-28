const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'supabase-config.js');
const imagesDir = path.join(__dirname, 'images');

// 1. Get Supabase Credentials
let url, anonKey;
try {
  if (!fs.existsSync(configPath)) {
    console.error('❌ Error: supabase-config.js not found!');
    process.exit(1);
  }
  const content = fs.readFileSync(configPath, 'utf8');
  const urlMatch = content.match(/url:\s*['"]([^'"]+)['"]/);
  const anonMatch = content.match(/anonKey:\s*['"]([^'"]+)['"]/);

  if (!urlMatch || !anonMatch) {
    console.error('❌ Error: Could not parse Supabase URL or Anon Key from supabase-config.js');
    process.exit(1);
  }
  url = urlMatch[1];
  anonKey = anonMatch[1];
} catch (err) {
  console.error('❌ Error reading config:', err.message);
  process.exit(1);
}

console.log('📡 Connecting to Supabase database...');

async function run() {
  try {
    // 2. Fetch dishes from DB
    const dishesRes = await fetch(`${url}/rest/v1/dishes?select=image`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    if (!dishesRes.ok) {
      throw new Error(`Failed to fetch dishes: ${dishesRes.statusText}`);
    }
    const dishes = await dishesRes.json();

    // 3. Fetch excellence items from DB
    const excellenceRes = await fetch(`${url}/rest/v1/excellence_items?select=image`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    const excellence = excellenceRes.ok ? await excellenceRes.json() : [];

    // 4. Collect used images
    const usedImages = new Set();
    const addImageRef = (img) => {
      if (!img) return;
      // Extract filename if it references images/ or just a filename
      const cleanImg = img.replace(/\\/g, '/');
      const match = cleanImg.match(/(?:.\/)?images\/([^'"?#\s]+)/i);
      if (match) {
        usedImages.add(path.basename(match[1]).toLowerCase());
      } else {
        usedImages.add(path.basename(cleanImg.split('?')[0]).toLowerCase());
      }
    };

    dishes.forEach(d => addImageRef(d.image));
    excellence.forEach(e => addImageRef(e.image));

    console.log(`✅ Found ${usedImages.size} unique image references in the database.`);

    // Keep UI & system assets safe
    const systemFiles = new Set([
      'logo.png',
      'hero-bg.png',
      'logo.pwa.jpeg',
      'default-dish.jpg'
    ]);

    // 5. Scan local directory and cleanup
    if (fs.existsSync(imagesDir)) {
      const files = fs.readdirSync(imagesDir);
      let deletedCount = 0;
      let keptCount = 0;

      files.forEach(file => {
        const filePath = path.join(imagesDir, file);
        if (fs.statSync(filePath).isFile()) {
          const fileLower = file.toLowerCase();
          
          if (systemFiles.has(fileLower) || usedImages.has(fileLower)) {
            keptCount++;
          } else {
            console.log(`🗑️ Deleting unused image: ${file}`);
            fs.unlinkSync(filePath);
            deletedCount++;
          }
        }
      });

      console.log(`\n🎉 Cleanup complete!`);
      console.log(`- Kept: ${keptCount} images`);
      console.log(`- Deleted: ${deletedCount} unused images`);
    } else {
      console.log('❌ Images directory not found.');
    }
  } catch (err) {
    console.error('❌ Error during cleanup:', err.message);
  }
}

run();
