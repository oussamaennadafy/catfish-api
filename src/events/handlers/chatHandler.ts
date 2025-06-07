import { ChatEvents } from '@/features/chat/constants/events.ts';
import { Message } from '@/features/chat/types/index.ts';
import { Socket } from 'socket.io';

export default class ChatHandler {
  
  public handleConnection(socket: Socket): void {
    socket.on(ChatEvents.client.SEND_MESSAGE, async (message: Message) => {
      const roomID = socket.data["roomID"];
      socket.to(roomID).emit(ChatEvents.server.RECEIVE_MESSAGE, message);
      socket.emit(ChatEvents.server.RECEIVE_MESSAGE, message);
    });
  }
}