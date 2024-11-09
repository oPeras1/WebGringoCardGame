import React from 'react';
import { profilePics, readyIcons, API } from '../../utils/globals';
import '../../assets/LobbyInfo.css';

const LobbyInfo = ({ roomID, players, readyStatus }) => {
    const isAdmin = (players) => {
        for (const player of players) {
            if (player.owner) {
                return player.name === localStorage.getItem("username");
            }
        }

        return false;
    }

    const admin = isAdmin(players)

    const handleKick = async (name) => {
        const response = await fetch("http://" + API + `/kickLobby?token=${localStorage.getItem("token")}&lobbyname=${roomID}&username=${name}`, {
            method: 'POST'
        });

        if (response.status !== 200) {
            alert("Error!")
        }
    }

    const handleReady = async (name) => {
        if (name === localStorage.getItem("username")) {
            const response = await fetch("http://" + API + `/readyLobby?token=${localStorage.getItem("token")}&lobbyname=${roomID}`, {
                method: 'POST'
            });

            if (response.status === 404) {
                alert("Lobby not found")
            }

            else if (response.status === 401) {
                alert("Not enough players in the lobby")
            }

            if (response.status !== 200) {
                alert("Error!")
            }
        }
    }

    return (
        <div className="lobby-info-card">
            <div className="lobby-header">
                <h1>Room ID: {roomID}</h1>
                <h2>Share this ID with your friends to join the game! Whenever you are ready, press the X button</h2>
            </div>
            <div className="players-list">
                {players.map((player, index) => (
                    <div key={index} className="player-item">
                        <img src={profilePics[player.avatar]} alt="Player Avatar" className="player-avatar" />
                        <span className="player-name">{player.owner ? player.name + " (Owner 👑)" : player.name}</span>
                        {(admin && player.name !== localStorage.getItem("username")) ? (
                            <button className="action-button kick" onClick={() => handleKick(player.name)}>
                                <img src={readyIcons[2]} alt="Icon 1" className="action-icon" />
                            </button>
                        ) : null}
                        <button className="action-button" onClick={() => handleReady(player.name)}>
                            <img src={readyStatus[player.name] ? readyIcons[0] : readyIcons[1]} alt="Ready or Not" className = "action-icon"/>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LobbyInfo;