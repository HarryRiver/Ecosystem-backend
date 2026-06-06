import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*', // Trong production nên config lại
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Lưu trữ map userId -> Socket ID theo nhu cầu (nếu muốn gửi 1-1)
  private userSockets: Map<number, string[]> = new Map();

  handleConnection(client: Socket) {
    // Client có thể gửi userId lên khi connect (ví dụ query: { userId: 123 })
    const userId = client.handshake.query.userId;
    if (userId) {
      const uid = Number(userId);
      const sockets = this.userSockets.get(uid) || [];
      sockets.push(client.id);
      this.userSockets.set(uid, sockets);
    }
    console.log(`Client connected to notifications: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId;
    if (userId) {
      const uid = Number(userId);
      const sockets = this.userSockets.get(uid) || [];
      const updatedSockets = sockets.filter((id) => id !== client.id);
      if (updatedSockets.length === 0) {
        this.userSockets.delete(uid);
      } else {
        this.userSockets.set(uid, updatedSockets);
      }
    }
  }

  // Phát thông báo chung (Broadcast)
  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Phát thông báo cá nhân (to User)
  emitToUser(userId: number, event: string, data: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets && sockets.length > 0) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit(event, data);
      });
    }
  }
}
