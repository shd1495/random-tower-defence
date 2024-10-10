import { getGameAssets } from '../init/assets.js';
import { getGameData, initialGameData } from '../models/gameModel.js';
import { setWaveLevel, clearWaveLevel } from '../models/waveLevelModel.js';
import { clearMonsters, getMonsters } from '../models/monsterModel.js';

export const gameStart = async (uuid, payload, socket) => {
  const { game, waveLevel } = getGameAssets();

  await initialGameData(uuid, game);
  await setWaveLevel(uuid, waveLevel.data[0].id);

  const gameData = await getGameData(uuid);
  setWaveLevel(uuid, waveLevel.data[0].id);

  return {
    status: 'success',
    type: 'gameStart',
    result: gameData,
  };
};

export const gameEnd = async (uuid, payload, socket) => {
  const { timestamp, score } = payload;
  const { game, monster } = getGameAssets();

  clearWaveLevel(uuid);
  clearMonsters(uuid);
  await getMonsters();

  return { status: 'success', type: 'gameEnd', message: 'game over' };
};
