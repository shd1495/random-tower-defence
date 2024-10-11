import { createGoldMonster } from './createGoldMonsterHandler.js';
import { gameEnd, gameStart } from './gameHandler.js';
import { attackedByMonster, killMonster } from './monsterHandler.js';
import { towerCreateInit, towerCreate, towerSell } from './towerHandler.js';
import { waveLevelIncrease } from './waveHandler.js';

const handlerMappings = {
  2: gameStart,
  3: gameEnd,
  11: killMonster,
  12: attackedByMonster,
  13: createGoldMonster,
  20: towerCreateInit,
  21: towerCreate,
  22: towerSell,
  31: waveLevelIncrease,
};

export default handlerMappings;
