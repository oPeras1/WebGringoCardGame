import React, { useState } from 'react';
import '../assets/Home.css';
import { useNavigate } from 'react-router-dom';

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


const Home = () => {
    const [userpf, setUserpf] = useState(localStorage.getItem("id") || 0);
    const [username, setUsername] = useState(localStorage.getItem("username") || "");
    const [showButtons, setShowButtons] = useState(localStorage.getItem("username") ? true : false);
    const [lobbyname, setLobbyname] = useState("");
    const navigate = useNavigate();

    const handleClickPfp = () => {
        setUserpf((userpf) => (userpf + 1) % profilepics.length);
    }

    const handleChangeName = (event) => {
        setUsername(event.target.value);
    }

    const handleClickName = async () => {
        if (username.length > 0) {
            const response = await fetch(`http://192.168.32.219:8000/setUsername?username=${encodeURIComponent(username)}&id=${userpf}`, {
                method: 'POST'
            });

            if (response.status !== 200) {
                alert("Error!")
            }

            // Converter a resposta em JSON
            const data = await response.json();
            setShowButtons(true);

            // Armazenar informações no localStorage
            localStorage.setItem("username", username);
            localStorage.setItem("token", data.token);
            localStorage.setItem("id", userpf);
        }
    }

    const handleClickCreate = async () => {
        const response = await fetch(`http://192.168.32.219:8000/createLobby?token=${localStorage.getItem("token")}`, {
            method: 'POST'
        });

        const data = await response.json();
        const lobbyname = data.lobbyname;


        navigate(`/waiting/${lobbyname}`);
    }

    const handleChangeLobby = (event) => {
        setLobbyname(event.target.value);
    }


    const handleLobbyName = async () => {
        if (lobbyname.length > 0) {
            const response = await fetch(`http://192.168.32.219:8000/joinLobby?token=${localStorage.getItem("token")}&lobbyname=${lobbyname.toUpperCase()}`, {
                method: 'POST'
            });
        
        
            if (response.status !== 200) {
                alert("Lobby doesn't exist!");
                return;
            }

            navigate(`/waiting/${lobbyname}`);
        }
    }


    return (
        <div className="home-form-container">
            <video autoPlay muted loop className="video-background" src="/video/beach.mp4"></video>
            <div className="home-form">
                <h1 className = "titjogo">Gringo!</h1>
                <div className = "profile-container">
                    <img src = {profilepics[userpf]} alt="Profile" className = "profile"/>
                    <button onClick={handleClickPfp} className="switch-button">&#8635;</button>
                </div>
                <div className = "nome-container">
                    <input type="text" value = {username} onChange = {handleChangeName} placeholder = "Name" className = "nome-txt"/>
                    <button className = "nome-btn" onClick = {handleClickName}>SET</button>
                </div>
                {showButtons ? <div className = "lobby-container">
                    <button className = "create-btn" onClick = {handleClickCreate}>CREATE LOBBY</button>
                    <div className = "join-lobby-container">
                        <input type="text" value = {lobbyname} onChange = {handleChangeLobby} placeholder = "Code" className = "lobby-txt"/>
                        <button className = "nome-btn join-btn" onClick = {handleLobbyName}>JOIN LOBBY</button>
                    </div>
                </div> : <></>}
            </div>
        </div>
    );
}

export default Home;