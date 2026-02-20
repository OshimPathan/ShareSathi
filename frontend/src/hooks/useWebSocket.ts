import { useState, useEffect, useRef } from 'react';

export const useWebSocket = (url: string, shouldConnect: boolean = true) => {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<any>(null);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!shouldConnect) return;

        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => setIsConnected(true);

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setLastMessage(data);
            } catch (e) {
                console.error("WS Parse Error", e);
            }
        };

        ws.onclose = () => setIsConnected(false);

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [url, shouldConnect]);

    const sendMessage = (msg: any) => {
        if (wsRef.current && isConnected) {
            wsRef.current.send(JSON.stringify(msg));
        }
    };

    return { isConnected, lastMessage, sendMessage };
};

export default useWebSocket;
