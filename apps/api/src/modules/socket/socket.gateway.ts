import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export const SOCKET_EVENTS = {
  CUSTOMER_NEW_ORDER: 'customer:new-order',
  SELLER_ACCEPT_ORDER: 'seller:accept-order',
  SELLER_REJECT_ORDER: 'seller:reject-order',
  SELLER_UPDATE_STATUS: 'seller:update-status',
  SELLER_ASSIGN_DRIVER: 'seller:assign-driver',
  DRIVER_LOCATION: 'driver:location',
  DRIVER_ACCEPT_DELIVERY: 'driver:accept-delivery',
  DRIVER_COMPLETE_DELIVERY: 'driver:complete-delivery',
};

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private onlineUsers = new Map<string, string>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    const role = client.handshake.query.role as string;

    if (userId) {
      this.onlineUsers.set(userId, client.id);
      client.join(`user:${userId}`);
      if (role) {
        client.join(`role:${role}`);
      }
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.onlineUsers.delete(userId);
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.CUSTOMER_NEW_ORDER)
  handleNewOrder(client: Socket, payload: any) {
    this.server.to(`role:seller`).emit(SOCKET_EVENTS.CUSTOMER_NEW_ORDER, payload);
    this.server.to(`role:admin`).emit(SOCKET_EVENTS.CUSTOMER_NEW_ORDER, payload);
  }

  @SubscribeMessage(SOCKET_EVENTS.SELLER_ACCEPT_ORDER)
  handleSellerAcceptOrder(client: Socket, payload: any) {
    this.server.to(`user:${payload.customerId}`).emit(SOCKET_EVENTS.SELLER_ACCEPT_ORDER, payload);
    this.server.to(`role:admin`).emit(SOCKET_EVENTS.SELLER_ACCEPT_ORDER, payload);
  }

  @SubscribeMessage(SOCKET_EVENTS.SELLER_REJECT_ORDER)
  handleSellerRejectOrder(client: Socket, payload: any) {
    this.server.to(`user:${payload.customerId}`).emit(SOCKET_EVENTS.SELLER_REJECT_ORDER, payload);
    this.server.to(`role:admin`).emit(SOCKET_EVENTS.SELLER_REJECT_ORDER, payload);
  }

  @SubscribeMessage(SOCKET_EVENTS.SELLER_UPDATE_STATUS)
  handleSellerUpdateStatus(client: Socket, payload: any) {
    this.server.to(`user:${payload.customerId}`).emit(SOCKET_EVENTS.SELLER_UPDATE_STATUS, payload);
    this.server.to(`role:admin`).emit(SOCKET_EVENTS.SELLER_UPDATE_STATUS, payload);
  }

  @SubscribeMessage(SOCKET_EVENTS.SELLER_ASSIGN_DRIVER)
  handleSellerAssignDriver(client: Socket, payload: any) {
    this.server.to(`user:${payload.driverId}`).emit(SOCKET_EVENTS.SELLER_ASSIGN_DRIVER, payload);
    this.server.to(`role:admin`).emit(SOCKET_EVENTS.SELLER_ASSIGN_DRIVER, payload);
  }

  @SubscribeMessage(SOCKET_EVENTS.DRIVER_LOCATION)
  handleDriverLocation(client: Socket, payload: any) {
    this.server.to(`user:${payload.customerId}`).emit(SOCKET_EVENTS.DRIVER_LOCATION, payload);
    this.server.to(`role:admin`).emit(SOCKET_EVENTS.DRIVER_LOCATION, payload);
  }

  @SubscribeMessage(SOCKET_EVENTS.DRIVER_ACCEPT_DELIVERY)
  handleDriverAcceptDelivery(client: Socket, payload: any) {
    this.server.to(`role:seller`).emit(SOCKET_EVENTS.DRIVER_ACCEPT_DELIVERY, payload);
    this.server.to(`user:${payload.customerId}`).emit(SOCKET_EVENTS.DRIVER_ACCEPT_DELIVERY, payload);
    this.server.to(`role:admin`).emit(SOCKET_EVENTS.DRIVER_ACCEPT_DELIVERY, payload);
  }

  @SubscribeMessage(SOCKET_EVENTS.DRIVER_COMPLETE_DELIVERY)
  handleDriverCompleteDelivery(client: Socket, payload: any) {
    this.server.to(`user:${payload.customerId}`).emit(SOCKET_EVENTS.DRIVER_COMPLETE_DELIVERY, payload);
    this.server.to(`role:admin`).emit(SOCKET_EVENTS.DRIVER_COMPLETE_DELIVERY, payload);
  }
}
