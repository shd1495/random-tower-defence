import redisClient from '../init/redis.js';

// 모든 유저의 최고 점수를 저장할 키
const MONSTER_SET = 'monster';

/**
 * 유저 몬스터 목록 초기화
 * @param {String} uuid
 */
export const clearMonsters = async (uuid) => {
  try {
    redisClient.del(MONSTER_SET + uuid);
  } catch (error) {
    console.error(`error clearMonsters for user ${uuid}`);
  }
};

/**
 * 처치한 몬스터 업데이트
 * @param {String} uuid
 * @param {Object} monsters
 */
export const setMonster = async (uuid, monsters) => {
  try {
    await redisClient.rpush(MONSTER_SET + uuid, JSON.stringify(monsters));
  } catch (error) {
    console.error(`error setMonster for user ${uuid}`);
  }
};

/**
 * 유저가 처치한 몬스터 목록 조회
 * @param {String} uuid
 * @returns {Object}
 */
export const getMonsters = async (uuid) => {
  try {
    const monsters = await redisClient.lrange(MONSTER_SET + uuid, 0, -1);
    const result = monsters.map((monster) => JSON.parse(monster));
    return result;
  } catch (error) {
    console.error(`error getMonster for user ${uuid}`);
  }
};
