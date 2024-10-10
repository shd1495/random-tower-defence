import { getGameAssets } from '../init/assets.js';
import { setWaveLevel, getWaveLevel } from '../models/waveLevelModel.js';
import { scoreValidation } from '../utils/scoreValidation.js';

/**
 *
 * @param {string} uuid 해당 유저의 uuid
 * @param {JSON} payload 클라이언트에서 받은 데이터
 * @returns
 */
export const waveLevelIncrease = async (uuid, payload) => {
  // paload는 : score, currentLevel, nextLevel

  // 유저의 현재 스테이지 정보 불러오기
  const currentWave = await getWaveLevel(uuid);
  // 해당 유저의 wave 정보가 없다
  if (!currentWave) {
    return { status: 'fail', type: 'waveLevelIncrease', message: 'No waves found for user' };
  }

  // 서버 vs 클라이언트 현재 같은 waveLevel이 맞는지 체크
  if (+currentWave !== payload.currentLevel) {
    return { status: 'fail', type: 'waveLevelIncrease', message: 'Current wave mismatch' };
  }

  // targetStage 대한 검증 <- 게임에셋에 존재하는가? 넘어갈 웨이브 정보가 없다면
  const { waveLevel } = getGameAssets();
  if (!waveLevel.data.some((wave) => wave.id === payload.nextLevel)) {
    return { status: 'fail', type: 'waveLevelIncrease', message: 'Next wave not found' };
  }

  // 점수 검증
  if (!(await scoreValidation(uuid, payload))) {
    return { status: 'fail', type: 'waveLevelIncrease', message: 'Invalid elapsed time' };
  }

  // 다음 웨이브 id 추가
  await setWaveLevel(uuid, payload.nextLevel);

  return {
    status: 'success',
    type: 'waveLevelIncrease',
    message: 'wave level is increment successfully',
    waveLevel: payload.nextLevel,
    hadlerId: 31,
  };
};
