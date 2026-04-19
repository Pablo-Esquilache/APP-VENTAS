import fs from 'fs';
import path from 'path';

const frontendDir = 'c:/Users/pablo/OneDrive/Escritorio/APP-VENTAS - copia/frontend';

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

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.html') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const prefix of prefixes) {
        for (const comp of components) {
          const className = prefix + comp;
          const newClassName = 'app-' + comp;
          
          // Regex to match the class name with word boundaries
          // Handle HTML class="v-navbar" and JS classList.add('v-navbar')
          const regex = new RegExp(`\\b${className}\\b`, 'g');
          if (regex.test(content)) {
             content = content.replace(regex, newClassName);
             changed = true;
          }
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

try {
  processDirectory(path.join(frontendDir, 'pages'));
  processDirectory(path.join(frontendDir, 'js'));
  // Update index.html
  let indexContent = fs.readFileSync(path.join(frontendDir, 'index.html'), 'utf8');
  let indexChanged = false;
  for (const prefix of prefixes) {
    for (const comp of components) {
        const regex = new RegExp(`\\b${prefix + comp}\\b`, 'g');
        if (regex.test(indexContent)) {
             indexContent = indexContent.replace(regex, 'app-' + comp);
             indexChanged = true;
        }
    }
  }
  if (indexChanged) {
      fs.writeFileSync(path.join(frontendDir, 'index.html'), indexContent, 'utf8');
  }

  console.log("Renamed classes successfully!");
} catch (e) {
  console.error("Error updating files:", e);
}
