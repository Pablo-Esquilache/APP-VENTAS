import fs from "fs";
import path from "path";
import { getBackupDirectory, createBackup } from "../controllers/backupController.js";

// Tiempo en milisegundos para 15 días
const DAYS_15_IN_MS = 15 * 24 * 60 * 60 * 1000;

export const initBackupCron = () => {
    try {
        const backupDir = getBackupDirectory();
        const backupFile = path.join(backupDir, "backup_ventas.backup");

        // Verificamos si existe el archivo
        if (!fs.existsSync(backupFile)) {
            console.log("No se encontró backup previo. Creando el primer backup automático...");
            return createBackup(null, null, (err, file) => {
                if (err) console.error("Error en el backup inicial automático");
            });
        }

        // Si existe, verificamos la edad del archivo
        const stats = fs.statSync(backupFile);
        const fileAge = Date.now() - stats.mtime.getTime();

        if (fileAge > DAYS_15_IN_MS) {
            console.log(`El backup automático tiene más de 15 días. Actualizando copia...`);
            createBackup(null, null, (err, file) => {
                 if (err) console.error("Error intentando actualizar el backup automático");
            });
        } else {
            const daysLeft = Math.ceil((DAYS_15_IN_MS - fileAge) / (1000 * 60 * 60 * 24));
            console.log(`Backup todavía vigente. Próximo backup automático en aprox ${daysLeft} días.`);
        }
    } catch (err) {
        console.error("Error inicializando backupService:", err);
    }
};
