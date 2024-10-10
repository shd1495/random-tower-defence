import { getGameAssets } from '../init/assets.js';
import { getMonsters } from '../models/monsterModel.js';

// 현재 게임에선 몬스터를 처치해야 점수가 오르는 형식
// 처치했을때의 처치한 몬스터를 저장할 모델링 또는 처치했을때 획득한 score의 저장한 모델이 있어야 될 것 같다.
// 점수를 검증하려면 획득하여 서버에 저장한 점수가 있거나 몬스터를 처치한 기록을 저장하여 서버에 있으면 검증이 될 것 같다.

/**
 * 서버에서 계산한 점수와 클라의 점수가 맞는지 확인하는 점수 검정 함수
 * @param {string} uuid
 * @param {JSON} payload
 * @returns
 */
export const scoreValidation = async (uuid, payload) => {
  const { waveLevel, monsters } = getGameAssets();
  const userMonsters = await getMonsters(uuid);
  let totalScore = 0;

  // console.log(uuid);
  // console.log('----userMonsters----', userMonsters);

  // 획득한 아이템 점수를 더해 주기
  for (let i = 0; i < userMonsters.length; i++) {
    const monsterId = userMonsters[i].monsterId;
    const monsterWaveLevel = userMonsters[i].waveLevelData;

    // 게임 에셋에 있는 몬스터 정보를 가져오기
    const monsterInfo = monsters.data.find((monster) => monster.id === monsterId);

    totalScore += monsterInfo.score * monsterWaveLevel;
  }

  // 클라이언트 점수와 서버에서 계산한 점수와 동일한지 체크
  // 게임데이터 wave 목표점수보다 높은지 확인
  const nextWaveLevel = waveLevel.data.find((wave) => wave.id === payload.nextLevel);
  if (payload.score !== totalScore || payload.score < nextWaveLevel.score) return false;
  else return true;
};

/**
 * 서버에서 계산한 총합 점수
 * @param {string} uuid
 * @returns
 */
export const totalScore = async (uuid) => {
  const { monsters } = getGameAssets();
  const userMonsters = await getMonsters(uuid);
  let totalScore = 0;

  // 획득한 아이템 점수를 더해 주기
  for (let i = 0; i < userMonsters.length; i++) {
    const monsterId = userMonsters[i].monsterId;
    const monsterWaveLevel = userMonsters[i].currentWaveLv;

    // 게임 에셋에 있는 몬스터 정보를 가져오기
    const monsterInfo = monsters.data.find((monster) => monster.id === monsterId);

    totalScore += monsterInfo.score * monsterWaveLevel;
  }

  return totalScore;
};
