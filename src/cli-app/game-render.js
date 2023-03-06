import chalk from 'chalk';
import gradient from 'gradient-string';
import chalkAnimation from 'chalk-animation';
import figlet from 'figlet';

export default class GameRender {
  sleep = (ms = 10) => new Promise((r) => setTimeout(r, ms));
  game;
  headerInfo = ` by yvan.freitas `.padStart(69, '-') + '-';
  separator = ``.padStart(70, '-');

  async render(game) {
    this.game = game;
    console.clear();
    await this.header();
    await this.gameInfo();
    await this.cardsInfo();
    await this.footer();
    return;
  }

  async header() {
    figlet(`Planning Poker`, (err, data) => {
      console.log(gradient.pastel.multiline(data));
      console.log(chalk.hex('#666')(this.headerInfo));
    });
    await this.sleep();
    return;
  }

  async gameInfo() {
    if (!this.game) return;
    console.log(
      chalk.hex('#fff')(`${this.game.state.name}`.padEnd(70 - 36, ' ')) +
        chalk.hex('#666')(`${this.game.state.id}`),
    );

    console.log(
      chalk.hex('#666')(`players: `) +
        chalk.hex('#F66')(JSON.stringify(this.game.state.players.map((player) => player.name))),
    );
  }

  async cardsInfo() {
    if (!this.game) return;
    if (!this.game.state.cards.length > 0) return;
    console.log(chalk.hex('#666')(this.separator));

    console.log(chalk.bold(`cards:`));
    this.game.state.cards.forEach((card) => {
      let cardInfo = ' ';
      let votesInfo;
      let cardHaveVotes = card.votes.length > 0;
      let isTheCurrentCard = card == this.game.state.currentCard;

      if (card.title) cardInfo += chalk.bold(card.title);
      if (cardInfo != ' ' && card.description != '') cardInfo += chalk.dim(' | ');
      if (card.description) cardInfo += chalk.dim(card.description);

      if (cardHaveVotes) {
        votesInfo = '  votes: ';
        card.votes.forEach((vote) => {
          let name = vote.player.name;
          let voteValue = card.revealed ? vote.vote : 'X';
          votesInfo += `${name}: ${voteValue}  `;
        });
        votesInfo = chalk.hex('#F66')(votesInfo);
      }

      if (isTheCurrentCard) {
        cardInfo = chalk.hex('#F66')(cardInfo);
      }

      console.log(cardInfo);
      if (cardHaveVotes && isTheCurrentCard) console.log(votesInfo);
    });
  }

  async footer() {
    if (!this.game) return;
    console.log(chalk.hex('#666')(this.separator));
  }
}
