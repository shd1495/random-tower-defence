import { getGameAssets } from '../init/assets.js';
import { getGameData, initialGameData } from '../models/gameModel.js';
import { setWaveLevel, clearWaveLv } from '../models/waveLevelModel.js';
import { clearMonsters } from '../models/monsterModel.js';

export const gameStart = async (uuid, payload, socket) => {
  const { game, waveLevel } = getGameAssets();

  await initialGameData(uuid, game);

  const gameData = await getGameData(uuid);
  setWaveLevel(uuid, waveLevel.data[0].id);

  return {
    status: 'success',
    type: 'gameStart',
    data: gameData,
  };
};

export const gameEnd = (uuid, payload, socket) => {
  const { timestamp, score } = payload;
  const { game, monster } = getGameAssets();

  clearWaveLv(uuid);
  clearMonsters(uuid);

  return { status: 'success', type: 'gameEnd', message: 'game over' };
};
