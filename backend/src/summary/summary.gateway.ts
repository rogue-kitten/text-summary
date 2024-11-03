import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChannelType } from 'src/utils/enums/channels';
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SummaryGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private connectedClients: string[] = [];

  @WebSocketServer() private server: Server;

  handleDisconnect(client: Socket) {
    console.log('disconnected with client', client.id);
    this.connectedClients = this.connectedClients.filter(
      (clients) => clients != client.id,
    );
  }
  handleConnection(client: Socket) {
    console.log('new client connected', client.id);
    this.connectedClients.push(client.id);
  }

  afterInit() {
    console.log('Socket server initialised');
  }

  checkIfValidClient(clientId: string): boolean {
    return this.connectedClients.includes(clientId);
  }

  @SubscribeMessage('ping')
  handleMessage(): string {
    return 'pong';
  }

  sendMessageToClient({
    data,
    channel,
    clientId,
  }: {
    channel: ChannelType;
    data: Record<string, string | number | boolean>;
    clientId: string;
  }) {
    if (this.checkIfValidClient(clientId)) {
      this.server.to(clientId).emit(channel, data);
      return { success: true };
    } else {
      return { success: false };
    }
  }
}
