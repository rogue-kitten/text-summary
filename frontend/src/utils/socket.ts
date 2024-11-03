import { disconnectSocket } from './socketManager';

export function onConnect() {
  console.log('socket has been connnected');
}

export function onDisconnect() {
  disconnectSocket();
  console.log('socket connection has been disconnected');
}

export function onConnectionError() {
  console.log('there has been some error in connection');
}
