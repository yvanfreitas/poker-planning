import { v4 as uuidv4 } from 'uuid';
export default class Game {
  state = {
    id: '',
    name: '',
    scale: '',
    host: '',
    players: [],
    cards: [],
    currentCard: null,
  };

  constructor(name, scale) {
    this.state.id = uuidv4();
    this.state.name = name;
    this.state.scale = scale;
  }
  join(player) {
    if (this.state.players.length < 1) this.state.host = player;
    this.state.players.push(player);
  }
  getState() {
    return this.state;
  }
  insertCard(card) {
    this.state.cards.push(card);
  }
  removeCardByTitle(title) {
    const cardToRemove = this.state.cards.filter((card) => card.title == title)[0];
    if (this.state.currentCard == cardToRemove) this.state.currentCard = null;
    this.state.cards = this.state.cards.filter((card) => card !== cardToRemove);
  }
  removePlayerByName(name) {
    this.state.players = this.state.players.filter((player) => player.name !== name);
  }
  listCards() {
    return this.state.cards.map((card) => card.title);
  }
  listPlayers() {
    return this.state.players.map((card) => card.name);
  }
  listPlayersExceptHost() {
    let players = this.state.players.filter((player) => player.id != this.state.host.id);
    return players.map((card) => card.name);
  }
  selectCardByTitle(title) {
    let selectedCard = this.state.cards.filter((card) => card.title == title)[0];
    this.state.currentCard = selectedCard;
  }
  isSomethingInVoting() {
    return this.state.currentCard != null;
  }
  isHost(player) {
    return this.state.host.id == player.id ? true : false;
  }
  getScale() {
    return this.state.scale;
  }
  getCurrentCard() {
    return this.state.currentCard;
  }
  getCardsCount() {
    return this.state.cards.length;
  }
  getPlayersCount() {
    return this.state.players.length;
  }
  getId() {
    return this.state.id;
  }
  vote(cardParam, newVote) {
    let card = this.state.cards.filter((card) => card.id == cardParam.id)[0];
    card.votes = card.votes.filter((vote) => vote.player.id != newVote.player.id);
    card.votes.push(newVote);
  }
  reveal(cardParam) {
    let card = this.state.cards.filter((card) => card.id == cardParam.id)[0];
    card.revealed = true;
  }
  reset(cardParam) {
    let card = this.state.cards.filter((card) => card.id == cardParam.id)[0];
    card.votes = [];
    card.revealed = false;
  }
}

export function createWithState(state) {
  const game = new Game();
  game.state = state;
  return game;
}
