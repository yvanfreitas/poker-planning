import { createWithState } from '../domain/game.js';

export default class ClientEvents {
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
    socket.emit('game-input', {
      event: `game-join`,
      data: { player: player, gameId: game.state.id },
    });
  }
  emitRequestState(gameId) {
    socket.emit('game-input', {
      event: `request-state`,
      data: { player: player, gameId: gameId },
    });
  }
  emitState(requester) {
    socket.emit('game-input', {
      event: `game-state`,
      data: { requester: requester, player: player, state: game.getState() },
    });
  }
  emitCardCreate(card) {
    socket.emit('game-input', {
      event: `card-create`,
      data: { card: card },
    });
  }
  emitCardDelete(cardTitle) {
    socket.emit('game-input', {
      event: `card-delete`,
      data: { cardTitle: cardTitle },
    });
  }
  emitCardVote(card, vote) {
    socket.emit('game-input', {
      event: `card-vote`,
      data: { card: card, vote: vote },
    });
  }
  emitCardReveal(card) {
    socket.emit('game-input', {
      event: `card-reveal`,
      data: { card: card },
    });
  }
  emitCardReset(card) {
    socket.emit('game-input', {
      event: `card-reset`,
      data: { card: card },
    });
  }
  emitCardSelect(cardTitle) {
    socket.emit('game-input', {
      event: `card-select`,
      data: { cardTitle: cardTitle },
    });
  }
  emitPlayerDelete(playerName) {
    socket.emit('game-input', {
      event: `player-delete`,
      data: { playerName: playerName },
    });
  }
}
