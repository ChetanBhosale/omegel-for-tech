import express from 'express';
import { MemberManager } from './manager';
import Secrets from '@repo/secrets';

const app = express();
const HTTP_PORT = Secrets.HTTP_PORT;
const WS_PORT = Number(Secrets.WS_PORT) || 4001;

console.log({Secrets})

app.listen(HTTP_PORT, () => {
  console.log(`HTTP server running on http://localhost:${HTTP_PORT}`);
});

const manager = MemberManager.getInstance();
manager.init(WS_PORT);
