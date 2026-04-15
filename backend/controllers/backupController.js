import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { app as electronApp } from "electron";

// Calculamos la ruta segura basada en si estamos empaquetados o no
export const getBackupDirectory = () => {
    let baseDir = process.cwd();
    if (electronApp?.isPackaged || process.env.NODE_ENV === "production") {
        baseDir = path.dirname(process.execPath);
    }
    const backupDir = path.join(baseDir, "backups");
    
    // Crear el directorio si no existe
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    return backupDir;
};

export const createBackup = (req, res, callback) => {
    try {
        const backupDir = getBackupDirectory();
        // Generar siempre el mismo nombre para sobrescribir
        const backupFile = path.join(backupDir, "backup_ventas.backup");

        const user = process.env.PGUSER || "app_ventas";
        const password = process.env.PGPASSWORD || "123456";
        const db = process.env.PGDATABASE || "postgres";
        const host = process.env.PGHOST || "127.0.0.1";
        const port = process.env.PGPORT || "5432";

        // Establecer PGPASSWORD de forma segura en las variables de entorno de la ejecución
        const env = { ...process.env, PGPASSWORD: password };
        
        // Función inteligente y robusta para buscar pg_dump en Windows
        let pgDumpPath = "pg_dump"; // Fallback para sistemas donde ya está configurado
        
        const findPgDump = (dir) => {
            if (!fs.existsSync(dir)) return null;
            let files = [];
            try { files = fs.readdirSync(dir); } catch(e) { return null; }
            
            for (const file of files) {
                const fullPath = path.join(dir, file);
                try {
                    const stat = fs.statSync(fullPath);
                    if (stat.isDirectory()) {
                        const res = findPgDump(fullPath);
                        if (res) return res;
                    } else if (file.toLowerCase() === "pg_dump.exe") {
                        return fullPath;
                    }
                } catch(e) { continue; }
            }
            return null;
        };

        const potentialBaseDirs = [
            "C:\\Program Files\\PostgreSQL",
            "C:\\Program Files (x86)\\PostgreSQL",
            "D:\\Archivos de Programa\\PostgreSQL",
            "D:\\Program Files\\PostgreSQL"
        ];

        for (const baseDir of potentialBaseDirs) {
            const found = findPgDump(baseDir);
            if (found) {
                pgDumpPath = `"${found}"`;
                break;
            }
        }
        
        // El formato 'c' (custom) de pg_dump está comprimido internamente
        const command = `${pgDumpPath} --no-password -U ${user} -h ${host} -p ${port} -F c -f "${backupFile}" ${db}`;

        console.log("Iniciando copia de seguridad...");
        
        exec(command, { env }, (error, stdout, stderr) => {
            if (error) {
                console.error("Error ejecutando pg_dump:", error);
                
                // Responder si es una llamada HTTP (botón manual)
                if (res) return res.status(500).json({ ok: false, error: "Error interno al generar backup." });
                // Callback si es llamada de fondo (automática)
                if (callback) return callback(error);
                return;
            }
            
            console.log(`Copia de seguridad exitosa en: ${backupFile}`);
            
            if (res) {
                return res.json({ ok: true, message: "Copia de seguridad generada con éxito.", path: backupFile });
            }
            if (callback) {
                return callback(null, backupFile);
            }
        });

    } catch (err) {
        console.error("Error en createBackup:", err);
        if (res) return res.status(500).json({ ok: false, error: err.message });
        if (callback) return callback(err);
    }
};
