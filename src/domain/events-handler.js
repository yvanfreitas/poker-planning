import Event from './event.js';
export default class EventsHandler {
  eventsToEmitQueue = [];
  eventsQueue = [];

  enqueueToEmit(event) {
    this.eventsToEmitQueue.push(event);
    this.emitQueue();
  }

  enqueueToEvents(event) {
    this.eventsQueue.push(new Event(null, null, event));
    this.processEventsQueue();
  }

  emitQueue() {
    let eventsToEmit = this.eventsToEmitQueue.filter((event) => event.status == 'pending');

    eventsToEmit.forEach((event) => {
      if (!socket.connected) return;
      event.emit();
    });
  }

  processEventsQueue() {
    let eventsToProcess = this.eventsQueue.filter(
      (event) => event.status == 'pending' && event.playerId != player.Id,
    );

    eventsToProcess.forEach((event) => {
      event.process();
      //eventsToProcess.splice(eventsToProcess.indexOf(event), 1);
    });
  }
}
