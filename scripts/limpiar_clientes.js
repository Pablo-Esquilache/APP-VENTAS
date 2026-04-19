const fs = require('fs');
const ruta = 'frontend/js/clientes.js';
let contenido = fs.readFileSync(ruta, 'utf-8');

// Reemplazar la barra invertida escapada \${ por ${
contenido = contenido.replace(/\\\$\\{/g, '${');

// Reparar las comillas de templates invertidas \`
contenido = contenido.replace(/\\`/g, '`');

fs.writeFileSync(ruta, contenido);
console.log('Archivo limpiado correctamente');
