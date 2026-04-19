import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pagesDir = path.join(__dirname, '..', 'frontend', 'pages');
if(fs.existsSync(pagesDir)){
    const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

    for (const file of files) {
      const filePath = path.join(pagesDir, file);
      let content = fs.readFileSync(filePath, 'utf-8');
      
      const turneroMatch = content.match(/\s*<li id="tab-turnero">.*?<\/li>/);
      if (!turneroMatch) continue; 
      
      const turneroStr = turneroMatch[0];
      
      // Only fix if it's not already before ajustes (we can just replace all and then inject to be safe)
      if (content.indexOf(turneroStr) > -1) {
          content = content.replace(turneroStr, ''); 
          
          const ajustesRegex = /(\s*)(<li[^>]*><a href="ajustes\.html"[^>]*>Ajustes<\/a><\/li>)/;
          content = content.replace(ajustesRegex, (match, whitespace, element) => {
              return turneroStr + whitespace + element;
          });

          fs.writeFileSync(filePath, content, 'utf-8');
          console.log(`Fixed nav in ${file}`);
      }
    }
}
