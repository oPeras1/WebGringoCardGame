import React from 'react';
import '../../assets/LobbyInfo.css';

const profilepics = [
    "/img/pfp/profile1.jpg",
    "/img/pfp/profile2.jpg",
    "/img/pfp/profile3.jpg",
    "/img/pfp/profile4.jpg",
    "/img/pfp/profile5.jpg",
    "/img/pfp/profile6.jpg",
    "/img/pfp/profile7.jpg",
    "/img/pfp/profile8.jpg",
    "/img/pfp/profile9.jpg",
]

const readyornot = [
    "/icons/check.png",
    "/icons/wrong.png",
    "/icons/hammer.png"
]

const LobbyInfo = ({ roomID, players }) => {
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
        const response = await fetch(`http://192.168.32.219:8000/kickLobby?token=${localStorage.getItem("token")}&lobbyname=${roomID}&username=${name}`, {
            method: 'POST'
        });

        if (response.status !== 200) {
            alert("Error!")
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
                        <img src={profilepics[player.avatar]} alt="Player Avatar" className="player-avatar" />
                        <span className="player-name">{player.owner ? player.name + " (Owner 👑)" : player.name}</span>
                        {(admin && player.name !== localStorage.getItem("username")) ? (
                            <button className="action-button" onClick={() => handleKick(player.name)}>
                                <img src={readyornot[2]} alt="Icon 1" className="action-icon" />
                            </button>
                        ) : null}
                        <img src={player.ready ? readyornot[0] : readyornot[1]} alt="Icon 2" className="action-icon" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LobbyInfo;