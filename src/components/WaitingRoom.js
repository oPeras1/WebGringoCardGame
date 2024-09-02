import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import "../assets/WaitingRoom.css";

import LobbyInfo from './subcomponents/LobbyInfo';
import Chat from './subcomponents/Chat';

const url = "127.0.0.1:8000"

const Waiting = () => {
    const { roomID } = useParams();
    const [ws, setWs] = useState(null);
    const [messages, setMessages] = useState([]);
    const [players, setPlayers] = useState([{name: localStorage.getItem("username") + " (Owner 👑)", avatar: localStorage.getItem("id")}]);
    const [readyStatus, setReadyStatus] = useState({});
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            console.error('No token found');
            return;
        }
        
        if (ws) {
            ws.close();
        }
        
        const socket = new WebSocket("ws://" + url + `/ws/${roomID}/${token}`);

        socket.onopen = () => {
            console.log('Connected to WebSocket');
        };

        socket.onmessage = (event) => {
            console.log('Received message:', event.data);
            const data = JSON.parse(event.data)

            if (data.id === 1) { 
                setPlayers(data.players);
                setReadyStatus(data.ready.reduce((acc, obj) => {
                    const key = Object.keys(obj)[0];
                    acc[key] = obj[key];
                    return acc;
                }, {}));
            } else if (data.id === 2) {
                setReadyStatus(data.ready);
            }

            setMessages((prevMessages) => [...prevMessages, event.data]);
        };

        socket.onclose = () => {
            console.log('Disconnected from WebSocket');
        };

        setWs(socket);

        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, [roomID, token]);

    useEffect(() => {
    }, [players]);

    return (
        <div className="waiting-room">
            <LobbyInfo roomID={roomID} players = {players} readyStatus = {readyStatus} />
            <Chat messages = {messages} />
        </div>
    );
};

export default Waiting;