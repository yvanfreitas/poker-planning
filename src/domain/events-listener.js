import { createWithState } from '../domain/game.js';

export default class EventsListener {
  constructor() {
    socket.on('game-input', (data) => {
      game?.eventsHandler.enqueueToEvents(data);
    });

    socket.on('connect', () => {
      game?.eventsHandler.emitQueue();
    });

    /*socket.on('disconnect', () => {
      console.clear();
      console.log('Connection lost! Trying to reconnect!');
      connectionLoss = true;
      global.prompter = null;
    });*/
  }
}
