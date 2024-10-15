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
    if (!highScore && highScore !== 0)
      return { status: 'fail', type: 'gameStart', message: 'can not read highScore.' };

    const gameData = await getGameData(uuid);
    if (!gameData) return { status: 'fail', type: 'gameStart', message: 'can not read gameData.' };

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
    if (!serverScore && serverScore !== 0)
      return { status: 'fail', type: 'gameEnd', message: 'can not reading serverScore' };
    console.log('score: ', score);
    console.log('serverScore: ', serverScore);
    if (Math.abs(score - serverScore) > 200) {
      // 데이터 통신 간격으로 인해 차이나는 오차(100~200) 제외
      return { status: 'fail', type: 'gameEnd', message: 'unmatched score = server' };
    }

    // 최고 점수 갱신
    if (score > highScore) await scoreService.updateHighScore(uuid, score, timestamp);

    return { status: 'success', type: 'gameEnd', message: 'game over' };
  } catch (error) {
    console.error(error.message);
    return { status: 'fail', type: 'gameEnd', message: error.message };
  }
};
