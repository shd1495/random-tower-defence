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

// /**
//  * 타워 제거
//  * @param {String} uuid
//  */
// export const removeTower = async (uuid,) => {
//     try {
//         // redisClient.del(uuid) : uuid라는 키 삭제용
//         // redisClient.srem(TOWER_SET, uuid) : SET 에서 uuid 멤버 제거용
        
//         // 모든 타워 가져오기
//         const towers = await redisClient.lrange(TOWER_SET + uuid, 0, -1);
//         // 삭제할 타워 찾기
//         const searchRemoveTower = towers.find((tower) => JSON.parse(tower).id === towerID);
//         // 해당 타워 삭제
//         if(searchRemoveTower) 
//             await redisClient.lrem(TOWER_SET + uuid, 1, searchRemoveTower);

//     } catch (error) {
//         throw new Error('[타워 제거]에러가 발생했습니다.' + error.message);
//     }
// };

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
