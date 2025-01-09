// usePatientSocket.js
import { useEffect, useRef } from "react";
import io from "socket.io-client";

export const usePatientSocket = (baseUrl, token, onDataUpdate) => {
  const socketRef = useRef(null);
  const isInitialFetchRef = useRef(true);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const setupSocket = () => {
      if (socketRef.current) return; // Prevent multiple socket instances

      socketRef.current = io(`${baseUrl}`, {
        transports: ["websocket"],
        auth: { token },
        reconnection: false, // We'll handle reconnection manually
      });

      socketRef.current.on("connect", () => {
        console.log("Socket Connected");
        // Clear any pending reconnection attempts
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      });

      socketRef.current.on("disconnect", () => {
        console.log("Socket Disconnected");
        // Only fetch data if component is still mounted
        if (isMounted) {
          onDataUpdate();
        }
      });

      socketRef.current.on("PATIENT_CHECKED_IN", () => {
        if (isMounted) onDataUpdate();
      });

      socketRef.current.on("PATIENT_ENROLLED", () => {
        if (isMounted) onDataUpdate();
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        // Clean up existing socket
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }

        // Schedule a single reconnection attempt
        if (!reconnectTimeoutRef.current && isMounted) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMounted) {
              onDataUpdate();
              setupSocket();
            }
          }, 5000); // Try to reconnect after 5 seconds
        }
      });
    };

    // Initial setup
    if (isInitialFetchRef.current) {
      onDataUpdate();
      isInitialFetchRef.current = false;
    }
    setupSocket();

    // Cleanup function
    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [baseUrl, token, onDataUpdate]);
};
