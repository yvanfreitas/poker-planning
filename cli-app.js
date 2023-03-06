#!/usr/bin/env node
import { io } from 'socket.io-client';

import GameRender from './src/cli-app/game-render.js';
import { mainMenu } from './src/cli-app/main-menu.js';
import { gameMenu } from './src/cli-app/game-menu.js';
import { welcomeMenu } from './src/cli-app/welcome-menu.js';
import ClientEvents from './src/cli-app/client-events.js';

global.player = null;
global.game = null;
global.gameRender = new GameRender();
global.socket = io('http://localhost:3000');
global.clientEvents = new ClientEvents();

async function init() {
  while (true) {
    console.clear();
    await welcomeMenu();
    await mainMenu();
    await gameMenu();
  }
}

socket.on('connect', () => {
  init();
});
