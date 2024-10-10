import { getUserTowers, addTower } from '../models/towerModel.js';
import { getGameAssets } from '../init/assets.js';

export const handleUpgradeTower = (userId, payload) =>{
    const {towers} = getGameAssets;
    const {towerId, money} = payload;
    // 타워 정보 조회
    const tower = towers.data.find((tower) => tower.id === towerId);
    if(!tower) {
        return {status: 'fail', message: '존재하지 않는 타워ID'};
    }

    // 보유 골드 검증    
    
    
    return {status: 'success', message: 'tower was upgraded successfully', handlerId: 23};
};