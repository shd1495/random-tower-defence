import { createGoldMonster } from './createGoldMonsterHandler.js';
import { gameEnd, gameStart } from './gameHandler.js';
import { attackedByMonster, killMonster } from './monsterHandler.js';
import { towerCreateInit, towerCreate, towerSell, towerUpgrade } from './towerHandler.js';
import { waveLevelIncrease } from './waveHandler.js';
import { useSlowEffect } from './slowEffectHandler.js';

const handlerMappings = {
  2: gameStart,
  3: gameEnd,
  11: killMonster,
  12: attackedByMonster,
  13: createGoldMonster,
  20: towerCreateInit,
  21: towerCreate,
  22: towerSell,
  23: towerUpgrade,
  31: waveLevelIncrease,
  32: useSlowEffect,
};

export default handlerMappings;
