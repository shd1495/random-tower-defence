//import { getUserTowers, addTower } from '../models/towerModel.js';
import { getGameAssets } from '../init/assets.js';
import { getUserGold, updateUserGold } from '../models/gameModel.js';
import { getTowers, getTower, setTower, removeTower } from '../models/towerModel.js';

// 타워 생성 초기화(하드 코딩이라 추후 코드 수정 필요)
export const towerCreateInit = async (uuid, payload) => {
  // 타워 json 파일 불러오기
  const { towers } = getGameAssets();
  // 데이터베이스에 저장된 타워들
  let redisTowers = await getTowers(uuid);
  // 클라에서 받은 데이터들
  let { uniqueId, towerId, towerType, towerCount, posX, posY } = payload;

  if (towerId !== 1)
    return { type: 'setTower', status: 'fail', message: 'Tower init towerId mismatch' };

  // 검증 모두 성공하면 타워 생성(타워 종류 생기면 코드 수정 필요)
  await setTower(uuid, uniqueId, towerId, towers.data[towerType], posX, posY);

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
};

// 타워 구매
export const towerCreate = async (uuid, payload) => {
  // 타워 json 파일 불러오기
  const { towers } = getGameAssets();
  // 데이터베이스에 저장된 타워들
  let redisTowers = await getTowers(uuid);
  // 클라에서 받은 데이터들
  let { userGold, uniqueId, towerCount, towerId, towerType, posX, posY } = payload;

  // 유저 보유 금액이 타워 값 보다 많은지 비교(데이터 베이스가 들어오거나 기획이 바뀌면 수정 필요)
  // 유저 보유 금액이 데이터베이스에 저장된 타워의 값보다 적을 경우를 방지
  if (userGold < towers.data[towerType].price)
    return { type: 'setTower', status: 'fail', message: `be short on one's gold` };

  // 유저 보유 타워수 비교(기획이 바뀌면 수정 필요)
  // 한번 살때 복수 구매 방지
  if (towerCount !== redisTowers.length)
    return { type: 'setTower', status: 'fail', message: 'User tower count mismatch' };

  // 검증 모두 성공하면 타워 생성(타워 종류 생기면 코드 수정 필요)
  await updateUserGold(uuid, -towers.data[towerType].price);
  const userGoldData = await getUserGold(uuid);
  await setTower(uuid, uniqueId, towerId, towers.data[towerType], posX, posY);

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
};

// 타워 판매
export const towerSell = async (uuid, payload) => {
  // 클라에서 받은 데이터들
  let { tower } = payload;
  const uniqueId = tower.uniqueId;

  // redis에 저장된 지울 타워
  let redisTower = await getTower(uuid, uniqueId);

  // 데이터베이스에 저장된 타워와 클라에서 받아온 타워의 가격이 같은지 확인
  if (tower.price !== redisTower.price)
    return { type: 'sellTower', status: 'fail', message: 'User tower price mismatch' };

  // 검증 모두 성공하면 타워 제거(타워 종류 생기면 코드 수정 필요)
  await updateUserGold(uuid, tower.price / 2);
  const userGold = await getUserGold(uuid);
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
      //towerImage: towers[towerType].image
    },
  };
};

// 타워 업그레이드
export const handleUpgradeTower = (userId, payload) => {
  const { towers } = getGameAssets;
  const { towerId, money } = payload;
  // 타워 정보 조회
  const tower = towers.data.find((tower) => tower.id === towerId);
  if (!tower) {
    return { status: 'fail', message: '존재하지 않는 타워ID' };
  }

  // 보유 골드 검증
  return { status: 'success', message: 'tower was upgraded successfully', handlerId: 23 };
};
