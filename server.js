import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
let games = [];
let players = [];

server.listen(3000, () => {
  console.log('listening on *:3000');
});

io.on('connection', (socket) => {
  console.log(`socket connected ${socket.id}`);

  socket.on('game-input', (payload) => {
    if (players[socket.id] == undefined) {
      registerPlayer(socket.id, payload.data?.gameId);
    }
    const gameId = players[socket.id];
    const event = payload.event;
    const data = payload.data;
    broadcastEventToPlayers(gameId, event, data);
  });
});

async function broadcastEventToPlayers(gameId, event, data) {
  games[gameId]?.forEach((socketId) => {
    emit(socketId, event, data);
  });
}

async function emit(socketId, event, data) {
  console.log(`event emited ${socketId} ${event}`);
  io.sockets.in(socketId).emit(event, data);
}

function registerPlayer(socketId, gameId) {
  if (!games[gameId]) games[gameId] = [];
  games[gameId].push(socketId);
  players[socketId] = gameId;
}
