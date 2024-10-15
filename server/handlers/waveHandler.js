import { getGameAssets } from '../init/assets.js';
import { updateMonsterSpawnInterval } from '../models/gameModel.js';
import { setWaveLevel, getWaveLevel } from '../models/waveLevelModel.js';
import { scoreValidation, scoreValidationOverSevenStage } from '../utils/scoreValidation.js';

/**
 * 웨이브 레벨 상승 함수
 * @param {string} uuid 해당 유저의 uuid
 * @param {Object} payload 클라이언트에서 받은 데이터
 * @returns {Object} 상태, 타입, 웨이브레벨, 스폰인터벌
 */
export const waveLevelIncrease = async (uuid, payload) => {
  try {
    // 유저의 현재 스테이지 정보 불러오기
    const currentWave = await getWaveLevel(uuid);
    // 해당 유저의 wave 정보가 없다
    if (!currentWave) {
      return {
        status: 'fail',
        type: 'waveLevelIncrease',
        message: 'No waves found for user',
      };
    }

    // 서버 vs 클라이언트 현재 같은 waveLevel이 맞는지 체크
    if (+currentWave !== payload.currentLevel) {
      return {
        status: 'fail',
        type: 'waveLevelIncrease',
        message: 'Current wave mismatch',
      };
    }

    // targetStage 대한 검증 <- 게임에셋에 존재하는가? 넘어갈 웨이브 정보가 없다면

    const { waveLevel } = getGameAssets();
    if (!waveLevel.data.some((wave) => wave.id === payload.nextLevel)) {
      return {
        status: 'fail',
        type: 'waveLevelIncrease',
        message: 'Next wave not found',
      };
    }

    // 점수 검증
    if (payload.currentLevel < 7) {
      if (!(await scoreValidation(uuid, payload))) {
        return {
          status: 'fail',
          type: 'waveLevelIncrease',
          message: 'Invalid elapsed time',
        };
      }
    } else {
      if (!(await scoreValidationOverSevenStage(uuid, payload))) {
        return {
          status: 'fail',
          type: 'waveLevelIncrease',
          message: 'Invalid elapsed time Over Seven Stage',
        };
      }
    }

    // 다음 웨이브 id 추가
    await setWaveLevel(uuid, payload.nextLevel);
    const currentWaveData = await getWaveLevel(uuid);
    if (!currentWaveData)
      return { status: 'fail', type: 'waveLevelIncrease', message: 'currentWave data not found' };

    const waveData = waveLevel.data.find((wave) => wave.id == currentWaveData);
    if (!waveData)
      return { status: 'fail', type: 'waveLevelIncrease', message: 'wave data not found' };

    await updateMonsterSpawnInterval(uuid, waveData.monsterSpawnInterval);

    return {
      status: 'success',
      type: 'waveLevelIncrease',
      message: 'wave level is increment successfully',
      waveLevel: payload.nextLevel,
      monsterSpawnInterval: waveData.monsterSpawnInterval,
    };
  } catch (error) {
    console.error(error.message);
    return { status: 'fail', type: 'waveLevelIncrease', message: error.message };
  }
};
