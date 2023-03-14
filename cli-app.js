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
global.socket = io('https://poker-planning-server.adaptable.app/');
global.clientEvents = new ClientEvents();
global.currentScreen = null;
global.connectionLoss = false;

async function init() {
  while (true) {
    console.clear();
    await welcomeMenu();
    await mainMenu();
    await gameMenu();
  }
}

socket.on('connect', () => {
  if (currentScreen == null) init();
  if (game?.state?.id) clientEvents.emitRequestState(game.state.id);
  clientEvents.processQueue();
});
