import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

class WebSocketServer {
  constructor(port) {
    this.port = port;
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new Server(this.server);
    this.games = new Map();

    this.server.listen(this.port, () => {
      console.log(`listening on *:${this.port}`);
    });

    this.io.on('connection', (socket) => this.handleConnection(socket));
  }

  handleConnection(socket) {
    socket.on('game-input', (payload) => {
      console.log('---- event received ----');
      console.log(payload);

      const gameId = payload.data.gameId != undefined ? payload.data.gameId : payload.gameId;
      if (!gameId) return;

      let game = this.games.get(gameId);

      if (!game) {
        game = new Game(gameId);
        this.games.set(gameId, game);
      }

      if (!game.hasPlayer(socket.id)) {
        game.registerPlayer(socket.id);
      }

      game.broadcastEventToPlayers(payload);
    });

    socket.on('reconnect', () => {
      this.handleReconnection(socket);
    });
  }

  handleReconnection(socket) {
    const gameId = this.players.get(socket.id);
    if (!gameId) return;

    const game = this.games.get(gameId);
    if (!game) return;

    game.sendUnsentEvents(socket.id);
  }
}

class Game {
  constructor(id) {
    this.id = id;
    this.players = new Map();
    this.events = [];
  }

  hasPlayer(socketId) {
    return this.players.has(socketId);
  }

  registerPlayer(socketId) {
    this.players.set(socketId, true);
  }

  addEvent(payload) {
    const event = {
      payload,
      sentToPlayers: new Map(),
    };

    this.events.push(event);
    return event;
  }

  broadcastEventToPlayers(payload) {
    const event = this.addEvent(payload);

    this.players.forEach((_value, socketId) => {
      event.sentToPlayers.set(socketId, true);

      console.log(`------ event emited ${socketId} ------`);
      console.log(payload);

      webSocketServer.io.sockets.in(socketId).emit('game-input', payload);
    });
  }

  sendUnsentEvents(socketId) {
    this.events.forEach((event) => {
      if (!event.sentToPlayers.get(socketId)) {
        console.log(`event emited ${socketId} ${JSON.stringify(event.payload)}`);
        webSocketServer.io.sockets.in(socketId).emit('game-input', event.payload);
        event.sentToPlayers.set(socketId, true);
      }
    });
  }
}

const port = process.env.PORT || 3000;
const webSocketServer = new WebSocketServer(port);
