import { io, ManagerOptions, Socket, SocketOptions } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (
  url: string,
  options: Partial<SocketOptions & ManagerOptions>
): Socket => {
  if (!socket) {
    socket = io(url, options);
  }
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket?.connected) {
    socket.disconnect();
  }
  socket = null;
};
