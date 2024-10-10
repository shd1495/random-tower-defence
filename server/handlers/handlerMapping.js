import { gameStart } from './gameHandler.js';
import { attackedByMonster, killMonster } from './monsterHandler.js';

const handlerMappings = {
  2: gameStart,
  11: killMonster,
  12: attackedByMonster,
};

export default handlerMappings;
