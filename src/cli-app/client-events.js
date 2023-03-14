import { createWithState } from '../domain/game.js';
import { mainMenu } from './main-menu.js';
import { gameMenu } from './game-menu.js';

export default class ClientEvents {
  eventsQueue = [];

  constructor() {
    socket.on('request-state', (data) => {
      let requester = data.player;
      if (game?.isHost(player)) this.emitState(requester);
    });

    socket.on('game-state', (data) => {
      if (data.requester.id == player.id) {
        game = createWithState(data.state);
      }
    });

    socket.on('game-join', (data) => {
      game.join(data.player);
    });

    socket.on('card-create', (data) => {
      game.insertCard(data.card);
    });

    socket.on('card-delete', (data) => {
      game.removeCardByTitle(data.cardTitle);
    });

    socket.on('card-vote', (data) => {
      game.vote(data.card, data.vote);
    });

    socket.on('card-reveal', (data) => {
      game.reveal(data.card);
    });

    socket.on('card-reset', (data) => {
      game.reset(data.card);
    });

    socket.on('card-select', (data) => {
      game.selectCardByTitle(data.cardTitle);
    });

    socket.on('player-delete', (data) => {
      game.removePlayerByName(data.playerName);
      if (data.playerName == player.name) {
        game = null;
      }
    });
  }
  emitGameJoin() {
    this.addToQueue({
      event: `game-join`,
      data: { player: player, gameId: game.state.id },
    });
  }
  emitRequestState(gameId) {
    this.addToQueue({
      event: `request-state`,
      data: { player: player, gameId: gameId },
    });
  }
  emitState(requester) {
    this.addToQueue({
      event: `game-state`,
      data: { requester: requester, player: player, state: game.getState() },
    });
  }
  emitCardCreate(card) {
    this.addToQueue({
      event: `card-create`,
      data: { card: card },
    });
  }
  emitCardDelete(cardTitle) {
    this.addToQueue({
      event: `card-delete`,
      data: { cardTitle: cardTitle },
    });
  }
  emitCardVote(card, vote) {
    this.addToQueue({
      event: `card-vote`,
      data: { card: card, vote: vote },
    });
  }
  emitCardReveal(card) {
    this.addToQueue({
      event: `card-reveal`,
      data: { card: card },
    });
  }
  emitCardReset(card) {
    this.addToQueue({
      event: `card-reset`,
      data: { card: card },
    });
  }
  emitCardSelect(cardTitle) {
    this.addToQueue({
      event: `card-select`,
      data: { cardTitle: cardTitle },
    });
  }
  emitPlayerDelete(playerName) {
    this.addToQueue({
      event: `player-delete`,
      data: { playerName: playerName },
    });
  }
  addToQueue(event) {
    this.eventsQueue.push(event);
    this.processQueue();
  }
  processQueue() {
    if (!socket.connected) return;

    let eventsToProcess = this.eventsQueue;

    this.eventsQueue.forEach((event) => {
      socket.emit('game-input', event);
      eventsToProcess.splice(eventsToProcess.indexOf(event), 1);
    });

    this.eventsQueue = eventsToProcess;
  }

  async refreshIfIsPossible() {
    if (currentScreen == 'mainMenu') await mainMenu();
    if (currentScreen == 'gameMenu') await gameMenu();
  }
}
