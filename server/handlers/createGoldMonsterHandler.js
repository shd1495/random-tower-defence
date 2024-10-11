// 서버 자체에서 음 난수 생성해서 자체적으로 계산하여 맞으면 생성하는
// 그럼 일단 이 함수 자체를 업데이트하는 함수에 같이 실행 시켜서 테스트 해보자
import { getGameAssets } from '../init/assets.js';
import { getWaveLevel } from '../models/waveLevelModel.js';

/**
 * 서버자체에서 황금 고블린을 생성하라고 클라에게 보내는 함수입니다.
 * @param {String} uuid
 * @param {*} socket
 */
export const createGoldMonster = async (uuid, payload, socket) => {
  let monsterId = 0;
  const { waveLevel, monsters } = getGameAssets();
  const currentWaveLevel = await getWaveLevel(uuid);
  console.log(waveLevel.data[currentWaveLevel - 1].goldMonsterProbability);

  const random = Math.floor(Math.random() * 100) + 1;
  if (random <= waveLevel.data[currentWaveLevel - 1].goldMonsterProbability) {
    monsterId = monsters.data[monsters.data.length - 1].id;
  } else {
    monsterId = null;
  }

  return {
    type: 'createGoldMonster',
    status: 'success',
    message: 'create Gold Monster',
    result: {
      goldMonsterId: monsterId,
    },
  };
};
