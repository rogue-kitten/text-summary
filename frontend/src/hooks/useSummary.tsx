import { useCallback, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { ALL_CHANNELS } from '../utils/enum/channel';

type SummaryNotification = {
  chunk: string;
  summary: string;
};

type SummarySocketResponse = {
  chunks: {
    chunk: string;
    summary: string;
  }[];
};

export function useSummary({
  socketClient,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socketClient: Socket<any, any>;
}) {
  const [summary, setSummary] = useState<SummaryNotification[]>([]);

  const onNewSummaryGeneration = useCallback((data: SummarySocketResponse) => {
    // console.log('got new response from summary', data);
    setSummary((prev) => prev.concat(data.chunks));
  }, []);

  useEffect(() => {
    socketClient.on(ALL_CHANNELS.SUMMARY, onNewSummaryGeneration);

    return () => {
      socketClient.off(ALL_CHANNELS.SUMMARY, onNewSummaryGeneration);
    };
  }, [socketClient, onNewSummaryGeneration]);

  return { summary, setSummary };
}
