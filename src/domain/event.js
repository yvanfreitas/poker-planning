import { createWithState } from './game.js';
export default class Event {
  playerId;
  eventName;
  data;
  status;
  gameId;

  constructor(eventName, data, event) {
    this.status = 'pending';
    this.playerId = player.id;
    this.eventName = eventName;
    this.data = data;
    this.gameId = game?.state.id;
    if (event) {
      this.playerId = event.playerId;
      this.eventName = event.eventName;
      this.data = event.data;
      this.status = event.status;
    }
  }
  process() {
    //console.log('------- processing -------');
    //console.log(this);
    switch (this.eventName) {
      case 'request-state':
        if (game?.isHost(player))
          game.eventsHandler.enqueueToEmit(
            new Event(`game-state`, {
              requester: this.data.player,
              player: player,
              state: game.getState(),
            }),
          );

        break;
      case 'game-state':
        if (this.data.requester.id == player.id) {
          game = createWithState(this.data.state);
        }
        break;
      case 'game-join':
        game.join(this.data.player);
        break;
      case 'card-create':
        game.insertCard(this.data.card);
        break;
      case 'card-delete':
        game.removeCardByTitle(this.data.cardTitle);
        break;
      case 'card-vote':
        game.vote(this.data.card, this.data.vote);
        break;
      case 'card-reveal':
        game.reveal(this.data.card);
        break;
      case 'card-reset':
        game.reset(this.data.card);
        break;
      case 'card-select':
        game.selectCardByTitle(this.data.cardTitle);
        break;
      case 'player-delete':
        game.removePlayerByName(this.data.playerName);
        if (this.data.playerName == player.name) {
          game = null;
        }
        break;
      default:
        console.log('Unknown event received: ' + this.eventName);
        break;
    }
    this.status = 'processed';
  }

  emit() {
    socket.emit('game-input', this);
    this.status = 'emitted';
    //console.log('------- emiting-------');
    //console.log(this);
  }
}
