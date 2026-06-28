const fs = require('fs');

const content = fs.readFileSync('menu-data.js', 'utf8');

const idRegex = /id:\s*['"]([^'"]+)['"]/g;
let match;
const ids = {};
const duplicates = [];

while ((match = idRegex.exec(content)) !== null) {
  const id = match[1];
  if (ids[id]) {
    duplicates.push(id);
  }
  ids[id] = true;
}

console.log('Duplicates found:', duplicates);
