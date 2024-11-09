import React, { useEffect, useState } from 'react';
import { API } from '../utils/globals';
import { useParams } from 'react-router-dom';
import "../assets/WaitingRoom.css";

import LobbyInfo from './subcomponents/LobbyInfo';
import Chat from './subcomponents/Chat';

const Waiting = () => {
    const { roomID } = useParams();
    const [ws, setWs] = useState(null);
    const [chat, setChat] = useState([]);
    const [messages, setMessages] = useState([]);
    const [players, setPlayers] = useState([{name: localStorage.getItem("username") + " (Owner 👑)", avatar: localStorage.getItem("id")}]);
    const [readyStatus, setReadyStatus] = useState({});
    const token = localStorage.getItem('token');


    const handleMensagem = async (content) => {
        const response = await fetch("http://" + API + `/sendMessage?token=${token}&message=${content}&id=${localStorage.getItem("id")}`, {
            method: 'POST'
        });

        const data = await response.json();
        setChat((prevChat) => [...prevChat, data.message]);
    }

    useEffect(() => {
        if (!token) {
            console.error('No token found');
            return;
        }
        
        if (ws) {
            ws.close();
        }
        
        const socket = new WebSocket("ws://" + API + `/ws/${roomID}/${token}`);

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

            if (data.message) {
                console.log(data.message);
                setChat((prevChat) => [...prevChat, data.message]);
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
            <Chat chat = {chat} messages = {messages} enviaMensagem = {(content) => handleMensagem(content)}/>
        </div>
    );
};

export default Waiting;