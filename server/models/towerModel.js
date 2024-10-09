const userTowers = {};
//초기화
export const initTowers = (userId) => {
    userTowers[userId] = [];
};

// 타워 추가
export const addTower = (userId, tower) => {    
    if (userTowers[userId]) {
        userTowers[userId].push(tower);
    }
};

// 타워 제거
export const removeTower = ()=>{};

// 타워 목록 가져오기
export const getUserTowers = (userId) => {
    return userTowers[userId] || [];
};