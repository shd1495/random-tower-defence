import { getGameAssets } from '../init/assets.js';
import { getGameData, initialGameData } from '../models/gameModel.js';

export const gameStart = async (uuid, payload, socket) => {
  const { game } = getGameAssets();

  await initialGameData(uuid, game);

  const gameData = await getGameData(uuid);

  return {
    status: 'success',
    type: 'gameStart',
    data: gameData,
  };
};

export const gameEnd = (uuid, payload, socket) => {
  const { timestamp, score } = payload;
  const { game, monster } = getGameAssets();

  return { status: 'success', type: 'gameEnd', message: 'game over' };
};
