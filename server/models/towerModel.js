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
    // 모든 타워 가져오기
    const towers = await redisClient.lrange(TOWER_SET + uuid, 0, -1);

    // Redis에서 가져온 타워 데이터를 JSON 문자열에서 자바스크립트 객체로 변환
    const result = towers.map((tower) => JSON.parse(tower));

    // 변환 값 return
    return result;
  } catch (error) {
    console.error(`error getTowers for user ${uuid}`);
  }
};

/**
 * 유저의 특정 타워 조회
 * @param {String} uuid
 * @param {String} uniqueId
 * @returns {Object | null}
 */
export const getTower = async (uuid, uniqueId) => {
  try {
    // 모든 타워 가져오기
    const towers = await redisClient.lrange(TOWER_SET + uuid, 0, -1);

    // 특정 타워 찾기
    const tower = towers.find((tower) => JSON.parse(tower).uniqueId === uniqueId);

    // 타워가 존재하면 반환, 그렇지 않으면 null 반환
    return tower ? JSON.parse(tower) : null;
  } catch (error) {
    console.error(`error getTower for user ${uuid}`);
  }
};

/**
 * 유저 타워 설치
 * @param {String} uuid
 * @param {int} uniqueId
 * @param {int} towerId
 * @param {Object} tower
 */
export const setTower = async (uuid, uniqueId, towerId, tower, posX, posY) => {
  try {
    // ...tower를 사용했을 때 에러가 발생을 방지하기 위해 객체 생성
    const newTower = {
      uniqueId: uniqueId,
      towerId: towerId,
      ...tower,
      posX: posX,
      posY: posY,
    };

    await redisClient.rpush(TOWER_SET + uuid, JSON.stringify(newTower));
  } catch (error) {
    console.error(`error setTower for user ${uuid}`);
  }
};

/**
 * 타워 제거
 * @param {String} uuid
 * @param {int} uniqueId
 */
export const removeTower = async (uuid, uniqueId) => {
  try {
    // redisClient.del(uuid) : uuid라는 키 삭제용
    // redisClient.srem(TOWER_SET, uuid) : SET 에서 uuid 멤버 제거용

    // 모든 타워 가져오기
    const towers = await redisClient.lrange(TOWER_SET + uuid, 0, -1);

    // 삭제할 타워 찾기
    const indexToRemove = towers.findIndex((tower) => JSON.parse(tower).uniqueId === uniqueId);

    // 해당 타워 삭제
    if (indexToRemove !== -1) await redisClient.lrem(TOWER_SET + uuid, 1, towers[indexToRemove]);
  } catch (error) {
    console.error(`error removeTower for user ${uuid}`);
  }
};

/**
 * 타워 업그레이드
 * @param {String} uuid
 * @param {Object} nextGradeTower
 * @param {int} beforeUniqueId
 * @param {int} afterUniqueId
 * @param {int} posX
 * @param {int} posY
 */
export const upgradeTower = async (
  uuid,
  beforeUniqueId,
  afterUniqueId,
  nextGradeTower,
  posX,
  posY,
) => {
  try {
    // 모든 타워 가져오기
    const towers = await redisClient.lrange(TOWER_SET + uuid, 0, -1);
    // 업그레이드 할 타워 인덱스
    const indexToRemove = towers.findIndex(
      (tower) => JSON.parse(tower).uniqueId === beforeUniqueId,
    );
    // 타워 교체
    if (indexToRemove !== -1) await redisClient.lrem(TOWER_SET + uuid, 1, towers[indexToRemove]);

    const newTower = {
      uniqueId: afterUniqueId,
      ...nextGradeTower,
      posX: posX,
      posY: posY,
    };
    await redisClient.rpush(TOWER_SET + uuid, JSON.stringify(newTower));
  } catch (error) {
    console.error(`error upgradeTower for user ${uuid}`);
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
    console.error(`error clearTowers for user ${uuid}`);
  }
};
