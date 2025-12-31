import { WebSocketServer } from 'ws';
import { handleConnection } from './connectionManager';
import http from 'http';
import { getPort } from '../config';
import logger from '../utils/logger';

export const initServer = (
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>,
) => {
  const port = getPort();
  const wss = new WebSocketServer({
    server,
    clientTracking: false, // Disable client tracking for better performance
    perMessageDeflate: false, // Disable compression to reduce overhead
    maxPayload: 100 * 1024 * 1024, // 100MB max payload
  });

  wss.on('connection', handleConnection);

  logger.info(`WebSocket server started on port ${port}`);
};
