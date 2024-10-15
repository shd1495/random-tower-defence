import { Monster } from './monster.js';

export class bossMonster extends Monster {
  constructor(path, monsterImages, bossMonsters, monsterLevel, bossMonsterId) {
    if (!bossMonsterId) {
    }
    const bossMonsterId = Math.floor(Math.random() * 2) + 6; // 몬스터 번호 (6 ~ 7. 몬스터를 추가해도 숫자가 자동으로 매겨집니다!)

    super(path, monsterImages, bossMonsters, monsterLevel, bossMonsterId);

    this.width = 110; // 몬스터 이미지 가로 길이
    this.height = 110; // 몬스터 이미지 세로 길이

    console.log('보스 몬스터 생성');
  }
}
