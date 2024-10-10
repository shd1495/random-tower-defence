import redisClient from '../init/redis.js';

const GAME_SET = 'game';

/**
 * 유저의 초기 게임 데이터를 redis에 저장
 * @param {String} uuid
 * @param {Object} game 유저의 게임 데이터
 */
export const initialGameData = async (uuid, game) => {
  const {
    userGold,
    baseHp,
    towerCost,
    score,
    numOfInitialTowers,
    monsterLevel,
    monsterSpawnInterval,
    monsterKillList,
    towerList,
  } = game.data;
  const key = `user:${uuid}:${GAME_SET}`;

  const gameData = {
    userGold: userGold,
    baseHp: baseHp,
    towerCost: towerCost,
    score: score,
    numOfInitialTowers: numOfInitialTowers,
    monsterLevel: monsterLevel,
    monsterSpawnInterval: monsterSpawnInterval,
    monsterKillList: monsterKillList,
    towerList: towerList,
  };

  try {
    await redisClient.hset(key, gameData);
    console.log(`game data initialized for user ${uuid}`);
  } catch (error) {
    console.error(`error initializing game data for user ${uuid}`);
  }

  // 업데이트 시
  // redisClient.hset(key, "userGold", 3500)
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
