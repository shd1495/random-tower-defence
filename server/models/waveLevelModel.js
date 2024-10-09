import { redisClient } from "../init/redisConnect";

// 현재 유저의 웨이브 레벨을 저장할 키
const WAVE_LEVEL = "waveLevel";

/**
 * 웨이브 레벨 목록 초기화
 * @param {String} uuid
 */
export const clearWaveLv = async (uuid) => {
     try {
          redisClient.del(WAVE_LEVEL + uuid);
     } catch (error) {
          throw new Error(
               "웨이브 레벨 초기화 시 에러가 발생했습니다.",
               error.message
          );
     }
};

/**
 * 웨이브 레벨 목록 업데이트
 * @param {String} uuid
 * @param {Object} waveLevel
 */
export const setWaveLevel = async (uuid, waveLevel) => {
     try {
          await redisClient.hset(WAVE_LEVEL + uuid, JSON.stringify(waveLevel));
     } catch (error) {
          throw new Error(
               "웨이브 레벨 업데이트 시 문제가 발생했습니다." + error.message
          );
     }
};

/**
 * 웨이브 레벨 조회
 * @param {String} uuid
 * @returns {Object}
 */
export const getWaveLevel = async (uuid) => {
     try {
          const waveLevel = await redisClient.get(WAVE_LEVEL + uuid);
          return waveLevel;
     } catch (error) {
          throw new Error(
               "웨이브 레벨 조회 시 에러가 발생했습니다." + error.message
          );
     }
};
