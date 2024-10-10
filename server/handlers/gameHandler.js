import { getGameAssets } from '../init/assets.js';
import { getGameData, initialGameData } from '../models/gameModel.js';
import { getMonsters } from '../models/monsterModel.js';
import { setWaveLevel } from '../models/waveLevelModel.js';

export const gameStart = async (uuid, payload, socket) => {
  const { game, waveLevel } = getGameAssets();

  await initialGameData(uuid, game);
  await setWaveLevel(uuid, waveLevel.data[0].id);

  const gameData = await getGameData(uuid);

  return {
    status: 'success',
    type: 'gameStart',
    data: gameData,
  };
};

export const gameEnd = async (uuid, payload, socket) => {
  const { timestamp, score } = payload;
  const { game, monster } = getGameAssets();

  await getMonsters();

  return { status: 'success', type: 'gameEnd', message: 'game over' };
};
