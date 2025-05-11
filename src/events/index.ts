import { Server } from 'socket.io';
import SocketManager from './socketManager.ts';

export default function initializeSocketIO(ioServer: Server): SocketManager {
  return new SocketManager(ioServer);
}