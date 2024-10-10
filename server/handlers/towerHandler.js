//import { getUserTowers, addTower } from '../models/towerModel.js';
import { getGameAssets } from '../init/assets.js';
import { updateUserGold } from '../models/gameModel.js';
import { getTowers, setTower } from '../models/towerModel.js';

// 타워 생성 초기화(하드 코딩이라 추후 코드 수정 필요)
export const towerCreateInit = async (uuid, payload) => {
  // 클라에서 받은 데이터들
  let { towerId, towerCount, tower } = payload;

  // 검증 모두 성공하면 타워 생성(타워 종류 생기면 코드 수정 필요)
  await setTower(uuid, towerId, tower);
  return {
    type: 'setTower',
    status: 'success',
    message: 'Create Init Tower successfully',
    result: {
      towerCount: towerCount,
      tower,
      //towerImage: towers[towerType].image
    },
  };
};

// 타워 구매
export const towerCreate = async (uuid, payload) => {
  // 타워 json 파일 불러오기
  const { towers } = getGameAssets();
  // 데이터베이스에 저장된 타워들
  let currentTower = await getTowers(uuid);
  // 클라에서 받은 데이터들
  let { userGold, towerCount, towerId, towerType, tower } = payload;

  // 지불하는 타워 값 비교(데이터 베이스가 들어오거나 기획이 바뀌면 수정 필요)
  // 데이터베이스에 저장된 타워의 값보다 많거나 적게 낼 경우를 방지
  if (tower.price !== towers.data[towerType].price) {
    return { type: 'setTower', status: 'fail', message: 'Tower price mismatch' };
  }

  // 유저 보유 금액이 타워 값 보다 많은지 비교(데이터 베이스가 들어오거나 기획이 바뀌면 수정 필요)
  // 유저 보유 금액이 데이터베이스에 저장된 타워의 값보다 적을 경우를 방지
  if (tower.price > userGold) {
    return { type: 'setTower', status: 'fail', message: 'Tower price mismatch' };
  }

  // 유저 보유 타워수 비교(기획이 바뀌면 수정 필요)
  // 한번 살때 복수 구매 방지
  if (towerCount !== currentTower.length) {
    return { type: 'setTower', status: 'fail', message: 'User tower count mismatch' };
  }

  // 검증 모두 성공하면 타워 생성(타워 종류 생기면 코드 수정 필요)
  await setTower(uuid, towerId, tower);
  await updateUserGold(uuid, -tower.price);

  return {
    type: 'setTower',
    status: 'success',
    message: 'Create Tower successfully',
    result: {
      towerCount: currentTower.length + 1,
      tower,
      //towerImage: towers[towerType].image
    },
  };
};

// 타워 판매
// export const towerSell = async (uuid, payload) => {
//     // 로직 미구현
//     // 검증 모두 성공하면 타워 생성(타워 종류 생기면 코드 수정 필요)
//     await setTower(uuid, towerId, tower);
//     return {
//         type: 'sellTower',
//         status: 'success',
//         message: 'Sell Tower successfully',
//         result: {
//             towerCount: currentTower.length + 1,
//             tower,
//             //towerImage: towers[towerType].image
//         }
//     };
// }

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
