import { setMonster } from "../models/monsterModel.js";
import { getWaveLevel } from "../models/getWaveLevelModel.js";
import { getGameAssets } from "../init/assets.js";

/**
 * @param {String} userId
 * @param {object} payload
 * @returns {object}
 */
export const attackedByMonster = async (userId, payload) => {
     const { waveLevel, monsters } = getGameAssets();
     const { monsterId, decresedHP } = payload;

     // 몬스터 아이디 유효성 검증
     const isExistMonster = monsters.data.find(
          (monster) => monster.id === monsterId
     );
     if (!isExistMonster) {
          return {
               status: "실패",
               message: "게임에 존재 하지 않는 몬스터 정보입니다.",
          };
     }

     // 현재 웨이브 레벨 검증
     const waveLevelData = await getWaveLevel(userId);
     const currentWaveLv = waveLevel.data.find(
          (level) => decresedHP / level.id === isExistMonster.power
     );
     if (waveLevelData.id !== currentWaveLv.id) {
          return {
               status: "실패",
               message: "웨이브 레벨 정보가 다릅니다.",
          };
     }

     const isVaildHPDecrement =
          currentWaveLv.id * isExistMonster.power === decresedHP;

     if (!isVaildHPDecrement)
          return { status: "실패", message: "데미지 정보가 다릅니다." };

     return {
          status: "성공",
          message: `기지 hp가 ${decresedHP}만큼 하락합니다.`,
     };
};

/**
 * @param {String} userId
 * @param {object} payload
 * @returns {object}
 */
export const killMonster = async (userId, payload) => {
     const { waveLevel, monsters } = getGameAssets();
     const { monsterId, incrementScore, incrementMoney } = payload;

     // 몬스터 아이디 유효성 검증
     const isExistMonster = monsters.data.find(
          (monster) => monster.id === monsterId
     );
     if (!isExistMonster) {
          return {
               status: "실패",
               message: "게임에 존재 하지 않는 몬스터 정보입니다.",
          };
     }
     // 현재 웨이브 레벨 검증
     const waveLevelData = await getWaveLevel(userId);
     const currentWaveLv = waveLevel.data.find(
          (level) => incrementScore / level.id === isExistMonster.score
     );

     if (waveLevelData.id !== currentWaveLv.id) {
          return {
               status: "실패",
               message: "웨이브 레벨 정보가 다릅니다.",
          };
     }

     //보상 금액 유효성 검증
     const isVaildMoneyIncrement =
          currentWaveLv.id * isExistMonster.reward === incrementMoney;
     if (!isVaildMoneyIncrement) {
          return {
               status: "실패",
               message: "보상 금액이 일치하지 않습니다.",
          };
     }

     //회득 점수 유효성 검증
     const isVaildScoreIncrement =
          currentWaveLv * isExistMonster.score === incrementScore;
     if (!isVaildScoreIncrement) {
          return {
               status: "실패",
               message: "회득 점수가 일치하지 않습니다.",
          };
     }

     await setMonster(userId, { monsterId, currentWaveLv });

     return {
          status: "성공",
          message: `몬스터를 처치했습니다. 점수가 ${incrementScore}만큼 상승, 
          소지금이 ${incrementMoney}만큼 상승합니다.`,
     };
};
