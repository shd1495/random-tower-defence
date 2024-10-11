import { getGameAssets } from '../init/assets.js';
import { clearGameData, getGameData, initialGameData } from '../models/gameModel.js';
import { setWaveLevel, clearWaveLevel } from '../models/waveLevelModel.js';
import { clearMonsters, getMonsters } from '../models/monsterModel.js';
import { clearTowers } from '../models/towerModel.js';

export const gameStart = async (uuid, payload, socket) => {
  const { game, waveLevel } = getGameAssets();

  clearWaveLevel(uuid);
  clearMonsters(uuid);
  clearGameData(uuid);
  clearTowers(uuid);

  await initialGameData(uuid, game);
  await setWaveLevel(uuid, waveLevel.data[0].id);

  const gameData = await getGameData(uuid);

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
  clearGameData(uuid);
  clearTowers(uuid);

  return { status: 'success', type: 'gameEnd', message: 'game over' };
};
