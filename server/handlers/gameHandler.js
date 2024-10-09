import { getGameAssets } from '../init/assets.js';

export const gameStart = (uuid, payload, socket) => {
  const { user } = getGameAssets();

  const { userGold, baseHp, towerCost, numOfInitialTowers, monsterLevel, monsterSpawnInterval } =
    user.data;

  return {
    status: 'success',
    type: 'gameStart',
    data: {
      userGold: userGold,
      baseHp: baseHp,
      towerCost: towerCost,
      numOfInitialTowers: numOfInitialTowers,
      monsterLevel: monsterLevel,
      monsterSpawnInterval: monsterSpawnInterval,
    },
  };
};

export const gameEnd = (uuid, payload, socket) => {
  const { timestamp, score } = payload;
  const { game, monster } = getGameAssets();

  return { status: 'success', type: 'gameEnd', message: 'game over' };
};
