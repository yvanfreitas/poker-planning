import { v4 as uuidv4 } from 'uuid';

export default class Player {
  name;
  id;

  constructor(playerName) {
    this.name = playerName;
    this.id = uuidv4();
  }
}
