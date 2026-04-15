import bcrypt from 'bcrypt';

const args = process.argv.slice(2);
const usuario = args[0];
const password = args[1];

if (!usuario || !password) {
  console.log("\n❌ ERROR: Faltan datos.");
  console.log("👉 Uso correcto: node generar_pass.js <USUARIO> <CONTRASEÑA>");
  console.log("👉 Ejemplo:      node generar_pass.js pipicucu 34547144\n");
  process.exit(1);
}

const saltRounds = 10;
const hash = bcrypt.hashSync(password, saltRounds);

console.log("\n✅ LISTO. Copiá y pegá la siguiente línea de SQL en tu DBeaver o en schema.sql:");
console.log("========================================================================================\n");
console.log(`INSERT INTO public.usuarios (usuario, password, role, comercio_id) VALUES ('${usuario}', '${hash}', 'admin', 1) ON CONFLICT (usuario) DO NOTHING;`);
console.log("\n========================================================================================\n");
