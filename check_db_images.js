const fs = require('fs');
const path = require('path');

const url = "https://eamcsvhegmgbqhcbubcn.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhbWNzdmhlZ21nYnFoY2J1YmNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MTU0NzcsImV4cCI6MjA5Nzk5MTQ3N30.e55khEAu23nPoEEtrv5b3raNwvk40infB_rtd4ufyOA";

async function run() {
  try {
    // Fetch dishes
    const response = await fetch(`${url}/rest/v1/dishes?select=id,name,image`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch dishes: ${response.statusText}`);
    }
    const dishes = await response.json();
    console.log(`Fetched ${dishes.length} dishes from database.`);

    // Fetch excellence items
    const responseExc = await fetch(`${url}/rest/v1/excellence_items?select=id,name,image`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    const excellence = responseExc.ok ? await responseExc.json() : [];
    console.log(`Fetched ${excellence.length} excellence items from database.`);

    const dbImages = new Set();
    const addImage = (img) => {
      if (!img) return;
      // Extract file name if it starts with 'images/' or is just local path
      let match = img.match(/(?:.\/)?images\/([^'"?#]+)/);
      if (match) {
        dbImages.add(match[1]);
      } else {
        // If it's a URL but has a filename we might care about, or if it's just a filename
        const filename = img.split('/').pop().split('?')[0];
        dbImages.add(filename);
        dbImages.add(img); // also keep the full string
      }
    };

    dishes.forEach(d => addImage(d.image));
    excellence.forEach(e => addImage(e.image));

    console.log(`Unique image references in DB: ${dbImages.size}`);
    
    // Check files in local images directory
    const imagesDir = path.join(__dirname, 'images');
    console.log(`Images directory: ${imagesDir}`);
    if (fs.existsSync(imagesDir)) {
      const files = fs.readdirSync(imagesDir);
      let referenced = 0;
      let unreferenced = 0;
      const unreferencedFiles = [];

      files.forEach(file => {
        const filePath = path.join(imagesDir, file);
        if (fs.statSync(filePath).isFile()) {
          // Check if file is in db references
          let isUsed = false;
          for (const ref of dbImages) {
            if (ref === file || ref.endsWith('/' + file) || ref.includes(file)) {
              isUsed = true;
              break;
            }
          }
          if (isUsed || ['logo.png', 'hero-bg.png', 'logo.pwa.jpeg', 'default-dish.jpg'].includes(file)) {
            referenced++;
          } else {
            unreferenced++;
            unreferencedFiles.push(file);
          }
        }
      });

      console.log(`Local files summary:`);
      console.log(`- Referenced or system files: ${referenced}`);
      console.log(`- Unreferenced files: ${unreferenced}`);
      if (unreferenced > 0) {
        console.log(`Example unreferenced files (first 10):`, unreferencedFiles.slice(0, 10));
      }
    } else {
      console.log('Local images directory not found.');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
