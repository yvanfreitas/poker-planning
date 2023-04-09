import inquirer from 'inquirer';
import { createSpinner } from 'nanospinner';
import { sleep } from '../domain/utils.js';
import Event from '../domain/event.js';

import Card from '../domain/card.js';
import Vote from '../domain/vote.js';

export async function gameMenu() {
  if (!game) return;
  await gameRender.render(game);
  prompter = await inquirer.prompt({
    name: 'game',
    type: 'list',
    message: 'Game Menu',
    choices: listGameMenuOptions(),
  });

  switch (prompter.game) {
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
  prompter = await inquirer.prompt([
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

  console.log('Creating the card...');
  const card = new Card(prompter.title.trim(), prompter.description.trim());

  const event = new Event(`card-create`, { card: card });
  game.eventsHandler.enqueueToEmit(event);

  while (!game.isCardCreated(card)) {
    await sleep(200);
  }

  console.log(`Card created!`);
  await sleep(1000);

  return;
}

async function cardDelete() {
  await gameRender.render(game);

  prompter = await inquirer.prompt({
    name: 'cardTitle',
    type: 'list',
    message: 'Select a card to delete',
    choices: game.listCards(),
  });

  console.log('Deleting the card...');
  const event = new Event(`card-delete`, { cardTitle: prompter.cardTitle });
  game.eventsHandler.enqueueToEmit(event);

  let cardDeleted = false;
  while (!cardDeleted) {
    if (connectionLoss) return (connectionLoss = false);
    cardDeleted = true;
    game.state.cards.forEach((card) => {
      if (card.title == prompter.cardTitle) cardDeleted = false;
    });
    await sleep(200);
  }

  console.log(`Card deleted!`);
  await sleep(1000);

  return;
}

async function cardVote() {
  await gameRender.render(game);
  const voteScale = game.getScale();
  const card = game.getCurrentCard();

  const voting = await inquirer.prompt({
    name: 'vote',
    type: 'list',
    message: `Select a effort point for the card "${card.title}"`,
    choices: voteScale,
  });

  console.log('Voting...');
  let vote = new Vote(player, voting.vote);

  const event = new Event(`card-vote`, { card: card, vote: vote });
  game.eventsHandler.enqueueToEmit(event);

  let voted = false;
  while (!voted) {
    if (connectionLoss) return (connectionLoss = false);
    card.votes.forEach((insertedVote) => {
      if (insertedVote.player.id == player.id && insertedVote.vote == vote.vote) voted = true;
    });
    await sleep(200);
  }

  console.log(`Vote saved!`);
  return;
}

async function cardReveal() {
  await gameRender.render(game);
  const card = game.getCurrentCard();

  prompter = await inquirer.prompt({
    name: 'reveal',
    type: 'confirm',
    message: 'Reveal the card voting?',
  });

  console.log('Revealing votes...');
  const event = new Event(`card-reveal`, { card: card });
  if (prompter.reveal) game.eventsHandler.enqueueToEmit(event);

  let revealed = false;
  while (!revealed) {
    if (connectionLoss) return (connectionLoss = false);
    revealed = card.revealed;
    await sleep(200);
  }

  console.log(`Votes revealed!`);
  return;
}

async function cardReset() {
  await gameRender.render(game);
  const card = game.getCurrentCard();

  prompter = await inquirer.prompt({
    name: 'reset',
    type: 'confirm',
    message: 'Do you really want to reset the card voting?',
  });

  console.log('Reseting card...');
  const event = new Event(`card-reset`, { card: card });
  if (prompter.reset) game.eventsHandler.enqueueToEmit(event);

  let reset = false;
  while (!reset) {
    if (connectionLoss) return (connectionLoss = false);
    if (card.revealed == false && card.votes.length == 0) reset = true;
    await sleep(200);
  }

  console.log(`Card reseted!`);
  return;
}

async function cardSelect() {
  await gameRender.render(game);

  prompter = await inquirer.prompt({
    name: 'cardTitle',
    type: 'list',
    message: 'Select a card to vote',
    choices: game.listCards(),
  });

  console.log('Selecting card...');
  const event = new Event(`card-select`, { cardTitle: prompter.cardTitle });
  game.eventsHandler.enqueueToEmit(event);

  let selected = false;
  while (!selected) {
    if (connectionLoss) return (connectionLoss = false);
    if (game.state.currentCard?.title == prompter.cardTitle) selected = true;
    await sleep(200);
  }

  console.log(`Card selected!`);
  return;
}

async function playerDelete() {
  await gameRender.render(game);

  const playerPrompt = await inquirer.prompt({
    name: 'name',
    type: 'list',
    message: 'Select a player to kick',
    choices: game.listPlayersExceptHost(),
  });

  console.log('Kicking player from the game...');
  const event = new Event(`player-delete`, { playerName: playerPrompt.name });
  game.eventsHandler.enqueueToEmit(event);

  await sleep(1000);

  console.log(`Player kicked!`);
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
  }

  if (game.getCardsCount() > 0 && game.isHost(player)) {
    choices.push('Delete a card');
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
