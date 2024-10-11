import { getGameAssets } from '../init/assets.js';
import { clearGameData, getGameData, initialGameData } from '../models/gameModel.js';
import { setWaveLevel, clearWaveLevel } from '../models/waveLevelModel.js';
import { clearMonsters } from '../models/monsterModel.js';
import { clearTowers } from '../models/towerModel.js';
import { totalScore } from '../utils/scoreValidation.js';
import scoreService from '../services/scoreService.js';

export const gameStart = async (uuid, payload, socket) => {
  const { game, waveLevel } = getGameAssets();

  try {
    clearWaveLevel(uuid);
    clearMonsters(uuid);
    clearGameData(uuid);
    clearTowers(uuid);

    await initialGameData(uuid, game);
    await setWaveLevel(uuid, waveLevel.data[0].id);

    const highScore = await scoreService.getHighScore(uuid);
    const gameData = await getGameData(uuid);

    return {
      status: 'success',
      type: 'gameStart',
      result: gameData,
      highScore: highScore,
    };
  } catch (error) {
    console.error(error.message);
    return { status: 'fail', type: 'gameStart', message: error.message };
  }
};

export const gameEnd = async (uuid, payload, socket) => {
  const { timestamp, score } = payload;

  // 최고 점수
  try {
    const highScore = await scoreService.getHighScore(uuid);

    // 서버 점수와 클라 점수 검증
    const serverScore = await totalScore(uuid);
    if (score !== serverScore) {
      throw new Error('unmatched score');
    }

    // 최고 점수 갱신
    if (score > highScore) {
      await scoreService.updateHighScore(uuid, score, timestamp);
    }

    return { status: 'success', type: 'gameEnd', message: 'game over' };
  } catch (error) {
    console.error(error.message);
    return { status: 'fail', type: 'gameEnd', message: error.message };
  }
};
