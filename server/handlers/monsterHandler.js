import { setMonster } from '../models/monsterModel.js';
import { getWaveLevel } from '../models/waveLevelModel.js';
import { getGameAssets } from '../init/assets.js';
import { getScore, getUserGold, updateScore, updateUserGold } from '../models/gameModel.js';

/**
 * @param {String} userId
 * @param {object} payload
 * @returns {object}
 */
export const attackedByMonster = async (userId, payload) => {
  const { monsters, waveLevel } = getGameAssets();
  const { monsterId, attackPower } = payload;

  // 몬스터 아이디 유효성 검증
  const isExistMonster = monsters.data.find((monster) => monster.id === monsterId);

  if (!isExistMonster) {
    return {
      status: '실패',
      type: 'attackedByMonster',
      message: '게임에 존재하지 않는 몬스터 정보입니다.',
    };
  }

  // 현재 웨이브 레벨 검증
  const waveLevelData = await getWaveLevel(userId);

  // 웨이브 레벨 동기화
  let currentWave = waveLevel.data.find((level) => level.id === waveLevelData);
  if (!currentWave) {
    currentWave = waveLevel.data[0]; // 기본 웨이브로 설정
  }

  // 데미지 동기화
  const attackPowerSync = waveLevelData * attackPower;

  return {
    status: '성공',
    message: `기지 HP가 ${attackPowerSync}만큼 하락합니다.`,
    type: 'attackedByMonster',
    result: { attackPowerSync, waveLevelData },
  };
};

/**
 * @param {String} userId
 * @param {object} payload
 * @returns {object}
 */
export const killMonster = async (userId, payload) => {
  const { waveLevel, monsters } = getGameAssets();
  const { monsterId, incrementScore, incrementMoney } = payload;

  // 몬스터 아이디 유효성 검증
  const isExistMonster = monsters.data.find((monster) => monster.id === monsterId);

  if (!isExistMonster) {
    return {
      status: '실패',
      message: '게임에 존재하지 않는 몬스터 정보입니다.',
    };
  }

  // 현재 웨이브 레벨 검증
  const waveLevelData = await getWaveLevel(userId);

  // 웨이브 레벨 동기화
  let currentWave = waveLevel.data.find((level) => level.id === waveLevelData);
  if (!currentWave) {
    currentWave = waveLevel.data[0]; // 기본 웨이브로 설정
  }

  // 보상 및 점수 동기화
  const incrementMoneySync = waveLevelData * isExistMonster.reward;
  const incrementScoreSync = waveLevelData * isExistMonster.score;

  // 점수와 골드 업데이트
  await updateScore(userId, incrementScoreSync);
  await updateUserGold(userId, incrementMoneySync);
  const score = await getScore(userId);
  const userGold = await getUserGold(userId);
  await setMonster(userId, { monsterId: monsterId, waveLevelData });

  return {
    status: '성공',
    type: 'killMonster',
    result: { score, userGold },
  };
};
