import redisClient from '../init/redis.js';
import { setWaveLevel } from './waveLevelModel.js';

const GAME_SET = 'game';

/**
 * 유저의 초기 게임 데이터를 redis에 저장
 * @param {String} uuid
 * @param {Object} game 유저의 게임 데이터
 */
export const initialGameData = async (uuid, game) => {
  const { userGold, baseHp, score, numOfInitialTowers, monsterLevel, monsterSpawnInterval } =
    game.data;
  const key = `user:${uuid}:${GAME_SET}`;

  const gameData = {
    userGold: userGold,
    baseHp: baseHp,
    score: score,
    numOfInitialTowers: numOfInitialTowers,
    monsterLevel: monsterLevel,
    monsterSpawnInterval: monsterSpawnInterval,
  };

  try {
    await redisClient.hset(key, gameData);
  } catch (error) {
    console.error(`error initializing game data for user ${uuid}`);
  }
};

/**
 * 유저의 게임 데이터를 조회
 * @param {String} uuid
 * @returns {Object || null} gameData
 */
export const getGameData = async (uuid) => {
  const key = `user:${uuid}:${GAME_SET}`;

  try {
    const gameData = await redisClient.hgetall(key);

    if (Object.keys(gameData).length == 0) return null;

    return gameData;
  } catch (error) {
    console.error(`error reading game data for user ${uuid}`);
    return null;
  }
};

/**
 * 게임 데이터 초기화
 * @param {String} uuid
 */
export const clearGameData = (uuid) => {
  const key = `user:${uuid}:${GAME_SET}`;
  try {
    redisClient.del(key);
  } catch (error) {
    console.error(`error delete game data for user ${uuid}`);
  }
};

/**
 * 유저 점수 조회
 * @param {String} uuid
 * @returns {Int} score
 */
export const getScore = async (uuid) => {
  const key = `user:${uuid}:${GAME_SET}`;
  try {
    const score = await redisClient.hget(key, 'score');
    return score;
  } catch (error) {
    console.error(`error getScore game data for user ${uuid}`);
  }
};

/**
 * 유저 점수 갱신
 * @param {String} uuid
 * @param {Int} amount
 */
export const updateScore = async (uuid, amount) => {
  const key = `user:${uuid}:${GAME_SET}`;
  try {
    const score = await getScore(uuid);
    await redisClient.hset(key, 'score', +score + +amount);
  } catch (error) {
    console.error(`error updateScore game data for user ${uuid}`);
  }
};

/**
 * 유저 골드 조회
 * @param {String} uuid
 * @returns {Int}
 */
export const getUserGold = async (uuid) => {
  const key = `user:${uuid}:${GAME_SET}`;
  try {
    const userGold = await redisClient.hget(key, 'userGold');
    return userGold;
  } catch (error) {
    console.error(`error getUserGold game data for user ${uuid}`);
  }
};

/**
 * 유저 골드 갱신
 * @param {String} uuid
 * @param {Int} amount
 */
export const updateUserGold = async (uuid, amount) => {
  const key = `user:${uuid}:${GAME_SET}`;
  try {
    const userGold = await getUserGold(uuid);
    amount = Math.floor(amount);

    await redisClient.hset(key, 'userGold', +userGold + +amount);
  } catch (error) {
    console.error(`error updateUserGold game data for user ${uuid}`);
  }
};

/**
 * 유저 몬스터 스폰 간격 갱신
 * @param {String} uuid
 * @param {Int} amount
 */
export const updateMonsterSpawnInterval = async (uuid, amount) => {
  const key = `user:${uuid}:${GAME_SET}`;
  try {
    await redisClient.hset(key, 'monsterSpawnInterval', +amount);
  } catch (error) {
    console.error(`error updateMonsterSpawnInterval game data for user ${uuid}`);
  }
};

/**
 * 유저 슬로운 장판 사용횟수 갱신
 * @param {String} uuid
 * @param {Int} count
 */
export const updateSlowEffectCount = async (uuid, count) => {
  const key = `user:${uuid}:${GAME_SET}`;
  try {
    await redisClient.hset(key, 'slowEffectCount', count);
  } catch (error) {
    console.error(`error updateSlowEffectCount ${uuid}`);
  }
};
