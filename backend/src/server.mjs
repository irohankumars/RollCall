import http from 'node:http';
import { loadConfig } from './config.mjs';
import { createDatabase } from './database.mjs';
import { createHttpApp } from './http-app.mjs';

const config = loadConfig(); const db = createDatabase(config.databasePath); const server = http.createServer(createHttpApp({ db, config }));
const port = Number(process.env.PORT) || 4000;
server.listen(port, '0.0.0.0', () => console.log(`RollCall API listening on 0.0.0.0:${port}`));
function shutdown() { server.close(() => { db.close(); process.exit(0); }); }
process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
