//import { getUserTowers, addTower } from '../models/towerModel.js';
import { getGameAssets } from '../init/assets.js';
import { getUserGold, updateUserGold } from '../models/gameModel.js';
import { getTowers, getTower, setTower, removeTower, upgradeTower } from '../models/towerModel.js';

export const towerCreateInit = async (uuid, payload) => {
  // 타워 json 파일 불러오기
  const { towers } = getGameAssets();
  // 클라에서 받은 데이터들
  const { uniqueId, towerCount, clientTowers, towerType, posX, posY } = payload;

  try {
    // 데이터베이스에 저장된 타워들
    const redisTowers = await getTowers(uuid);
    if (!redisTowers) throw new Error('Towers not found');

    // Towers DB 검증
    if (clientTowers === undefined && redisTowers === undefined)
      throw new Error('Tower init Towers DB mismatch');

    // 검증 모두 성공하면 타워 생성(타워 종류 생기면 코드 수정 필요)
    await setTower(uuid, uniqueId, towerType + 1, towers.data[towerType], posX, posY);

    return {
      type: 'setTower',
      status: 'success',
      message: 'Create Init Tower successfully',
      result: {
        // 출력용으로만 쓰이는 result 값
        towerCount: towerCount,
        // redis 와 같은 key-value의 result 값
        uniqueId: uniqueId,
        redisTowers,
        tower: towers.data[towerType],
        posX: posX,
        posY: posY,
      },
    };
  } catch (error) {
    console.error(error.message);
    return { status: 'fail', type: 'setTower', message: error.message };
  }
};

// 타워 구매
export const towerCreate = async (uuid, payload) => {
  // 타워 json 파일 불러오기
  const { towers } = getGameAssets();
  // 클라에서 받은 데이터들
  const { userGold, uniqueId, towerCount, clientTowers, towerType, posX, posY } = payload;

  try {
    // 데이터베이스에 저장된 타워들
    const redisTowers = await getTowers(uuid);
    if (!redisTowers) throw new Error('Towers not found');

    // 유저 보유 금액이 타워 값 보다 많은지 비교(데이터 베이스가 들어오거나 기획이 바뀌면 수정 필요)
    // 유저 보유 금액이 데이터베이스에 저장된 타워의 값보다 적을 경우를 방지
    if (userGold < towers.data[towerType].price) throw new Error(`Be short on one's gold`);

    // Towers DB 검증
    if (clientTowers === undefined && redisTowers === undefined)
      throw new Error('Tower init Towers DB mismatch');

    // 유저 보유 타워수 비교(기획이 바뀌면 수정 필요)
    // 한번 살때 복수 구매 방지
    if (towerCount !== redisTowers.length) throw new Error('User tower count mismatch');

    // 검증 모두 성공하면 타워 생성(타워 종류 생기면 코드 수정 필요)
    await updateUserGold(uuid, -towers.data[towerType].price);

    const userGoldData = await getUserGold(uuid);
    if (!userGoldData) throw new Error('Can not read userGold');

    await setTower(uuid, uniqueId, towerType + 1, towers.data[towerType], posX, posY);

    return {
      type: 'setTower',
      status: 'success',
      message: 'Create Tower successfully',
      result: {
        // 출력용으로만 쓰이는 result 값
        towerCount: redisTowers.length + 1,
        // redis 와 같은 key-value의 result 값
        uniqueId: uniqueId,
        redisTowers,
        tower: towers.data[towerType],
        posX: posX,
        posY: posY,
        userGold: userGoldData,
      },
    };
  } catch (error) {
    console.error(error.message);
    return { status: 'fail', type: 'setTower', message: error.message };
  }
};

// 타워 판매
export const towerSell = async (uuid, payload) => {
  // 클라에서 받은 데이터들
  const { tower } = payload;
  const uniqueId = tower.uniqueId;

  try {
    // redis에 저장된 지울 타워
    let redisTower = await getTower(uuid, uniqueId);

    // 데이터베이스에 저장된 타워와 클라에서 받아온 타워의 가격이 같은지 확인
    if (tower.price !== redisTower.price) throw new Error('User tower price mismatch');

    // 검증 모두 성공하면 타워 제거(타워 종류 생기면 코드 수정 필요)
    await updateUserGold(uuid, tower.price / 2);

    const userGold = await getUserGold(uuid);
    if (!userGold) throw new Error('Can not read userGold');

    await removeTower(uuid, uniqueId);

    // 데이터베이스에 저장된 타워들
    let redisTowers = await getTowers(uuid);

    return {
      type: 'sellTower',
      status: 'success',
      message: 'Sell Tower successfully',
      result: {
        towerCount: redisTowers.length + 1,
        redisTowers,
        tower,
        userGold,
      },
    };
  } catch (error) {
    console.error(error.message);
    return { status: 'fail', type: 'sellTower', message: error.message };
  }
};

// 타워 업그레이드
export const towerUpgrade = async (uuid, payload) => {
  const { towers } = getGameAssets();
  const { tower, beforeUniqueId, afterUniqueId, userGold, posX, posY } = payload;

  try {
    // 타워id 검증
    const isExistTower = towers.data.find((t) => tower.id === t.id);
    if (!isExistTower) return { type: 'upgradeTower', status: 'fail', message: 'Invalid tower ID' };

    // 골드 검증
    if (userGold < isExistTower.upgradePrice)
      return { type: 'upgradeTower', status: 'fail', message: `be short on one's gold` };

    // 강화 단계 검증
    const isExistNextGrade = towers.data.find((t) => isExistTower.nextGradeId === t.id);
    if (isExistNextGrade === -1 || !isExistNextGrade)
      return { type: 'upgradeTower', status: 'fail', message: 'tower is already max grade or Invalid next grade' };

    const nextGradeTower = towers.data.find((t) => t.id === isExistNextGrade.id);
    if (!nextGradeTower) return { type: 'upgradeTower', status: 'fail', message: 'Invalid next grade tower ID' };

    // 검증 모두 성공하면
    await updateUserGold(uuid, -isExistTower.upgradePrice);
    const userGoldData = await getUserGold(uuid);
    await upgradeTower(uuid, beforeUniqueId, afterUniqueId, nextGradeTower, posX, posY);

    return {
      type: 'upgradeTower',
      status: 'success',
      message: 'Upgrade Tower successfully',
      result: {
        beforeUniqueId: beforeUniqueId, // 삭제할 이전 타워 클라 고유값
        // redis 와 같은 key-value의 result 값
        uniqueId: afterUniqueId, // 새로 배치할 타워 클라 고유값
        tower: nextGradeTower, //업그레이드 된 타워 오브잭트 정보
        posX: posX, // xy 좌표
        posY: posY,
        userGold: userGoldData, // 골드 동기화
      },
    };
  } catch (error) {
    throw new Error(`타워 업그레이드 에러 ${error.message}`);
  }
};
