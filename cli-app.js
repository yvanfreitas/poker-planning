#!/usr/bin/env node
import { io } from 'socket.io-client';
import GameRender from './src/cli-app/game-render.js';
import { mainMenu } from './src/cli-app/main-menu.js';
import { gameMenu } from './src/cli-app/game-menu.js';
import { welcomeMenu } from './src/cli-app/welcome-menu.js';
import EventsListener from './src/domain/events-listener.js';

global.player = null;
global.game = null;
global.gameRender = new GameRender();
//global.socket = io.connect('https://poker-planning-server.adaptable.app/', {
global.socket = io.connect('http://localhost:6000/', {
  reconnection: true,
  reconnectionDelay: 500,
  reconnectionAttempts: 500,
});
global.eventsListener = new EventsListener();
global.connectionLoss = false;
global.prompter = null;

async function init() {
  while (true) {
    await welcomeMenu();
    await mainMenu();
    await gameMenu();
  }
}
init();
