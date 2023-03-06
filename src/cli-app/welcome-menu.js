import inquirer from 'inquirer';
import { createSpinner } from 'nanospinner';
import { sleep } from '../domain/utils.js';
import Player from '../domain/player.js';

export async function welcomeMenu() {
  if (player) return;
  await gameRender.render(game);
  console.log('Welcome to Planning Poker CLI Application.');
  const answers = await inquirer.prompt({
    name: 'player_name',
    type: 'input',
    message: 'Before we start, how could I call you?',
    default() {
      return 'Player';
    },
  });

  player = new Player(answers.player_name);
}
