import { sendMonsterEvent } from './game.js';

export class Tower {
  constructor(uniqueId, data, posX, posY) {
    // 생성자 안에서 타워들의 속성을 정의한다고 생각하시면 됩니다!
    this.uniqueId = uniqueId; // 타워 ID
    this.id = data.id; // 타워 json ID
    this.x = posX - 233; // 타워 이미지 x 좌표
    this.y = posY - 130; // 타워 이미지 y 좌표
    this.width = data.width; // 타워 이미지 가로 길이 (이미지 파일 길이에 따라 변경 필요하며 세로 길이와 비율을 맞춰주셔야 합니다!)
    this.height = data.height; // 타워 이미지 세로 길이
    this.imgMagnification = data.imgMagnification; // 이미지 배율
    this.attackPower = data.attackPower; // 타워 공격력
    this.range = data.range; // 타워 사거리
    this.price = data.price; // 타워 구입 비용
    this.cooldown = data.coolDown; // 타워 공격 쿨타임
    this.cool = data.coolDown; // 공격 쿨타임 (계산, 갱신용)
    this.beamDuration = data.beamDuration; // 타워 광선 지속 시간
    this.beamDu = data.beamDuration; //타워 광선 지속 시간 (계산, 갱신용)
    this.beamColor = data.beamColor;
    this.lv = data.lv; // 레벨 수치 가시화용 변수
    this.nextGradeId = data.nextGradeId; // 다음 단계 타워 id
    this.target = null; // 타워 광선의 목표

    this.towerImage = new Image();
    this.towerImage.src = data.image;
  }

  draw(ctx) {
    ctx.drawImage(
      this.towerImage,
      this.x,
      this.y,
      this.width * this.imgMagnification,
      this.height * this.imgMagnification,
    );
    if (this.beamDu > 0 && this.target) {
      ctx.beginPath();
      ctx.moveTo(
        this.x + (this.width * this.imgMagnification) / 2,
        this.y + (this.height * this.imgMagnification) / 2,
      );
      ctx.lineTo(this.target.x + this.target.width / 2, this.target.y + this.target.height / 2);
      ctx.strokeStyle = `${this.beamColor}`;
      ctx.lineWidth = 10;
      ctx.stroke();
      ctx.closePath();
      this.beamDu--;
    }
  }

  attack(monster) {
    // 타워가 타워 사정거리 내에 있는 몬스터를 공격하는 메소드이며 사정거리에 닿는지 여부는 game.js에서 확인합니다.
    if (this.cool <= 0 && monster.hp > 0) {
      monster.hp -= this.attackPower;

      if (monster.hp <= 0) {
        monster.hp = 0;
        const monsterId = monster.monsterId;

        sendMonsterEvent(11, {
          monsterId,
        });
      }

      this.cool = this.cooldown; // 3초 쿨타임 (초당 60프레임)
      this.beamDu = this.beamDuration; // 광선 지속 시간 (0.5초)
      this.target = monster; // 광선의 목표 설정
    }
  }

  updateCooldown() {
    if (this.cool > 0) {
      this.cool--;
    }
  }
}
