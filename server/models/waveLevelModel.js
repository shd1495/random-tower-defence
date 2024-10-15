import redisClient from '../init/redis.js';

// 현재 유저의 웨이브 레벨을 저장할 키
const WAVE_LEVEL = 'waveLevel';

/**
 * 웨이브 레벨 목록 초기화
 * @param {String} uuid
 */
export const clearWaveLevel = async (uuid) => {
  try {
    redisClient.del(WAVE_LEVEL + uuid);
  } catch (error) {
    console.error(`error clearWaveLevel for user ${uuid}`);
  }
};

/**
 * 웨이브 레벨 목록 업데이트
 * @param {String} uuid
 * @param {Object} waveLevel
 */
export const setWaveLevel = async (uuid, waveLevel) => {
  try {
    await redisClient.set(WAVE_LEVEL + uuid, JSON.stringify(waveLevel));
  } catch (error) {
    console.error(`error setWaveLevel for user ${uuid}`);
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
    console.error(`error getWaveLevel for user ${uuid}`);
  }
};
