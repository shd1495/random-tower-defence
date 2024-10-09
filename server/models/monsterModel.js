import { redisClient } from "../init/redisConnect";

// 모든 유저의 최고 점수를 저장할 키
const MONSTER_SET = "monster";

/**
 * 유저 몬스터 목록 초기화
 * @param {String} uuid
 */
export const clearMonsters = async (uuid) => {
     try {
          redisClient.del(MONSTER_SET + uuid);
     } catch (error) {
          throw new Error(
               "몬스터 목록 초기화 시 에러가 발생했습니다.",
               error.message
          );
     }
};

/**
 * 처치한 몬스터 업데이트
 * @param {String} uuid
 * @param {Object} monsters
 */
export const setMonster = async (uuid, monsters) => {
     try {
          await redisClient.rpush(ITEM_SET + uuid, JSON.stringify(monsters));
     } catch (error) {
          throw new Error(
               "몬스터 업데이트 시 오류가 발생했습니다." + error.message
          );
     }
};

/**
 * 유저가 처치한 몬스터 목록 조회
 * @param {String} uuid
 * @returns {Object}
 */
export const getMonster = async (uuid) => {
     try {
          const monsters = await redisClient.lrange(MONSTER_SET + uuid, 0, -1);
          const result = monsters.map((monster) => JSON.parse(monster));
          return result;
     } catch (error) {
          throw new Error(
               "처치한 몬스터 목록 반환 시 오류가 발생했습니다." + error.message
          );
     }
};
