// // /client/src/hooks/useWebSocket.js
import { useEffect, useState } from 'react';
import { QueryClient } from '@tanstack/react-query';

export const useWebSocket = (channel) => {
  const [data, setData] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const ws = new WebSocket(`${process.env.REACT_APP_WS_URL}/${channel}`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setData(message);

      // Update relevant queries
      if (message.type === 'orderUpdate') {
        queryClient.setQueryData(
          [QueryKeys.ORDERS, message.orderId],
          old => ({ ...old, status: message.status })
        );
      }
    };

    // Add error handling
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => ws.close();
  }, [channel, queryClient]);

  return data;
};

