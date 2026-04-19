import fs from 'fs';
import path from 'path';

const frontendDir = 'c:/Users/pablo/OneDrive/Escritorio/APP-VENTAS - copia/frontend';

function replaceInFile(relativePath, replacements) {
    const fullPath = path.join(frontendDir, relativePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    for (const [from, to] of replacements) {
        content = content.replace(from, to);
    }
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Fixed', relativePath);
}

// 1. Fix JS querySelectors
replaceInFile('js/productos.js', [
    ['.app-form-producto', '.app-form-venta']
]);

replaceInFile('js/gastos.js', [
    ['.app-form-gasto', '.app-form-venta']
]);

// 2. Add escapeQuote to clientes.js
let clientesJsPath = path.join(frontendDir, 'js/clientes.js');
let clientesJs = fs.readFileSync(clientesJsPath, 'utf8');
if (!clientesJs.includes('function escapeQuote')) {
    clientesJs += `\n\nfunction escapeQuote(str) {\n  if (!str) return "";\n  return str.replace(/'/g, "\\\\'");\n}\n`;
    fs.writeFileSync(clientesJsPath, clientesJs, 'utf8');
    console.log('Fixed js/clientes.js (escapeQuote)');
}

// 3. Add app-modal-sm and app-modal-md info to globals.css
let globalsCssPath = path.join(frontendDir, 'css/globals.css');
let globalsCss = fs.readFileSync(globalsCssPath, 'utf8');
if (!globalsCss.includes('app-modal-sm')) {
    globalsCss += `\n
/* MODALES SECUNDARIOS */
.app-modal-sm {
  width: 450px !important;
  max-width: 95% !important;
  height: auto !important;
  min-height: auto !important;
  overflow: visible !important;
}

.app-modal-md {
  width: 750px !important;
  max-width: 95% !important;
  height: auto !important;
  min-height: auto !important;
  overflow: visible !important;
}
`;
    fs.writeFileSync(globalsCssPath, globalsCss, 'utf8');
    console.log('Fixed css/globals.css (added app-modal sizes)');
}

// 4. Fix HTML modal classes
replaceInFile('pages/productos.html', [
    ['<div id="modalProducto" class="app-modal">\r\n      <div class="app-modal-content">', '<div id="modalProducto" class="app-modal">\r\n      <div class="app-modal-content app-modal-sm">'],
    ['<div id="modalProducto" class="app-modal">\n      <div class="app-modal-content">', '<div id="modalProducto" class="app-modal">\n      <div class="app-modal-content app-modal-sm">']
]);

replaceInFile('pages/gastos.html', [
    ['<div id="modalGasto" class="app-modal">\r\n      <div class="app-modal-content">', '<div id="modalGasto" class="app-modal">\r\n      <div class="app-modal-content app-modal-sm">'],
    ['<div id="modalGasto" class="app-modal">\n      <div class="app-modal-content">', '<div id="modalGasto" class="app-modal">\n      <div class="app-modal-content app-modal-sm">']
]);

// For clientes, use app-modal-md for the main form and cc, app-modal-sm maybe not needed.
// actually let's just make sure we replace the first modal
let clientesHtmlPath = path.join(frontendDir, 'pages/clientes.html');
let clientesHtml = fs.readFileSync(clientesHtmlPath, 'utf8');
clientesHtml = clientesHtml.replace('<div id="app-modal" class="app-modal">\r\n      <div class="app-modal-content">', '<div id="app-modal" class="app-modal">\r\n      <div class="app-modal-content app-modal-md">');
clientesHtml = clientesHtml.replace('<div id="app-modal" class="app-modal">\n      <div class="app-modal-content">', '<div id="app-modal" class="app-modal">\n      <div class="app-modal-content app-modal-md">');

clientesHtml = clientesHtml.replace('<div id="app-modal-cc" class="app-modal">\r\n      <div class="app-modal-content">', '<div id="app-modal-cc" class="app-modal">\r\n      <div class="app-modal-content app-modal-sm">');
clientesHtml = clientesHtml.replace('<div id="app-modal-cc" class="app-modal">\n      <div class="app-modal-content">', '<div id="app-modal-cc" class="app-modal">\n      <div class="app-modal-content app-modal-sm">');

fs.writeFileSync(clientesHtmlPath, clientesHtml, 'utf8');
console.log('Fixed pages/clientes.html (app-modal sizes)');

