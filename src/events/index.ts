import { Server } from 'socket.io';
import SocketManager from './socketManager.ts';

export default function initializeSocketIO(io: Server): SocketManager {
  return new SocketManager(io);
}