import { ALL_CHANNELS } from '@/utils/enum/channel';
import { useCallback, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

type ProgressUpdate = {
  state: 'START' | 'END' | 'PROGRESS';
  progressUpdate: string;
};

export function useProgressUpdate({
  socketClient,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socketClient: Socket<any, any>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState('0');

  const onProgressUpdate = useCallback(
    ({ progressUpdate, state }: ProgressUpdate) => {
      // console.log('got new response from summary', data);
      if (state === 'START') setIsLoading(true);
      else if (state === 'END') setIsLoading(false);
      setProgress(progressUpdate);
    },
    [],
  );

  useEffect(() => {
    socketClient.on(ALL_CHANNELS.PROGRESS, onProgressUpdate);

    return () => {
      socketClient.off(ALL_CHANNELS.PROGRESS, onProgressUpdate);
    };
  }, [socketClient, onProgressUpdate]);

  return { isLoading, progress, setIsLoading };
}
