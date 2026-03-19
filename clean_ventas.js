const fs = require('fs');

const globalsCss = fs.readFileSync('frontend/css/globals.css', 'utf8');
const ventasCss = fs.readFileSync('frontend/css/ventas.css', 'utf8');

// Function to extract blocks
function extractBlocks(css) {
  const overrides = {};
  // Very simplistic parser
  const regex = /([^{]+)\{([^}]+)\}/g;
  let match;
  while ((match = regex.exec(css)) !== null) {
    const sel = match[1].trim();
    const content = match[2].trim().replace(/\s+/g, ' '); // normalize whitespace
    overrides[sel] = content;
  }
  return overrides;
}

const globalBlocks = extractBlocks(globalsCss);
const ventasBlocks = extractBlocks(ventasCss);

let newVentasCss = ventasCss;

// Match blocks in ventas and globals
let cleanedCSS = '';

// Actually, rewriting based on the blocks is safer.
const ventasRegex = /([^{]+)\{([^}]+)\}/g;
let newCss = ventasCss;

let matches;
const toRemove = [];

while ((matches = ventasRegex.exec(ventasCss)) !== null) {
  const originalSel = matches[1].trim();
  const rawContent = matches[2];
  const normalizedContent = rawContent.trim().replace(/\s+/g, ' ');
  
  // Transform v- to app- for comparison
  const globalSel = originalSel.replace(/\.v-/g, '.app-');
  
  // Only remove if it exactly matches the global block
  if (globalBlocks[globalSel] && globalBlocks[globalSel] === normalizedContent) {
    // Exactly matches, mark for removal
    const fullMatch = matches[0];
    toRemove.push(fullMatch);
  }
}

for (const rem of toRemove) {
  newCss = newCss.replace(rem, `/* removed duplicate: ${rem.substring(0, 30)}... */`);
}

// remove multiple empty lines left over
newCss = newCss.replace(/\/\* removed duplicate[^*]+\*\//g, '');
newCss = newCss.replace(/\n\s*\n/g, '\n\n');

// Finally replace all .v- with .app- in the remaining CSS
newCss = newCss.replace(/\.v-/g, '.app-');
fs.writeFileSync('frontend/css/ventas.css', newCss);

console.log("ventas.css updated!");

// Update ventas.html
let html = fs.readFileSync('frontend/pages/ventas.html', 'utf8');
// Replace class="v-... " with class="app-... "
html = html.replace(/class="([^"]*)\bv-([^"]*)"/g, (match, p1, p2) => {
  return `class="${p1}app-${p2}"`.replace(/\bv-/g, 'app-');
});
// also generic v- to app- in ids or logic if needed, but primarily classes.
html = html.replace(/"v-/g, '"app-');

fs.writeFileSync('frontend/pages/ventas.html', html);
console.log("ventas.html updated!");
