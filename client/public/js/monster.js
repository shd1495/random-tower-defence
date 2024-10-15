export class Monster {
  constructor(path, monsterImages, monsters, monsterLevel, monsterId) {
    // 생성자 안에서 몬스터의 속성을 정의한다고 생각하시면 됩니다!
    if (!path || path.length <= 0) {
      throw new Error('몬스터가 이동할 경로가 필요합니다.');
    }

    if (monsterId) {
      this.monsterId = monsterId;
    } else {
      this.monsterId = Math.floor(Math.random() * (monsters.length - 1)) + 1; // 몬스터 번호 (1 ~ 5. 몬스터를 추가해도 숫자가 자동으로 매겨집니다!) // 이부분 수정하기
    }

    this.path = path; // 몬스터가 이동할 경로
    this.currentIndex = 0; // 몬스터가 이동 중인 경로의 인덱스
    this.x = path[0].x; // 몬스터의 x 좌표 (최초 위치는 경로의 첫 번째 지점)

    this.y = path[0].y; // 몬스터의 y 좌표 (최초 위치는 경로의 첫 번째 지점)
    this.width = 80; // 몬스터 이미지 가로 길이
    this.height = 80; // 몬스터 이미지 세로 길이
    // 몬스터의 이동 속도
    this.image = monsterImages[this.monsterId - 1]; // 몬스터 이미지
    this.level = monsterLevel; // 몬스터 레벨

    // 몬스터 이속 감소
    this.normalSpeed = this.speed;
    this.isSlowed = false;

    this.init(monsters, this.level);
  }

  init(monsters, level) {
    this.maxHp = (monsters[this.monsterId - 1].hp * level * 0.66).toFixed(0); // 몬스터의 현재 HP
    this.hp = this.maxHp; // 몬스터의 현재 HP
    this.speed = monsters[this.monsterId - 1].speed * level;
    this.attackPower = monsters[this.monsterId - 1].power * level;
    this.score = monsters[this.monsterId - 1].score * level;
    this.reward = monsters[this.monsterId - 1].reward * level;
  }

  move(base) {
    if (this.currentIndex < this.path.length - 1) {
      const nextPoint = this.path[this.currentIndex + 1];

      const deltaX = nextPoint.x - this.x;
      const deltaY = nextPoint.y - this.y;
      // 2차원 좌표계에서 두 점 사이의 거리를 구할 땐 피타고라스 정리를 활용하면 됩니다! a^2 = b^2 + c^2니까 루트를 씌워주면 되죠!
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < this.speed) {
        // 거리가 속도보다 작으면 다음 지점으로 이동시켜주면 됩니다!
        this.currentIndex++;
      } else {
        // 거리가 속도보다 크면 일정한 비율로 이동하면 됩니다. 이 때, 단위 벡터와 속도를 곱해줘야 해요!
        this.x += (deltaX / distance) * this.speed; // 단위 벡터: deltaX / distance
        this.y += (deltaY / distance) * this.speed; // 단위 벡터: deltaY / distance
      }
      return false;
    } else {
      const isDestroyed = base.takeDamage(this.monsterId, this.attackPower);

      this.hp = 0;
      return isDestroyed;
    }
  }

  slow() {
    if (!this.isSlowed) {
      this.normalSpeed = this.speed;
      this.speed = this.normalSpeed * 0.5;
      this.isSlowed = true;
    }
  }
  normal() {
    if (this.isSlowed) {
      this.speed = this.normalSpeed;
      this.isSlowed = false;
    }
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    ctx.font = '15px "bitbit"';
    ctx.fillStyle = 'white';
    ctx.fillText(`(레벨 ${this.level}) ${this.hp}/${this.maxHp}`, this.x, this.y - 5);

    if (this.isSlowed) {
      ctx.fillStyle = 'red';
      ctx.fillText('느려짐', this.x, this.y - 20);
    }
  }
}
