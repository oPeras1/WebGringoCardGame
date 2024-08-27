import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import "../assets/WaitingRoom.css";

import LobbyInfo from './subcomponents/LobbyInfo';

const Waiting = () => {
    const { roomID } = useParams();
    const [ws, setWs] = useState(null);
    const [messages, setMessages] = useState([]);
    const [players, setPlayers] = useState([{name: localStorage.getItem("username") + " (Owner 👑)", avatar: localStorage.getItem("id")}]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            console.error('No token found');
            return;
        }
        
        if (ws) {
            ws.close();
        }
        
        const socket = new WebSocket(`ws://gringo.operas.pt:8000/ws/${roomID}/${token}`);

        socket.onopen = () => {
            console.log('Connected to WebSocket');
        };

        socket.onmessage = (event) => {
            console.log('Received message:', event.data);
            const data = JSON.parse(event.data)

            if (data.id === 1) { 
                console.log("Nuno")
                setPlayers(data.players)
            }
            setMessages((prevMessages) => [...prevMessages, event.data]);
        };

        socket.onclose = () => {
            console.log('Disconnected from WebSocket');
        };

        setWs(socket);

        return () => {
            socket.close();
        };
    }, [roomID, token]);

    useEffect(() => {
    }, [players]);

    return (
        <div className="waiting-room">
            <LobbyInfo roomID={roomID} players = {players} />
            <div>
                <h2>WebSocket Messages:</h2>
                <ul>
                    {messages.map((msg, index) => (
                        <li key={index}>{msg}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Waiting;