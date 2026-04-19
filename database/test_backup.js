import { exec } from "child_process";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: "./backend/.env" });

const user = process.env.PGUSER || "postgres";
const password = process.env.PGPASSWORD || "";
const db = process.env.PGDATABASE || "ventas_db";
const host = process.env.PGHOST || "127.0.0.1";
const port = process.env.PGPORT || "5432";

const env = { ...process.env, PGPASSWORD: password };
const pgDumpPath = "C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe";
const backupFile = "test_backup.backup";

const command = `"${pgDumpPath}" -U ${user} -h ${host} -p ${port} -F c -f "${backupFile}" ${db}`;
// Wrap entire command in quotes for Windows cmd.exe issue
const safeCommand = `"${command}"`;
console.log("Original Command:", command);
console.log("Safe Command:", safeCommand);

exec(safeCommand, { env }, (error, stdout, stderr) => {
    if (error) {
        console.error("Error code:", error.code);
        console.error("Error cmd:", error.cmd);
        console.error("Error message:", error.message);
        return;
    }
    if (stderr) {
        console.error("stderr:", stderr);
    }
    console.log(`Copia de seguridad exitosa en: ${backupFile}`);
});
