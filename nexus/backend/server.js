require('dotenv').config();
// at the top, after requires
const fs = require('fs');
const logStream = fs.createWriteStream('server.log', { flags: 'a' });

// replace console.log/error with:
const origLog = console.log;
const origErr = console.error;
console.log = (...a) => { origLog(...a); logStream.write(`[${new Date().toISOString()}] ${a.join(' ')}\n`); };
console.error = (...a) => { origErr(...a); logStream.write(`[${new Date().toISOString()}] ERROR ${a.join(' ')}\n`); };
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/error.middleware');
const initSockets = require('./sockets');

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.get('/health', (_, res) => res.json({ ok: true, service: 'nova-backend' }));
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

const io = new Server(server, { cors: { origin: '*' } });
initSockets(io);
app.set('io', io);

const PORT = process.env.PORT || 5000;
const startJobs = require('./jobs');

connectDB().then(() => {
  startJobs();
  server.listen(PORT, () => console.log(`🚀 Nova backend on :${PORT}`));
});