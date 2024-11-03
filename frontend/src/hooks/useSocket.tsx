import { useEffect, useMemo, useState } from 'react';

import { Socket } from 'socket.io-client';
import { disconnectSocket, getSocket } from '../utils/socketManager';

function useSockets() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const socketConnection: { socketClient: Socket<any, any> } = useMemo(() => {
    const URLTOUSE = import.meta.env.VITE_BASE_URL;

    const connection_string = `${URLTOUSE}`;
    const socketClient = getSocket(connection_string, {
      transports: ['websocket'],
      autoConnect: false,
    });

    return { socketClient };
  }, []);

  const [connectionStatus, setConnectionStatus] = useState(
    socketConnection.socketClient.connected ?? false
  );

  useEffect(() => {
    function onConnect() {
      console.log('socket has been connnected');
      setConnectionStatus(true);
    }

    function onDisconnect() {
      disconnectSocket();
      console.log('socket connection has been disconnected');
      setConnectionStatus(false);
    }

    function onConnectionError() {
      console.log('there has been some error in connection');
      setConnectionStatus(false);
    }

    const { socketClient } = socketConnection;
    if (socketClient) {
      if (!socketClient.connected) {
        socketClient.connect();
        console.log('new socket client has been connected');
      }
      socketClient.on('connect', onConnect);
      socketClient.on('disconnect', onDisconnect);
      socketClient.on('connect_error', onConnectionError);

      return () => {
        socketClient.off('connect', onConnect);
        socketClient.off('disconnect', onDisconnect);
        socketClient.off('connect_error', onConnectionError);
      };
    }
  }, [socketConnection]);

  return { socketConnection, connectionStatus };
}

export default useSockets;
