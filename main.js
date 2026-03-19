import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import http from "http";

/* ===== LOG ERRORES GLOBALES ===== */
process.on("uncaughtException", (err) => {
  console.error("ERROR NO CAPTURADO:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("PROMISE RECHAZADA:", err);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Electron iniciado");
console.log("Modo empaquetado:", app.isPackaged);
console.log("__dirname:", __dirname);

let mainWindow;

/* ===== SOLO UNA INSTANCIA ===== */
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log("Otra instancia detectada. Cerrando...");
  app.quit();
}

/* ===== ESPERAR BACKEND (VERSIÓN ROBUSTA) ===== */
async function waitForServer(url, timeout = 15000) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {

      const req = http.get(url, () => {
        console.log("Servidor respondió correctamente");
        resolve(true);
      });

      req.on("error", () => {
        if (Date.now() - start > timeout) {
          reject(new Error("Servidor no respondió a tiempo"));
        } else {
          setTimeout(check, 500);
        }
      });

      req.end();
    };

    check();
  });
}

async function createWindow() {

  console.log("Creando ventana...");

  /* ===== RUTA BACKEND SEGÚN ENTORNO ===== */
  let backendPath;

  if (app.isPackaged) {
    backendPath = path.join(process.resourcesPath, "backend", "app.js");
  } else {
    backendPath = path.join(__dirname, "backend", "app.js");
  }

  console.log("Ruta backend:", backendPath);

  let backendPort = 4000;

  /* ===== INICIAR BACKEND ===== */
  try {
    console.log("Intentando iniciar backend...");
    const backendModule = await import(pathToFileURL(backendPath));
    
    // Obtener la instancia del servidor (que exportamos por default en app.js)
    const server = backendModule.default;
    if (server && server.address()) {
      backendPort = server.address().port;
    }
    console.log("Backend iniciado correctamente en puerto", backendPort);
  } catch (err) {
    console.error("Error iniciando backend:", err);
  }

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  console.log("Ventana creada");

  /* ===== BLOQUEAR NUEVAS VENTANAS ===== */
  mainWindow.webContents.setWindowOpenHandler(() => {
    console.log("Intento de abrir nueva ventana bloqueado");
    return { action: "deny" };
  });

  try {
    console.log(`Esperando servidor en http://localhost:${backendPort}...`);
    await waitForServer(`http://localhost:${backendPort}`);

    console.log("Cargando URL...");
    await mainWindow.loadURL(`http://localhost:${backendPort}`);

    console.log("Frontend cargado");
  } catch (err) {
    console.error("Error cargando frontend:", err);
  }

  mainWindow.on("closed", () => {
    console.log("Ventana cerrada");
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  console.log("Electron listo");
  createWindow();
});

app.on("window-all-closed", () => {
  console.log("Cerrando aplicación");
  if (process.platform !== "darwin") app.quit();
});