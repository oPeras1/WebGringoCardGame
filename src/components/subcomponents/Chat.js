import React, { useState } from 'react';
import { profilePics, chatIcons } from '../../utils/globals';
import '../../assets/Chat.css';

const Chat = ({ chat, messages, enviaMensagem }) => {
    const [isChatVisible, setIsChatVisible] = useState(false);
    const [cont, setCont] = useState("");

    const handleClose = () => {
        document.querySelector('.chat').classList.add('slide-out');
        setTimeout(() => setIsChatVisible(false), 400);
    };

    const handleSendMessage = () => {
        if (cont.trim() !== "" && cont.length <= 650) {
            enviaMensagem(cont);
            setCont("");
        }
    };

    return (
        <div>
            {!isChatVisible ? (
                <button className={`chat-toggle-button ${isChatVisible ? 'fade-out' : ''}`} onClick={() => setIsChatVisible(true)}>
                    <img src={chatIcons[0]} alt="Open Chat" className="chat-icon" />
                </button>
            ) : (
                <div className="chat">
                    <div className="chat-header">
                        <h2>Chat</h2>
                        <button className="chat-close-button" onClick={handleClose}>
                            <img src={chatIcons[1]} alt="Close Chat" className="chat-icon" />
                        </button>
                    </div>
                    <div className="chat-messages">
                        <ul>
                            {chat.map((chat, index) => (
                                <li key={index} className="message">
                                    <div className="message-header">
                                        <img src={profilePics[chat.id]} alt={`${chat.author} Avatar`} />
                                        <h3>{chat.author}</h3>
                                    </div>
                                    <p>{chat.content}</p>
                                </li>
                            ))}
                        </ul>
                        <ul>
                            { /* Depois tira-se */ }
                            {messages.map((message, index) => (
                                <li key={index}>{message}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="chat-input">
                        <input 
                            type="text" 
                            placeholder="Type a message..."
                            className="nome-txt"
                            value={cont}
                            onChange={(event) => setCont(event.target.value)}
                            maxLength={650}
                        />
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
