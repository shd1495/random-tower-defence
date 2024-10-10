import redisClient from '../init/redis.js';

// 현재 유저의 배치 타워를 저장할 키
const TOWER_SET = 'tower';

/**
 * 유저의 타워 목록 조회
 * @param {String} uuid
 * @returns {Object}
 */
export const getTowers = async (uuid) => {
  try {
    const towers = await redisClient.lrange(TOWER_SET + uuid, 0, -1);
    const result = towers.map((tower) => JSON.parse(tower));
    return result;
  } catch (error) {
    throw new Error('[타워 목록 조회]에러가 발생했습니다.' + error.message);
  }
};

/**
 * 유저 타워 설치
 * @param {String} uuid
 * @param {Object} tower
 */
export const setTower = async (uuid, towerId, tower) => {
  try {
    //const newTower = await new tower.Tower(locationX, locationY)
    //const newTowerImage = await new Image();
    //newTowerImage.src = image;
    await redisClient.rpush(TOWER_SET + uuid, JSON.stringify(towerId, tower));
  } catch (error) {
    throw new Error('[타워 설치]에러가 발생했습니다.' + error.message);
  }
};

/**
 * 타워 제거
 * @param {String} uuid
 */
export const removeTower = async (uuid) => {
  try {
    // 제거 로직 필요
    /** 참고한 구문
        // redisClient.del(uuid);
        // // 유저 UUID를 세트에서 제거
        // redisClient.srem(TOWER_SET, uuid);
        */
  } catch (error) {
    throw new Error('[타워 제거]에러가 발생했습니다.' + error.message);
  }
};

/**
 * 유저 타워 목록 초기화
 * @param {String} uuid
 */
export const clearTowers = async (uuid) => {
  try {
    await redisClient.del(TOWER_SET + uuid);
  } catch (error) {
    throw new Error('[타워 목록 초기화]에러가 발생했습니다.', error.message);
  }
};
