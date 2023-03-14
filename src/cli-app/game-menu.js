import inquirer from 'inquirer';
import { createSpinner } from 'nanospinner';
import { sleep } from '../domain/utils.js';

import Card from '../domain/card.js';
import Vote from '../domain/vote.js';

export async function gameMenu() {
  if (!game) return;
  currentScreen = 'gameMenu';
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
  currentScreen = 'cardCreate';
  await gameRender.render(game);
  const cardPrompt = await inquirer.prompt([
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

  const spinner = createSpinner('Creating the card...').start();
  const card = new Card(cardPrompt.title.trim(), cardPrompt.description.trim());
  clientEvents.emitCardCreate(card);

  let cardCreated = false;
  while (!cardCreated) {
    if (connectionLoss) return (connectionLoss = false);
    game.state.cards.forEach((gameCard) => {
      if (gameCard.title == card.title && gameCard.description == card.description)
        cardCreated = true;
    });
    await sleep(200);
  }

  spinner.success({ text: `Card created!` });
  await sleep(1000);

  return;
}

async function cardDelete() {
  currentScreen = 'cardDelete';
  await gameRender.render(game);

  const answers = await inquirer.prompt({
    name: 'cardTitle',
    type: 'list',
    message: 'Select a card to delete',
    choices: game.listCards(),
  });

  const spinner = createSpinner('Deleting the card...').start();
  clientEvents.emitCardDelete(answers.cardTitle);

  let cardDeleted = false;
  while (!cardDeleted) {
    if (connectionLoss) return (connectionLoss = false);
    cardDeleted = true;
    game.state.cards.forEach((card) => {
      if (card.title == answers.cardTitle) cardDeleted = false;
    });
    await sleep(200);
  }

  spinner.success({ text: `Card deleted!` });
  await sleep(1000);

  return;
}

async function cardVote() {
  currentScreen = 'cardVote';
  await gameRender.render(game);
  const voteScale = game.getScale();
  const card = game.getCurrentCard();

  const voting = await inquirer.prompt({
    name: 'vote',
    type: 'list',
    message: `Select a effort point for the card "${card.title}"`,
    choices: voteScale,
  });

  const spinner = createSpinner('Voting...').start();
  let vote = new Vote(player, voting.vote);
  clientEvents.emitCardVote(card, vote);

  let voted = false;
  while (!voted) {
    if (connectionLoss) return (connectionLoss = false);
    card.votes.forEach((insertedVote) => {
      if (insertedVote.player.id == player.id && insertedVote.vote == vote.vote) voted = true;
    });
    await sleep(200);
  }

  spinner.success({ text: `Vote saved!` });
  return;
}

async function cardReveal() {
  currentScreen = 'cardReveal';
  await gameRender.render(game);
  const card = game.getCurrentCard();

  const answers = await inquirer.prompt({
    name: 'reveal',
    type: 'confirm',
    message: 'Reveal the card voting?',
  });

  const spinner = createSpinner('Revealing votes...').start();
  if (answers.reveal) clientEvents.emitCardReveal(card);

  let revealed = false;
  while (!revealed) {
    if (connectionLoss) return (connectionLoss = false);
    revealed = card.revealed;
    await sleep(200);
  }

  spinner.success({ text: `Votes revealed!` });
  return;
}

async function cardReset() {
  currentScreen = 'cardReset';
  await gameRender.render(game);
  const card = game.getCurrentCard();

  const answers = await inquirer.prompt({
    name: 'reset',
    type: 'confirm',
    message: 'Do you really want to reset the card voting?',
  });

  const spinner = createSpinner('Reseting card...').start();
  if (answers.reset) clientEvents.emitCardReset(card);

  let reset = false;
  while (!reset) {
    if (connectionLoss) return (connectionLoss = false);
    if (card.revealed == false && card.votes.length == 0) reset = true;
    await sleep(200);
  }

  spinner.success({ text: `Card reseted!` });

  return;
}

async function cardSelect() {
  currentScreen = 'cardSelect';
  await gameRender.render(game);

  const answers = await inquirer.prompt({
    name: 'cardTitle',
    type: 'list',
    message: 'Select a card to vote',
    choices: game.listCards(),
  });

  const spinner = createSpinner('Selecting card...').start();
  clientEvents.emitCardSelect(answers.cardTitle);

  let selected = false;
  while (!selected) {
    if (connectionLoss) return (connectionLoss = false);
    if (game.state.currentCard?.title == answers.cardTitle) selected = true;
    await sleep(200);
  }

  spinner.success({ text: `Card selected!` });
  return;
}

async function playerDelete() {
  currentScreen = 'playerDelete';
  await gameRender.render(game);

  const playerPrompt = await inquirer.prompt({
    name: 'name',
    type: 'list',
    message: 'Select a player to kick',
    choices: game.listPlayersExceptHost(),
  });

  const spinner = createSpinner('Kicking player from the game...').start();
  clientEvents.emitPlayerDelete(playerPrompt.name);

  let playerDeleted = false;
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

  if (game.isHost(player)) {
    choices.push('Create a card');
    choices.push('Delete a card');
  }

  if (game.getCardsCount() > 0 && game.isHost(player)) {
    choices.push('Pick a card');
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
