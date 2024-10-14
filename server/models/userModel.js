import redisClient from "../init/redis.js";

const USER_SET = "user";

/**
 * 유저 등록
 * @param {Object} user
 */
export const addUser = async (user) => {
     try {
          await redisClient.set(user.userId, JSON.stringify(user));
          await redisClient.sadd(USER_SET, user.userId);
     } catch (error) {
          throw new Error(
               "유저 정보를 저장하는 중 오류가 발생했습니다." + error.message
          );
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
          throw new Error(
               "유저 정보를 삭제하는 중 에러가 발생했습니다." + error.message
          );
     }
};

/**
 * 접속 중인 유저 목록 조회
 * @returns
 */
export const getUsers = async () => {
     try {
          const userIds = await redisClient.smembers(USER_SET);
          const users = await Promise.all(
               userIds.map(async (uuid) => {
                    const user = await redisClient.get(uuid);
                    return JSON.parse(user);
               })
          );
          return users;
     } catch (error) {
          throw new Error(
               "유저 정보를 조회하는 중 오류가 발생했습니다." + error.message
          );
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
          throw new Error(
               "유저 정보를 불러오는 중 오류가 발생했습니다." + error.message
          );
     }
};
