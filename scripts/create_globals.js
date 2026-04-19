import fs from 'fs';
import path from 'path';

const frontendDir = 'c:/Users/pablo/OneDrive/Escritorio/APP-VENTAS - copia/frontend';
const cssDir = path.join(frontendDir, 'css');

// 1. Read ventas.css and transform it to globals.css
let ventasCss = fs.readFileSync(path.join(cssDir, 'ventas.css'), 'utf8');

const prefixes = ['v-', 'c-', 'p-', 'g-', 'r-'];
const components = [
  'navbar', 'navbar-logo', 'navbar-menu', 'active', 'navbar-refresh',
  'container', 'title', 'subtitle', 'controls', 'input', 'input-small',
  'btn-primary', 'btn-secondary', 'btn-guardar', 'btn-edit', 'btn-delete', 'btn-historial', 'btn-action', 'btn-full',
  'tabla-container', 'tabla', 'lista-clientes', 'modal', 'modal-content', 'close',
  'form', 'form-venta', 'form-gasto', 'form-row', 'form-group', 'col',
  'carrito-add', 'carrito-container', 'resumen', 'total-final',
  'modal-ticket', 'ticket-body', 'ticket-tabla-container', 'ticket-total',
  'modal-productos', 'modal-excel', 'info-excel', 'ventas-gastos', 'top-productos',
  'categorias', 'metodos-pago', 'top-clientes', 'etario-genero', 'localidad', 'gastos',
  'close-historial', 'close-detalle', 'close-cc', 'close-ver'
];

for (const comp of components) {
  // ventas uses v- prefix
  const regex = new RegExp(`\\.v-${comp}\\b`, 'g');
  ventasCss = ventasCss.replace(regex, `.app-${comp}`);
}

fs.writeFileSync(path.join(cssDir, 'globals.css'), ventasCss, 'utf8');
console.log('Created globals.css');

// 2. Add <link rel="stylesheet" href="../css/globals.css" /> to all pages
const pagesDir = path.join(frontendDir, 'pages');
const pages = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

for (const page of pages) {
    const fullPath = path.join(pagesDir, page);
    let html = fs.readFileSync(fullPath, 'utf8');
    
    // Check if globals.css is already linked
    if (!html.includes('globals.css')) {
        // Insert after normalize.css
        html = html.replace('<link rel="stylesheet" href="../css/normalize.css" />', '<link rel="stylesheet" href="../css/normalize.css" />\n    <link rel="stylesheet" href="../css/globals.css" />');
        fs.writeFileSync(fullPath, html, 'utf8');
        console.log(`Linked globals.css in ${page}`);
    }
}

// 3. For index.html
let indexHtml = fs.readFileSync(path.join(frontendDir, 'index.html'), 'utf8');
if (!indexHtml.includes('globals.css')) {
    indexHtml = indexHtml.replace('<link rel="stylesheet" href="css/normalize.css" />', '<link rel="stylesheet" href="css/normalize.css" />\n    <link rel="stylesheet" href="css/globals.css" />');
    fs.writeFileSync(path.join(frontendDir, 'index.html'), indexHtml, 'utf8');
    console.log(`Linked globals.css in index.html`);
}

