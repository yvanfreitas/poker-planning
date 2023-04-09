import inquirer from 'inquirer';
import { createSpinner } from 'nanospinner';
import { fibonacci, powersOf2 } from '../domain/scales.js';
import { sleep } from '../domain/utils.js';
import Game from '../domain/game.js';
import Event from '../domain/event.js';
import EventsHandler from '../domain/events-handler.js';

import Open from 'open';

export async function mainMenu() {
  //currentScreen = 'mainMenu';
  if (game) return;
  await gameRender.render(game);
  prompter = await inquirer.prompt({
    name: 'menu',
    type: 'list',
    message: 'MENU',
    choices: ['Create a game', 'Join a game', new inquirer.Separator(), 'Buy me a coffee'],
  });

  switch (prompter.menu) {
    case 'Create a game':
      await gameCreate();
      break;
    case 'Join a game':
      await gameJoin();
      break;
    case 'Buy me a coffee':
      await buyMeACoffee();
      break;
  }
}

async function gameCreate() {
  await gameRender.render(game);
  prompter = await inquirer.prompt([
    {
      name: 'name',
      type: 'input',
      message: 'How we should call this game?',
    },
    {
      name: 'scale',
      type: 'list',
      message: 'Select the effort points scale:',
      choices: [fibonacci, powersOf2],
    },
  ]);

  console.log('Creating the game...');
  game = new Game(prompter.name.trim(), prompter.scale);

  const event = new Event('game-join', { player: player, gameId: game.state.id });
  game.eventsHandler.enqueueToEmit(event);

  let playerLogged = false;
  while (!playerLogged) {
    if (connectionLoss) return (connectionLoss = false);
    game.state.players.forEach((gamePlayer) => {
      if (gamePlayer.id == player.id) playerLogged = true;
    });
    await sleep(500);
  }

  console.log(`Game created!`);
  await sleep(1000);

  return;
}

async function gameJoin() {
  await gameRender.render(game);
  prompter = await inquirer.prompt({
    name: 'gameId',
    type: 'input',
    message: 'What is the game id?',
  });

  console.log('Waiting for game host to accept your request...');
  let event = new Event(`request-state`, { player: player, gameId: prompter.gameId.trim() });

  const eventsHandler = new EventsHandler();
  eventsHandler.enqueueToEmit(event);

  while (game == null) {
    await sleep(500);
  }

  event = new Event('game-join', { player: player, gameId: game.state.id });
  game.eventsHandler.enqueueToEmit(event);

  let playerLogged = false;
  while (!playerLogged) {
    if (connectionLoss) return (connectionLoss = false);
    game.state.players.forEach((gamePlayer) => {
      if (gamePlayer.id == player.id) playerLogged = true;
    });
    await sleep(500);
  }

  console.log(`Request accepted!`);
  await sleep(1000);

  return;
}

async function buyMeACoffee() {
  await gameRender.render(game);

  console.log('Thank you for contribute. Opening browser...');
  await sleep(1200);
  Open('https://www.buymeacoffee.com/yvanfreitas');

  console.log(`Redirection to menu`);
  await sleep(600);

  return;
}
