import fs from 'fs';
import path from 'path';

const frontendDir = 'c:/Users/pablo/OneDrive/Escritorio/APP-VENTAS - copia/frontend';

function replaceInFile(relativePath, replacements) {
    const fullPath = path.join(frontendDir, relativePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    for (const [from, to] of replacements) {
        // Use global replacements where necessary, or direct strings
        if (from instanceof RegExp) {
             content = content.replace(from, to);
        } else {
             content = content.split(from).join(to);
        }
    }
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Fixed', relativePath);
}

// 1. In globals.css, make all inputs 100% width by default when inside form-group
let globalsCssPath = path.join(frontendDir, 'css/globals.css');
let globalsCss = fs.readFileSync(globalsCssPath, 'utf8');
if (!globalsCss.includes('width: 100%; /* Default 100% for flex cols */')) {
    globalsCss = globalsCss.replace('.app-input {\n  background: #222;', '.app-input {\n  background: #222;\n  width: 100%; /* Default 100% for flex cols */');
    
    // Make sure app-form-group flexes
    globalsCss = globalsCss.replace('.app-form-group {\n  margin-bottom: 1rem;\n}', '.app-form-group {\n  margin-bottom: 1rem;\n  flex: 1;\n}');

    // Fix button alignment 
    globalsCss = globalsCss.replace('.app-btn-guardar {\n  margin-top: 1rem;\n  width: 100%;\n}', '.app-btn-guardar {\n  margin-top: 1rem;\n  width: auto;\n  align-self: flex-start;\n}');

    // Fix historial button color
    globalsCss += `\n/* Historial button fix */\n.app-btn-historial {\n  background: #3498db;\n  color: #fff;\n  padding: 6px 10px;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 13px;\n}\n.app-btn-historial:hover {\n  background: #2980b9;\n}\n`;

    // ensure modal-sm is removed entirely from all items, we'll use app-modal-md which is 750px
    fs.writeFileSync(globalsCssPath, globalsCss, 'utf8');
    console.log('Fixed css/globals.css (added width 100% and fixed historial)');
}

// 2. Fix Prod y Gastos HTML
// Gastos
replaceInFile('pages/gastos.html', [
    ['app-modal-sm', 'app-modal-md'],
    ['<form class="app-form-venta">', '<form class="app-form-venta">\n          <div class="app-form-row">'],
    ['<div class="app-form-group">\r\n            <label for="tipoGasto">Tipo</label>', '</div>\n          <div class="app-form-row">\n            <div class="app-form-group">\r\n            <label for="tipoGasto">Tipo</label>'],
    ['<div class="app-form-group">\n            <label for="tipoGasto">Tipo</label>', '</div>\n          <div class="app-form-row">\n            <div class="app-form-group">\n            <label for="tipoGasto">Tipo</label>'],
    ['</form>', '</div>\n        </form>'],
    ['class="app-btn-primary app-btn-full"', 'class="app-btn-primary app-btn-guardar"']
]);

// Productos
replaceInFile('pages/productos.html', [
    ['app-modal-sm', 'app-modal-md'],
    ['<form id="formProducto" class="app-form-venta">', '<form id="formProducto" class="app-form-venta">\n          <div class="app-form-row">'],
    ['<div class="app-form-group">\r\n            <label>Stock inicial</label>', '</div>\n          <div class="app-form-row">\n            <div class="app-form-group">\r\n            <label>Stock inicial</label>'],
    ['<div class="app-form-group">\n            <label>Stock inicial</label>', '</div>\n          <div class="app-form-row">\n            <div class="app-form-group">\n            <label>Stock inicial</label>'],
    ['          <button type="submit" id="btnGuardarProducto" class="app-btn-primary">\r\n            Guardar\r\n          </button>\r\n        </form>', '</div>\n          <button type="submit" id="btnGuardarProducto" class="app-btn-primary app-btn-guardar">\r\n            Guardar\r\n          </button>\r\n        </form>'],
    ['          <button type="submit" id="btnGuardarProducto" class="app-btn-primary">\n            Guardar\n          </button>\n        </form>', '</div>\n          <button type="submit" id="btnGuardarProducto" class="app-btn-primary app-btn-guardar">\n            Guardar\n          </button>\n        </form>']
]);

// Clientes
replaceInFile('pages/clientes.html', [
    ['<button type="submit" class="app-btn-primary">Guardar cliente</button>', '<button type="submit" class="app-btn-primary app-btn-guardar">Guardar cliente</button>']
]);
