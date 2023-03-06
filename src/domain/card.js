export default class Card {
  title;
  description;
  votes = [];
  revealed = false;

  constructor(title, description) {
    this.title = title;
    this.description = description;
  }
}
