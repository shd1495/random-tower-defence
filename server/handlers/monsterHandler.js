import { setMonster } from "../models/monsterModel.js";
import { getWaveLevel } from "../models/waveLevelModel.js";
import { getGameAssets } from "../init/assets.js";
import {
     getScore,
     getUserGold,
     updateScore,
     updateUserGold,
} from "../models/gameModel.js";

/**
 * @param {String} userId
 * @param {object} payload
 * @returns {object}
 */
export const attackedByMonster = async (userId, payload) => {
     const { waveLevel, monsters } = getGameAssets();
     const { monsterId, attackPower } = payload;

     // 몬스터 아이디 유효성 검증
     const isExistMonster = monsters.data.find(
          (monster) => monster.id === monsterId
     );

     if (!isExistMonster) {
          return {
               status: "실패",
               type: "attackedByMonster",
               message: "게임에 존재 하지 않는 몬스터 정보입니다.",
          };
     }

     // 현재 웨이브 레벨 검증
     const waveLevelData = await getWaveLevel(userId);
     const currentWaveLv = waveLevel.data.find(
          (level) => attackPower / level.id === isExistMonster.power
     );

     if (waveLevelData != currentWaveLv.id) {
          return {
               status: "실패",
               type: "attackedByMonster",
               message: "웨이브 레벨 정보가 다릅니다.",
          };
     }

     if (currentWaveLv.id * isExistMonster.power !== attackPower)
          return {
               status: "실패",
               type: "attackedByMonster",
               message: "데미지 정보가 다릅니다.",
          };

     return {
          status: "성공",
          message: `기지 hp가 ${attackPower}만큼 하락합니다.`,
          type: "attackedByMonster",
          result: { attackPower },
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
     //  console.log("incre", incrementScore);
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


     //현재 웨이브 레벨 검증
     const waveLevelData = await getWaveLevel(userId);

     const currentWaveLv = waveLevel.data.find(
          (level) => incrementScore / level.id === isExistMonster.score
     );


     if (waveLevelData != currentWaveLv.id) {
          return {
               status: "실패",
               type: "killMonster",
               message: "웨이브 레벨 정보가 다릅니다.",
          };
     }

     if (currentWaveLv.id * isExistMonster.reward !== incrementMoney) {
          return {
               status: "실패",
               type: "killMonster",
               message: "보상 금액이 일치하지 않습니다.",
          };
     }


     if (currentWaveLv.id * isExistMonster.score !== incrementScore) {
          return {
               status: "실패",
               type: "killMonster",
               message: "회득 점수가 일치하지 않습니다.",
          };
     }

     await setMonster(userId, { monsterId, waveLevelData });
     await updateScore(userId, incrementScore);
     await updateUserGold(userId, incrementMoney);
     const score = await getScore(userId);
     const userGold = await getUserGold(userId); //


     return {
          status: "success",
          type: "killMonster",
          result: { score, userGold },
     };
};
