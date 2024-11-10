import random
import string
import time
import asyncio
import json

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from jose import JWTError, jwt
from typing import Dict, List

#####################
### 1 . Its the Ace of Cop Hearts
### 2-10 . Its the 1-10 of Cop Hearts
###
### 11 . Its the Ace of Cop Diamonds
### 12-20 . Its the 1-10 of Cop Diamonds
###
### 21 . Its the Ace of Cop Clubs
### 22-30 . Its the 1-10 of Cop Clubs
###
### 31 . Its the Ace of Cop Spades
### 32-40 . Its the 1-10 of Cop Spades
#####################
### 41 . Its the king of Cop Hearts
### 42 . Its the king of Cop Diamonds
### 43 . Its the king of Cop Clubs
### 44 . Its the king of Cop Spades
#####################
### 45 . Its the queen of Cop Hearts
### 46 . Its the queen of Cop Diamonds
### 47 . Its the queen of Cop Clubs
### 48 . Its the queen of Cop Spades
#####################
### 49 . Its the jack of Cop Hearts
### 50 . Its the jack of Cop Diamonds
### 51 . Its the jack of Cop Clubs
### 52 . Its the jack of Cop Spades
#####################
### 53-54 . Its the joker



app = FastAPI()

# CORS settings if needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "gringocaralho"  # Replace with your secret key
ALGORITHM = "HS256"



#TIRAR EM PROD:
app.mount("/static", StaticFiles(directory="app/static"), name="static")

def get_user_from_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def generate_random_string(length=5):
    characters = string.ascii_uppercase + string.digits
    random_string = ''.join(random.choice(characters) for _ in range(length))
    return random_string

def shuffle_deck():
    # Cria uma lista de números de 1 a 52
    deck = list(range(1, 53))
    # Embaralha a lista para randomizar a ordem
    random.shuffle(deck)
    return deck

def numPlayers(lobby):
    return len(lobby["players"])

def numReady(lobby):
    ready = 0
    players = lobby["players"]
    for player in players:
        if players[player]['ready']:
            ready += 1
    return ready

async def prepareLobby(lobbyname):
    lobby = lobbies[lobbyname]

    lobby["state"] = "Countdown"

    await asyncio.sleep(5)

    if lobby["state"] == "Countdown":
        lobby["state"] = "Revealing"
        print("Revealing")
        await notify_lobby(lobbyname, json.dumps({"id": 4, "message": "Revealing Cards"}))

        await asyncio.sleep(15)
        lobby["state"] = "Game"
        await notify_lobby(lobbyname, json.dumps({"id": 4, "message": "Game Started"}))

async def sendListPlayers(lobbyname):
    lobby = lobbies[lobbyname]
    players = lobby["players"]

    # Notify all players in the lobby
    data = {}
    data["id"] = 1
    data["numPlayers"] = numPlayers(lobby)
    data["numReady"] = numReady(lobby)
    data["players"] = []
    data["ready"] = []

    for player in players:
        owner = False
        if player == lobby["owner"]:
            owner = True
        data["players"].append({"name": player, "avatar": users[player]["id"], "owner": owner})
        data["ready"].append({player: players[player]['ready']})

    data = json.dumps(data)

    await notify_lobby(lobbyname, data)

async def sendReadyPlayers(lobbyname):
    lobby = lobbies[lobbyname]
    players = lobby["players"]

    # Notify all players in the lobby
    data = {}
    data["id"] = 2
    data["numReady"] = numReady(lobby)
    data["ready"] = {}

    for player in players:
        name = player
        data["ready"][name]= players[player]['ready']
    
    data = json.dumps(data)

    await notify_lobby(lobbyname, data)

users: Dict[str, Dict] = {}  # username -> {"token": token}
lobbies: Dict[str, Dict] = {}  # lobby_name -> {"owner": str, "players": List[str], "connections": Dict[str, WebSocket]}

@app.post("/setUsername")
def setUsername(username: str, id: int):
    if username in users:
        return HTTPException(status_code=401, detail="That username already exists.")
    elif len(username) < 1 or len(username) > 15:
        return HTTPException(status_code=401, detail="Username must be between 1 and 15 characters.")
    
    # Create a JWT token for the user
    token = jwt.encode({"sub": username}, SECRET_KEY, algorithm=ALGORITHM)

    users[username] = {"token": token, "id": id}

    return {"token": token}

@app.post("/createLobby")
async def createLobby(token: str):
    username = get_user_from_token(token)

    lobbyname = generate_random_string()
    while lobbyname in lobbies:
        lobbyname = generate_random_string()
    
    deck = shuffle_deck()

    lobbies[lobbyname] = {"owner": username, "deck": deck, "players": {username: {'ready': False, 'deck':[0,0,0,0]}}, "state": "Lobby", "connections": {}}

    return {"lobbyname": lobbyname}

@app.post("/joinLobby")
async def joinLobby(token: str, lobbyname: str):
    username = get_user_from_token(token)

    if lobbyname not in lobbies:
        raise HTTPException(status_code=404, detail="Lobby not found")
    
    lobby = lobbies[lobbyname]
    players = lobby["players"]

    if username not in players:
        players[username] = {'ready': False, 'deck':[0,0,0,0]}

    return {"status": "Joined"}

@app.post("/kickLobby")
async def kickLobby(token: str, lobbyname: str, username: str):
    ownerfromtoken = get_user_from_token(token)

    if lobbyname not in lobbies:
        raise HTTPException(status_code=404, detail="Lobby not found")
    
    lobby = lobbies[lobbyname]
    owner = lobby["owner"]
    players = lobby["players"]

    if ownerfromtoken == owner and username in players:
        del players[username]
        
        await lobby["connections"][username].close()
        # Notify all players in the lobby
        print("kick")
        await sendListPlayers(lobbyname)

    return {"status": "Kicked"}

@app.post("/readyLobby")
async def readyLobby(token: str, lobbyname: str, background_tasks: BackgroundTasks):
    username = get_user_from_token(token)

    if lobbyname not in lobbies:
        raise HTTPException(status_code=404, detail="Lobby not found")
    
    lobby = lobbies[lobbyname]
    players = lobby["players"]

    if len(players) < 2:
        raise HTTPException(status_code=401, detail="Not enough players in the lobby")

    if username in players:
        if lobby["state"] == "Countdown":
            lobby["state"] = "Lobby"

        readystate = players[username]['ready']
        players[username]['ready'] = not readystate

        # Notify all players in the lobby
        msg = "ready" 
        if readystate:
            msg = "not ready"

        numReadyLobby = numReady(lobby)
        numPlayersLobby = numPlayers(lobby)
   
        await sendReadyPlayers(lobbyname)

        if numReadyLobby == numPlayersLobby:
            await notify_lobby(lobbyname, {"id": 3})


            background_tasks.add_task(prepareLobby, lobbyname) 

    return {"readystate": readystate}

@app.post("/revealCard")
async def revealCard(token: str, lobbyname: str, id: int):
    username = get_user_from_token(token)

    if lobbyname not in lobbies:
        raise HTTPException(status_code=404, detail="Lobby not found")
    
    lobby = lobbies[lobbyname]
    players = lobby["players"]

    if username not in players:
        raise HTTPException(status_code=404, detail="Player not in-game")

    if lobby["state"] != "Revealing":
        raise HTTPException(status_code=404, detail="Not in revealing state")
    
    deck = lobby["deck"]
    if len(deck) <= 0:
        raise HTTPException(status_code=404, detail="No more cards in the deck")
    
    revealed = 0
    for card in players[username]['deck']:
        if card != 0:
            revealed += 1

    if revealed > 2:
        raise HTTPException(status_code=404, detail="All cards already revealed")

    card = deck.pop()
    players[username]['deck'][id] = card

    # Notify all players in the lobby. MAYBE NOT ALL, JUST THE PLAYER WHO REVEALED AND WICH CARD IS IT
    await notify_lobby(lobbyname, f"User {username} has revealed a card")

    lobby["connections"][username].send_text({"id": 5, "card": card})

    return {"status": "Revealed"}

@app.post("/sendMessage")
async def sendMessage(lobbyname: str, token: str, message: str, id: int):
    username = get_user_from_token(token)

    if len(message) < 1 or len(message) > 650:
        raise HTTPException(status_code=401, detail="Message must be between 1 and 650 characters")

    if lobbyname not in lobbies:
        raise HTTPException(status_code=404, detail="Lobby not found")
    
    if username not in lobbies[lobbyname]["players"]:
        raise HTTPException(status_code=404, detail="Player not in the Lobby")

    # Notify all players in the lobby
    data = {}
    data["id"] = 3
    data["message"] = {
        "author": username,
        "content": message,
        "id": id
    }

    

    data = json.dumps(data)

    await notify_lobby(lobbyname, data)

    return {"chat": "New Message"}

@app.websocket("/ws/{lobbycode}/{token}")
async def websocket_endpoint(websocket: WebSocket, lobbycode: str, token: str):
    await websocket.accept()

    user = get_user_from_token(token)

    if lobbycode not in lobbies or user not in users:
        await websocket.close()
        return

    lobby = lobbies[lobbycode]
    lobby["connections"][user] = websocket
    
    print("ws")
    await sendListPlayers(lobbycode)

    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
    except WebSocketDisconnect:
        if user in lobby["connections"]:
            del lobby["connections"][user]
            if lobby["owner"] == user:
                # If the owner leaves, close the lobby
                for player in list(lobby["players"]):
                    if player in lobby["connections"]:
                        await lobby["connections"][player].close()
                del lobbies[lobbycode]
            elif user in lobby["players"]:
                del lobby["players"][user]
                
                # Notify all players in the lobby
                print("saiu")
                await sendListPlayers(lobbycode)

async def notify_lobby(lobby_name: str, message: str):
    if lobby_name in lobbies:
        lobby = lobbies[lobby_name]
        for ws in lobby["connections"].values():
            try:
                await ws.send_text(message)
            except:
                # Handle error if WebSocket connection is broken
                pass