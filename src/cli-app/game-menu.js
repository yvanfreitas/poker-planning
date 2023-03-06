import inquirer from 'inquirer';
import { createSpinner } from 'nanospinner';
import { sleep } from '../domain/utils.js';

import Card from '../domain/card.js';
import Vote from '../domain/vote.js';

export async function gameMenu() {
  if (!game) return;
  await gameRender.render(game);
  const answers = await inquirer.prompt({
    name: 'game',
    type: 'list',
    message: 'Game Menu',
    choices: listGameMenuOptions(),
  });

  switch (answers.game) {
    case 'Create a card':
      await cardCreate();
      break;
    case 'Delete a card':
      await cardDelete();
      break;
    case 'Kick a player':
      await playerDelete();
      break;
    case 'Pick a card':
      await cardSelect();
      break;
    case 'Vote the card':
      await cardVote();
      break;
    case 'Reveal the card':
      await cardReveal();
      break;
    case 'Reset the card':
      await cardReset();
      break;
    case 'Exit to main Menu':
      game = null;
      break;
    default:
      break;
  }
}

async function cardCreate() {
  await gameRender.render(game);
  const card = await inquirer.prompt([
    {
      name: 'title',
      type: 'input',
      message: 'Card title:',
    },
    {
      name: 'description',
      type: 'input',
      message: 'Card description:',
    },
  ]);

  clientEvents.emitCardCreate(new Card(card.title, card.description));
  return;
}

async function cardDelete() {
  await gameRender.render(game);

  const answers = await inquirer.prompt({
    name: 'cardTitle',
    type: 'list',
    message: 'Select a card to delete',
    choices: game.listCards(),
  });

  const spinner = createSpinner('Creating your card...').start();
  clientEvents.emitCardDelete(answers.cardTitle);
  await sleep(1000);
  spinner.success({ text: `Card created!` });

  return;
}

async function cardVote() {
  await gameRender.render(game);
  const voteScale = game.getScale();
  const card = game.getCurrentCard();

  const voting = await inquirer.prompt({
    name: 'vote',
    type: 'list',
    message: `Select a effort point for the card: ${card.title} - ${card.description}`,
    choices: voteScale,
  });

  const spinner = createSpinner('Voting...').start();
  clientEvents.emitCardVote(card, new Vote(player, voting.vote));
  await sleep(1000);
  spinner.success({ text: `Vote saved!` });
  return;
}

async function cardReveal() {
  await gameRender.render(game);
  const card = game.getCurrentCard();

  const answers = await inquirer.prompt({
    name: 'reveal',
    type: 'confirm',
    message: 'Reveal the card voting?',
  });

  const spinner = createSpinner('Revealing votes...').start();
  if (answers.reveal) clientEvents.emitCardReveal(card);
  await sleep(1000);
  spinner.success({ text: `Votes revealed!` });
  return;
}

async function cardReset() {
  await gameRender.render(game);
  const card = game.getCurrentCard();

  const answers = await inquirer.prompt({
    name: 'reset',
    type: 'confirm',
    message: 'Do you really want to reset the card voting?',
  });

  const spinner = createSpinner('Reseting card...').start();
  if (answers.reset) clientEvents.emitCardReset(card);
  await sleep(1000);
  spinner.success({ text: `Card reseted!` });

  return;
}

async function cardSelect() {
  await gameRender.render(game);

  const answers = await inquirer.prompt({
    name: 'cardTitle',
    type: 'list',
    message: 'Select a card to vote',
    choices: game.listCards(),
  });

  const spinner = createSpinner('Selecting card...').start();
  clientEvents.emitCardSelect(answers.cardTitle);
  await sleep(1000);
  spinner.success({ text: `Card selected!` });
  return;
}

async function playerDelete() {
  await gameRender.render(game);

  const answers = await inquirer.prompt({
    name: 'playerName',
    type: 'list',
    message: 'Select a player to kick',
    choices: game.listPlayers(),
  });

  const spinner = createSpinner('Kicking player from the game...').start();
  clientEvents.emitPlayerDelete(answers.playerName);
  await sleep(1000);
  spinner.success({ text: `Player kicked!` });
  return;
}

function listGameMenuOptions() {
  let choices = [];

  if (game.isSomethingInVoting()) {
    choices.push('Vote the card');
  }

  if (game.isSomethingInVoting() && game.isHost(player)) {
    choices.push('Reveal the card');
    choices.push('Reset the card');
    choices.push(new inquirer.Separator());
  }

  if (game.getCardsCount() > 0 && game.isHost(player)) {
    choices.push('Pick a card');
  }

  if (game.isHost(player)) {
    choices.push('Create a card');
    choices.push('Delete a card');
  }

  if (game.isHost(player) && game.getPlayersCount() > 1) {
    choices.push(new inquirer.Separator());
    choices.push('Kick a player');
  }

  choices.push(new inquirer.Separator());
  choices.push('Refresh');
  choices.push('Exit to main Menu');
  return choices;
}
