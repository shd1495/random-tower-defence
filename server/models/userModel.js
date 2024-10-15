import redisClient from '../init/redis.js';

const USER_SET = 'user';

/**
 * 유저 등록
 * @param {Object} user
 */
export const addUser = async (user) => {
  try {
    await redisClient.set(user.userId, JSON.stringify(user));
    await redisClient.sadd(USER_SET, user.userId);
  } catch (error) {
    console.error(`error addUser for user ${uuid}`);
  }
};

/**
 * 접속 중인 유저 목록에서 제거
 * @param {String} uuid
 */
export const removeUser = (uuid) => {
  try {
    redisClient.del(uuid);
    // 유저 UUID를 세트에서 제거
    redisClient.srem(USER_SET, uuid);
  } catch (error) {
    console.error(`error removeUser for user ${uuid}`);
  }
};

/**
 * 접속 중인 유저 목록 조회
 * @returns {Array} users
 */
export const getUsers = async () => {
  try {
    const userIds = await redisClient.smembers(USER_SET);
    const users = await Promise.all(
      userIds.map(async (uuid) => {
        const user = await redisClient.get(uuid);
        return JSON.parse(user);
      }),
    );
    return users;
  } catch (error) {
    console.error(`error getUsers for user ${uuid}`);
  }
};

/**
 * 유저 조회
 * @param {String} uuid
 * @returns {String || null}
 */
export const getUser = async (uuid) => {
  try {
    const user = await redisClient.get(uuid);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error(`error getUser for user ${uuid}`);
  }
};
