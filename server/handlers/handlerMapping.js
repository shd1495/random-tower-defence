import { gameStart } from './gameHandler.js';
import { attackedByMonster, killMonster } from './monsterHandler.js';
import { towerCreate, towerSale } from './towerHandler.js';

const handlerMappings = {
  2: gameStart,
  11: killMonster,
  12: attackedByMonster,
  21: towerCreate,
  22: towerSale,
};
export default handlerMappings;
