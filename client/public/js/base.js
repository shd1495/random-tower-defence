import { sendMonsterEvent } from './game.js';

export class Base {
  constructor(x, y, maxHp) {
    this.x = 1600 / 2 - 20; // 기지 이미지 x 좌표
    this.y = 950 / 2 - 75; // 기지 이미지 y 좌표
    this.width = 210; // 기지 이미지 가로 길이 (이미지 파일 길이에 따라 변경 필요하며 세로 길이와 비율을 맞춰주셔야 합니다!)
    this.height = 230; // 기지 이미지 세로 길이
    this.hp = maxHp; // 기지의 현재 HP
    this.maxHp = maxHp; // 기지의 최대 HP
  }

  draw(ctx, baseImage) {
    ctx.drawImage(
      baseImage,
      this.x - this.width / 2 + 10,
      this.y - this.height / 2,
      this.width,
      this.height,
    );

    ctx.font = '16px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`HP: ${this.hp}/${this.maxHp}`, this.x - this.width / 2, this.y - this.height / 2);
  }

  takeDamage(monsterId, attackPower) {
    // 기지가 데미지를 입는 메소드입니다.
    // 몬스터가 기지의 HP를 감소시키고, HP가 0 이하가 되면 게임 오버 처리를 해요!
    sendMonsterEvent(12, { monsterId, attackPower });
    this.hp -= attackPower;
    return this.hp <= 0; // 기지의 HP가 0 이하이면 true, 아니면 false
  }
}
