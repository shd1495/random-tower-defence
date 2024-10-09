import { getGameAssets } from '../init/assets.js';

export const gameStart = (uuid, payload, socket) => {
  const { user } = getGameAssets();

  const { userGold, baseHp, towerCost, numOfInitialTowers, monsterLevel, monsterSpawnInterval } =
    user.data;

  try {
    socket.emit('gameStart', {
      status: 'success',
      userGold: userGold,
      baseHp: baseHp,
      towerCost: towerCost,
      numOfInitialTowers: numOfInitialTowers,
      monsterLevel: monsterLevel,
      monsterSpawnInterval: monsterSpawnInterval,
    });
  } catch (error) {
    socket.emit('gameStart', {
      status: 'failure',
      message: '게임 시작 데이터 로드에 실패했습니다.',
    });
  }
};

export const gameEnd = (uuid, payload, socket) => {
  const { timestamp, score } = payload;
  const { game, monster } = getGameAssets();

  socket.emit('gameEnd', { status: 'success', message: 'game over' });
};
