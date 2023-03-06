import inquirer from 'inquirer';
import { createSpinner } from 'nanospinner';
import { fibonacci, powersOf2 } from '../domain/scales.js';
import { sleep } from '../domain/utils.js';
import Game from '../domain/game.js';

import Open from 'open';

export async function mainMenu() {
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
  await gameRender.render(game);
  const settings = await inquirer.prompt([
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
  game = new Game(settings.name, settings.scale);
  clientEvents.emitGameJoin();
  await sleep(1000);
  spinner.success({ text: `Game created!` });
  await sleep(1000);

  return;
}

async function gameJoin() {
  await gameRender.render(game);
  const answers = await inquirer.prompt({
    name: 'gameId',
    type: 'input',
    message: 'What is the game id?',
  });
  clientEvents.emitRequestState(answers.gameId);

  const spinner = createSpinner('Waiting for game host to accept your request...').start();
  while (game == null) {
    await sleep(1000);
  }
  clientEvents.emitGameJoin();
  spinner.success({ text: `Request accepted!` });
  await sleep(1000);

  return;
}

async function buyMeACoffee() {
  await gameRender.render(game);
  const spinner = createSpinner('Thank you for contribute. Opening browser...').start();
  await sleep(1200);
  Open('https://www.buymeacoffee.com/yvanfreitas');
  spinner.success({ text: `Redirection to menu` });
  await sleep(600);
}
