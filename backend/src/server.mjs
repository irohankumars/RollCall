import http from 'node:http';
import { loadConfig } from './config.mjs';
import { createDatabase } from './database.mjs';
import { createHttpApp } from './http-app.mjs';

const config = loadConfig(); const db = createDatabase(config.databasePath); const server = http.createServer(createHttpApp({ db, config }));
server.listen(config.port, '127.0.0.1', () => console.log(`RollCall authentication API listening on http://127.0.0.1:${config.port}`));
function shutdown() { server.close(() => { db.close(); process.exit(0); }); }
process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
