import React, { useState, useEffect } from 'react';
import '../../assets/Chat.css';

const chatIcons = ["/icons/open-chat.png", "/icons/close-chat.png"];

const Chat = ({ messages }) => {
    const [isChatVisible, setIsChatVisible] = useState(false);

    const handleClose = () => {
        document.querySelector('.chat').classList.add('slide-out');
        setTimeout(() => setIsChatVisible(false), 400);
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
                            {messages.map((msg, index) => (
                                <li key={index}>{msg}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="chat-input">
                        <input 
                            type="text" 
                            placeholder="Type a message..."
                            className = "nome-txt"
                        />
                        <button>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
