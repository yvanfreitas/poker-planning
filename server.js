import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server);
let games = [];
let players = [];

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});

io.on('connection', (socket) => {
  console.log(`socket connected ${socket.id}`);

  socket.on('game-input', (payload) => {
    if (players[socket.id] == undefined) {
      registerPlayer(socket.id, payload.data?.gameId);
    }
    const gameId = players[socket.id];
    broadcastEventToPlayers(gameId, payload);
  });
});

async function broadcastEventToPlayers(gameId, payload) {
  games[gameId]?.forEach((socketId) => {
    emit(socketId, payload);
  });
}

async function emit(socketId, data) {
  console.log(`event emited ${socketId} ${data}`);
  io.sockets.in(socketId).emit('game-input', data);
}

function registerPlayer(socketId, gameId) {
  if (!games[gameId]) games[gameId] = [];
  games[gameId].push(socketId);
  players[socketId] = gameId;
}
