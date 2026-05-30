import express from 'express';
import { MemberManager } from './manager';
import Secrets from '@repo/secrets/backend';

const app = express();

// Render (and most hosts) inject a single PORT to bind to. Fall back to the
// local HTTP_PORT for development.
const PORT = Number(process.env.PORT) || Number(Secrets.HTTP_PORT) || 4000;

app.get('/health', (req, res) => {
  res.status(200).json({
    message: 'working',
  });
});

// HTTP and WebSocket share the same server/port.
const server = app.listen(PORT, () => {
  console.log(`HTTP + WS server running on port ${PORT}`);
});

const manager = MemberManager.getInstance();
manager.init(server);
