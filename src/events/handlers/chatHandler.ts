import { ChatEvents } from '@/features/chat/constants/events.ts';
import { Message } from '@/features/chat/types/index.ts';
import { Socket } from 'socket.io';

export default class ChatHandler {

  public handleConnection(socket: Socket): void {
    // when user send message
    socket.on(ChatEvents.client.SEND_MESSAGE, async (message: Message) => this.sendMessageHandler(socket, message));
  }

  /**
   * @description this function handle all logic of join room event
   * @param socket 
   * @param message
   * @returns Promise<void>
   */
  private async sendMessageHandler(socket: Socket, message: Message) {
    const roomID = socket.data["roomID"];
    socket.to(roomID).emit(ChatEvents.server.RECEIVE_MESSAGE, message);
    socket.emit(ChatEvents.server.RECEIVE_MESSAGE, message);
  }
}