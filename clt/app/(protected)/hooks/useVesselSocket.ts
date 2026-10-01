"use client"
import { useEffect, useRef } from "react"

export default function useVesselSocket() {
    const socketRef = useRef<WebSocket | null>(null);
    const socketurl = process.env.NEXT_PUBLIC_VESSEL_WEBSOCKET_URL

    useEffect(() => {


        if (!socketurl) {
            throw new Error("NEXT_PUBLIC_VESSEL_WEBSOCKET_URL is not defined")
        }

        const socket = new WebSocket(
            socketurl
        );

        socket.onopen = () => {
            console.log("Vessel WebSocket connected");
        }
        socket.onmessage = (event) => {
            console.log("Vessel message:", event.data);
        };

        socket.onclose = () => {
            console.log("Vessel WebSocket disconnected");
        };

        socket.onerror = (error) => {
            console.error("Vessel WebSocket error:", error);
        };


        socketRef.current = socket

        return ()=>{
            socket.close();
            socketRef.current = null
        }
    },[])
    return socketRef
}
