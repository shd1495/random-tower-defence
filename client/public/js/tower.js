import { sendMonsterEvent } from "./game.js";

export class Tower {
     constructor(uniqueId, data, posX, posY) {
          // 생성자 안에서 타워들의 속성을 정의한다고 생각하시면 됩니다!
          this.uniqueId = uniqueId;
          this.x = posX; // 타워 이미지 x 좌표
          this.y = posY; // 타워 이미지 y 좌표
          this.width = 65; // 타워 이미지 가로 길이
          this.height = 120; // 타워 이미지 세로 길이
          this.attackPower = data.attackPower; // 타워 공격력
          this.range = 300; // 타워 사거리
          this.price = data.price; // 타워 구입 비용
          this.cooldown = data.coolDown; // 타워 공격 쿨타임
          this.cool = data.coolDown; // 공격 쿨타임 (계산, 갱신용)
          this.beamDuration = data.beamDuration; // 타워 광선 지속 시간
          this.beamDu = data.beamDuration; // 타워 광선 지속 시간 (계산, 갱신용)
          this.target = null; // 타워 광선의 목표

          this.beamImage = new Image();
          this.beamImage.src = "../assets/images/beam2.png";

          this.towerImage = new Image();
          this.towerImage.src = data.image; // 타워 이미지 경로
     }

     draw(ctx) {
          // 타워 이미지 그리기
          ctx.drawImage(
               this.towerImage,
               this.x,
               this.y,
               this.width,
               this.height
          );

          // 빔이 발사 중일 때
          if (this.beamDu > 0 && this.target) {
               // 빔의 끝점
               const beamEndX = this.target.x + this.target.width / 2;
               const beamEndY = this.target.y + this.target.height / 2;

               // 각도 계산
               const deltaX = beamEndX - (this.x + this.width / 2);
               const deltaY = beamEndY - (this.y + this.height / 2);
               const angle = Math.atan2(deltaY, deltaX);

               // 빔 이미지 그리기
               ctx.save();
               ctx.translate(this.x + this.width / 2, this.y);
               ctx.rotate(angle);
               ctx.drawImage(this.beamImage, -50, -10, 350, 50);
               ctx.restore();

               // 빔의 지속 시간 감소
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
