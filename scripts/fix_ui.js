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

// 1. index.html
replaceInFile('index.html', [
    ['<body>', '<body class="login-body">'],
    ['class="app-btn-primary app-btn-full"', 'class="app-btn-primary app-btn-guardar"']
]);

// 2. productos.html
replaceInFile('pages/productos.html', [
    ['class="tabla-productos-container"', 'class="app-tabla-container"'],
    ['<table id="tablaProductos">', '<table id="tablaProductos" class="app-tabla">'],
    ['class="app-form-producto"', 'class="app-form-venta"']
]);

// 3. clientes.html
replaceInFile('pages/clientes.html', [
    ['class="app-lista-clientes"', 'class="app-tabla-container"'],
    ['class="app-form"', 'class="app-form-venta"']
]);

// 4. gastos.html
replaceInFile('pages/gastos.html', [
    ['class="app-form-gasto"', 'class="app-form-venta"']
]);

// 5. js files (buttons)
const jsFiles = ['gastos.js', 'productos.js', 'clientes.js'];
jsFiles.forEach(file => {
    replaceInFile('js/' + file, [
        [/app-btn-edit/g, 'btn-editar'],
        [/app-btn-delete/g, 'btn-eliminar']
    ]);
});

// 6. reportes.css (add r-filtros logic)
const repCssPath = path.join(frontendDir, 'css/reportes.css');
let repCss = fs.readFileSync(repCssPath, 'utf8');
if (!repCss.includes('.r-filtros')) {
    repCss += `\n/* FILTROS REINSERTADOS */
.r-filtros {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.r-filtros .app-form-group {
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}`;
    fs.writeFileSync(repCssPath, repCss, 'utf8');
    console.log('Fixed css/reportes.css');
}

// 7. index.js redirect URL issue checking
