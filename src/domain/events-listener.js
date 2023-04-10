import EventsHandler from './events-handler.js';

export default class EventsListener {
  constructor() {
    const eventsHandler = new EventsHandler();

    socket.on('game-input', (data) => {
      eventsHandler.enqueueToEvents(data);
    });

    socket.on('connect', () => {
      eventsHandler.emitQueue();
    });
  }
}
