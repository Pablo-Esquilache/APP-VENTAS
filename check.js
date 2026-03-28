import fs from 'fs';

process.on('uncaughtException', (e) => {
  fs.writeFileSync('error_log.txt', String(e.stack || e.message || e));
  process.exit(0);
});

(async () => {
  try {
    await import('./backend/app.js');
    console.log("App loaded successfully");
    process.exit(0); // Exit so it doesn't hang if it succeeds
  } catch (e) {
    fs.writeFileSync('error_log.txt', String(e.stack || e.message || e));
    process.exit(0);
  }
})();
