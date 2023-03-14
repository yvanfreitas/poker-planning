import inquirer from 'inquirer';
import { createSpinner } from 'nanospinner';
import { fibonacci, powersOf2 } from '../domain/scales.js';
import { sleep } from '../domain/utils.js';
import Game from '../domain/game.js';

import Open from 'open';

export async function mainMenu() {
  currentScreen = 'mainMenu';
  if (game) return;
  await gameRender.render(game);
  const answers = await inquirer.prompt({
    name: 'menu',
    type: 'list',
    message: 'MENU',
    choices: ['Create a game', 'Join a game', new inquirer.Separator(), 'Buy me a coffee'],
  });

  switch (answers.menu) {
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
  currentScreen = 'gameCreate';
  await gameRender.render(game);
  const gamePrompt = await inquirer.prompt([
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

  const spinner = createSpinner('Creating the game...').start();
  game = new Game(gamePrompt.name.trim(), gamePrompt.scale);
  clientEvents.emitGameJoin();

  let playerLogged = false;
  while (!playerLogged) {
    if (connectionLoss) return (connectionLoss = false);
    game.state.players.forEach((gamePlayer) => {
      if (gamePlayer.id == player.id) playerLogged = true;
    });
    await sleep(500);
  }

  spinner.success({ text: `Game created!` });
  await sleep(1000);

  return;
}

async function gameJoin() {
  currentScreen = 'gameJoin';
  await gameRender.render(game);
  const joinPrompt = await inquirer.prompt({
    name: 'gameId',
    type: 'input',
    message: 'What is the game id?',
  });

  const spinner = createSpinner('Waiting for game host to accept your request...').start();
  clientEvents.emitRequestState(joinPrompt.gameId.trim());

  while (game == null) {
    if (connectionLoss) return (connectionLoss = false);
    await sleep(500);
  }

  clientEvents.emitGameJoin();

  let playerLogged = false;
  while (!playerLogged) {
    if (connectionLoss) return (connectionLoss = false);
    game.state.players.forEach((gamePlayer) => {
      if (gamePlayer.id == player.id) playerLogged = true;
    });
    await sleep(500);
  }

  spinner.success({ text: `Request accepted!` });
  await sleep(1000);

  return;
}

async function buyMeACoffee() {
  currentScreen = 'buyMeACoffee';
  await gameRender.render(game);
  const spinner = createSpinner('Thank you for contribute. Opening browser...').start();
  await sleep(1200);
  Open('https://www.buymeacoffee.com/yvanfreitas');
  spinner.success({ text: `Redirection to menu` });
  await sleep(600);
}
