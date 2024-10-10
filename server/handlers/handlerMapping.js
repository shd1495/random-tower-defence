import { gameStart } from './gameHandler.js';
import { attackedByMonster, killMonster } from './monsterHandler.js';
import { waveLevelIncrease } from './waveHandler.js';

const handlerMappings = {
  2: gameStart,
  11: killMonster,
  12: attackedByMonster,
  31: waveLevelIncrease,
};

export default handlerMappings;
