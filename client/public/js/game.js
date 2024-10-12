import { Base } from './base.js';
import { Monster } from './monster.js';
import { Tower } from './tower.js';
import { CLIENT_VERSION } from './constants.js';
import { getGameAssets } from '../init/assets.js';

const { monsterAssetData, towerAssetData, gameAssetData, waveLevelAssetData } = getGameAssets();

const SERVER_URL = 'http://localhost:3080'; // 실제 서버 주소로 변경하세요.

/* 
  어딘가에 엑세스 토큰이 저장이 안되어 있다면 로그인을 유도하는 코드를 여기에 추가해주세요!
*/

let serverSocket; // 서버 웹소켓 객체
let sendEvent;
let sendMonsterEvent;
let sendTowerEvent;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const NUM_OF_MONSTERS = 6; // 몬스터 개수

let userGold = 0; // 유저 골드
let base; // 기지 객체
let baseHp = 0; // 기지 체력
let towerUniqueId = 1; // 타워 고유 아이디
let towerId = 1; // 타워 레벨로 사용하는 아이디
let towerType = 0; // 타워 종류
// let lastSetTowerImage = new Image();
// lastSetTowerImage.src = '../assets/images/tower.png'; // 마지막에 설치한 타워 이미지
let numOfInitialTowers = 0; // 초기 타워 개수
let monsterLevel = 0; // 몬스터 레벨
let monsterSpawnInterval = 0; // 몬스터 생성 주기

const monsters = [];
const towers = [];

let score = 0; // 게임 점수
let highScore = 0; // 기존 최고 점수
let isInitGame = false;
let isWaveChange = true;

// 이미지 로딩 파트
const backgroundImage = new Image();
backgroundImage.src = '../assets/images/bg.png';

const baseImage = new Image();
baseImage.src = '../assets/images/base.png';

const pathImage = new Image();
pathImage.src = '../assets/images/path.png';

const monsterImages = [];
for (let i = 1; i <= NUM_OF_MONSTERS; i++) {
  const img = new Image();
  img.src = `../assets/images/monster${i}.png`;
  monsterImages.push(img);
}

let monsterPath = [];

function generateMonsterPath() {
  const path = [];
  const centerX = 1600 / 2; // 캔버스 중앙 X
  const centerY = 950 / 2 - 100; // 캔버스 중앙 Y
  const spiral = 0.1;
  const numSegments = 100;

  // 나선형 경로
  for (let i = 0; i < numSegments; i++) {
    const angle = i * spiral;
    const radius = (numSegments - i) * 6;

    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    path.push({ x, y });
  }

  return path;
}

function initMap() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // 배경 이미지 그리기
  monsterPath = generateMonsterPath(); // 몬스터 경로 생성
  drawPath(); // 경로 그리기
}

function drawPath() {
  const segmentLength = 20; // 몬스터 경로 세그먼트 길이
  const imageWidth = 60; // 몬스터 경로 이미지 너비
  const imageHeight = 60; // 몬스터 경로 이미지 높이
  const gap = 5; // 몬스터 경로 이미지 겹침 방지를 위한 간격

  for (let i = 0; i < monsterPath.length - 1; i++) {
    const startX = monsterPath[i].x;
    const startY = monsterPath[i].y;
    const endX = monsterPath[i + 1].x;
    const endY = monsterPath[i + 1].y;

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY); // 거리 계산
    const angle = Math.atan2(deltaY, deltaX); // 각도 계산

    for (let j = gap; j < distance - gap; j += segmentLength) {
      const x = startX + Math.cos(angle) * j; // x좌표 계산
      const y = startY + Math.sin(angle) * j; // y좌표 계산
      drawRotatedImage(pathImage, x, y, imageWidth, imageHeight, angle);
    }
  }
}

function drawRotatedImage(image, x, y, width, height, angle) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(angle);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
}

function getRandomPositionNearPath(maxDistance) {
  // 타워 배치를 위한 몬스터가 지나가는 경로 상에서 maxDistance 범위 내에서 랜덤한 위치를 반환하는 함수!
  const segmentIndex = Math.floor(Math.random() * (monsterPath.length - 1));
  const startX = monsterPath[segmentIndex].x;
  const startY = monsterPath[segmentIndex].y;
  const endX = monsterPath[segmentIndex + 1].x;
  const endY = monsterPath[segmentIndex + 1].y;

  const t = Math.random();
  const posX = startX + t * (endX - startX);
  const posY = startY + t * (endY - startY);

  const offsetX = (Math.random() - 0.5) * 2 * maxDistance;
  const offsetY = (Math.random() - 0.5) * 4 * maxDistance;

  // 타워 스폰 X 좌표값 제한(랜덤 좌표용 조건문 - 현재는 초기 타워 스폰 좌표 초기화용)
  let sumX = posX + offsetX;
  if (sumX > 1750) sumX = 1700;
  else if (sumX < 10) sumX = 80;

  // 타워 스폰 Y 좌표값 제한(랜덤 좌표용 조건문 - 현재는 초기 타워 스폰 좌표 초기화용)
  let sumY = posY + offsetY;
  if (sumY > 900) sumY = 800;
  else if (sumY < 100) sumY = 200;

  console.log('posX + offsetX: ', posX + offsetX);
  console.log('posY + offsetY: ', posY + offsetY);

  return {
    x: sumX,
    y: sumY,
  };
}

function placeInitialTowers() {
  /* 
    타워를 초기에 배치하는 함수입니다.
    무언가 빠진 코드가 있는 것 같지 않나요? 
  */

  // 서버로 타워 초기화 정보 전송
  for (let i = 0; i < numOfInitialTowers; i++) {
    const { x, y } = getRandomPositionNearPath(200);

    sendTowerEvent(20, {
      uniqueId: towerUniqueId++,
      towerId: towerId,
      towerType: towerType,
      towerCount: i + 1,
      posX: x,
      posY: y,
    });
  }
}

function placeNewTower(towerPosX, towerPosY) {
  /* 
    타워를 구입할 수 있는 자원이 있을 때 타워 구입 후 랜덤 배치하면 됩니다.
    빠진 코드들을 채워넣어주세요! 
  */

  // 서버로 타워 구매 정보 전송
  //const { x, y } = getRandomPositionNearPath(200); // 구버전 - 랜덤 좌표
  sendTowerEvent(21, {
    userGold: userGold,
    uniqueId: towerUniqueId++,
    towerCount: towers.length,
    towerId: towerId,
    towerType: towerType,
    posX: towerPosX,
    posY: towerPosY,
  });
}

function sellTower(index) {
  sendTowerEvent(22, { tower: towers[index] });
}
/**
 * 타워 업그레이드
 * @param {int} index 선택된 타워index
 */
function upgradeTower(index) {
  sendTowerEvent(23, {
    tower: towers[index],
    beforeUniqueId: towers[index].uniqueId,
    afterUniqueId: towerUniqueId++,
    userGold: userGold,
    posX: towers[index].x,
    posY: towers[index].y,
  });
}

function placeBase() {
  const lastPoint = monsterPath[monsterPath.length - 1];
  base = new Base(lastPoint.x, lastPoint.y, baseHp);
  base.draw(ctx, baseImage);
}

function spawnMonster() {
  monsters.push(new Monster(monsterPath, monsterImages, monsterAssetData.data, monsterLevel));
  //  console.log("MONSTERS", MONSTERS);
}

// 서버에서 받은 monsterId를 통해 황금 고블린 생성하는 함수입니다.
function spawnGoldMonster(monsterId) {
  monsters.push(
    new Monster(monsterPath, monsterImages, monsterAssetData.data, monsterLevel, monsterId),
  );
}

function gameLoop() {
  // 렌더링 시에는 항상 배경 이미지부터 그려야 합니다! 그래야 다른 이미지들이 배경 이미지 위에 그려져요!
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // 배경 이미지 다시 그리기
  drawPath(monsterPath); // 경로 다시 그리기

  ctx.font = '25px Times New Roman';
  ctx.fillStyle = 'skyblue';
  ctx.fillText(`최고 기록: ${highScore}`, 100, 50); // 최고 기록 표시
  ctx.fillStyle = 'white';
  ctx.fillText(`점수: ${score}`, 100, 100); // 현재 스코어 표시
  ctx.fillStyle = 'yellow';
  ctx.fillText(`골드: ${userGold}`, 100, 150); // 골드 표시
  ctx.fillStyle = 'black';
  ctx.fillText(`현재 레벨: ${monsterLevel}`, 100, 200); // 최고 기록 표시

  // 타워 그리기 및 몬스터 공격 처리
  towers.forEach((tower) => {
    tower.draw(ctx);
    tower.updateCooldown();
    monsters.forEach((monster) => {
      const distance = Math.sqrt(
        Math.pow(tower.x - monster.x, 2) + Math.pow(tower.y - monster.y, 2),
      );
      if (distance < tower.range) {
        tower.attack(monster);
      }
    });
  });

  // 몬스터가 공격을 했을 수 있으므로 기지 다시 그리기
  base.draw(ctx, baseImage);

  for (let i = monsters.length - 1; i >= 0; i--) {
    const monster = monsters[i];
    if (monster.hp > 0) {
      const isDestroyed = monster.move(base);
      if (isDestroyed) {
        /* 게임 오버 */
        sendEvent(3, { timestamp: Date.now(), score });
        if (score > highScore) {
          alert('축하드립니다! 최고 점수를 달성하셨습니다!');
        }
      }
      monster.draw(ctx);
    } else {
      /* 몬스터가 죽었을 때 */

      if (monster.hp <= 0) {
        // const monsterId = monster.monsterId;
        // const incrementMoney = monster.reward;
        // const incrementScore = monster.score;
        // sendMonsterEvent(11, {
        //   monsterId,
        //   incrementMoney,
        //   incrementScore,
        // });
        // 웨이브 레벨업 서버에 요청하기 보내주기
      }
      monsters.splice(i, 1);
    }
  }

  requestAnimationFrame(gameLoop); // 지속적으로 다음 프레임에 gameLoop 함수 호출할 수 있도록 함
}

function changeWave() {
  if (
    waveLevelAssetData.data[monsterLevel] &&
    score >= waveLevelAssetData.data[monsterLevel].score &&
    isWaveChange
  ) {
    sendEvent(31, {
      score,
      currentLevel: monsterLevel,
      nextLevel: monsterLevel + 1,
    });
    isWaveChange = false;
  }
  // 만약 웨이브이전 점수보다 높으면 isWaveChange 다시 초기화
  if (
    waveLevelAssetData.data[monsterLevel - 1] &&
    score >= waveLevelAssetData.data[monsterLevel - 1].score &&
    !isWaveChange
  ) {
    isWaveChange = true;
  }
}

function initGame() {
  if (isInitGame) {
    return;
  }

  monsterPath = generateMonsterPath(); // 몬스터 경로 생성
  initMap(); // 맵 초기화 (배경, 몬스터 경로 그리기)
  placeInitialTowers(); // 설정된 초기 타워 개수만큼 사전에 타워 배치
  placeBase(); // 기지 배치

  setInterval(spawnMonster, monsterSpawnInterval); // 설정된 몬스터 생성 주기마다 몬스터 생성
  gameLoop(); // 게임 루프 최초 실행
  isInitGame = true;
}

// 이미지 로딩 완료 후 서버와 연결하고 게임 초기화
Promise.all([
  new Promise((resolve) => (backgroundImage.onload = resolve)),
  new Promise((resolve) => (baseImage.onload = resolve)),
  new Promise((resolve) => (pathImage.onload = resolve)),
  ...monsterImages.map((img) => new Promise((resolve) => (img.onload = resolve))),
  ...towers.map((tower) => new Promise((resolve) => (tower.image.onload = resolve))),
]).then(() => {
  /* 서버 접속 코드 (여기도 완성해주세요!) */
  let somewhere;
  serverSocket = io(SERVER_URL, {
    query: {
      clientVersion: CLIENT_VERSION,
      token: localStorage.getItem('jwt'),
    },
  });

  serverSocket.on('connect', () => {
    console.log('서버에 연결되었습니다.');
  });

  let userId = null;
  serverSocket.on('connected', async (data) => {
    console.log('서버에서 연결 정보를 받았습니다.', data);
    userId = data.uuid;
    sendEvent(2);
  });

  /* 서버 연결 오류 시 */
  serverSocket.on('connect_error', (err) => {
    console.error('서버 연결 오류:', err.message);
    alert('서버에 연결할 수 없습니다. 다시 시도해주세요.');
  });

  serverSocket.on('response', (data) => {
    if (data.type === 'gameStart') {
      userGold = +data.result.userGold;
      baseHp = +data.result.baseHp;
      score = +data.result.score;
      numOfInitialTowers = +data.result.numOfInitialTowers;
      monsterLevel = +data.result.monsterLevel;
      monsterSpawnInterval = +data.result.monsterSpawnInterval;
      highScore = +data.highScore;
    }
    if (!isInitGame) {
      initGame();
    }

    if (data.type === 'gameEnd') {
      console.log(data.message);
      alert('게임 오버. 스파르타 본부를 지키지 못했다...ㅠㅠ');
      location.reload();
    }

    if (data.type === 'setTower') {
      responseSetTower(data);
      if (data.result.userGold) {
        userGold = +data.result.userGold;
      }
    }

    if (data.type === 'sellTower') {
      responseSellTower(data);
      userGold = +data.result.userGold;
    }

    if (data.type === 'upgradeTower') {
      responseUpgradeTower(data);
      userGold = +data.result.userGold;
    }

    if (data.type === 'waveLevelIncrease') {
      console.log(data.message);
      if (data.waveLevel) monsterLevel = data.waveLevel; // 몬스터레벨 동기화
    }

    if (data.type === 'killMonster') {
      userGold = +data.result.userGold;
      score = +data.result.score;
      changeWave();
      sendEvent(13);
    }

    if (data.type === 'attackedByMonster') {
      baseHp = +data.result.attackPower;
    }

    if (data.type === 'createGoldMonster') {
      if (data.result.goldMonsterId) {
        spawnGoldMonster(data.result.goldMonsterId); // 황금 고블린 생성
      }
    }
  });

  // 이벤트 send
  sendEvent = (handlerId, payload) => {
    serverSocket.emit('event', {
      clientVersion: CLIENT_VERSION,
      userId,
      handlerId,
      payload,
    });
  };

  // 몬스터 이벤트 send
  sendMonsterEvent = (handlerId, payload) => {
    serverSocket.emit('monsterEvent', {
      clientVersion: CLIENT_VERSION,
      userId,
      handlerId,
      payload,
    });
  };

  // 타워 이벤트 send
  sendTowerEvent = (handlerId, payload) => {
    serverSocket.emit('towerEvent', {
      clientVersion: CLIENT_VERSION,
      userId,
      handlerId,
      payload,
    });
  };
});

export { sendEvent, sendMonsterEvent, sendTowerEvent };

//----------------------------------------------------- 여기서부터 아래는 response에서 호출되는 함수

/**
 * response 받을때 불러오는 setTower 함수
 * @param {Object} data
 */
function responseSetTower(data) {
  // 클라이언트에 타워 객체 생성
  const TOWER = new Tower(
    data.result.uniqueId,
    data.result.tower,
    data.result.posX,
    data.result.posY,
  );
  towers.push(TOWER);
}

/**
 * response 받을때 불러오는 sellTower 함수
 * @param {Object} data
 */
function responseSellTower(data) {
  // 클라이언트에서 판매할 타워 탐색
  const sellTower = data.result.tower;
  const index = towers.findIndex((tower) => tower.uniqueId === sellTower.uniqueId);

  // 탐색 결과를 기반으로 판매
  if (index !== -1) {
    // 판매할 타워 클라이언트에서 제거
    towers.splice(index, 1);
  } else {
    console.log('판매할 타워를 찾지 못했습니다.');
  }
}

/**
 * response 받을때 불러오는 upradeTower 함수
 * @param {Object} data
 */
function responseUpgradeTower(data) {
  // 클라이언트에서 삭제 타워 탐색   
  const index = towers.findIndex((tower) => tower.uniqueId === data.result.beforeUniqueId);
  // 탐색 결과를 기반으로 삭제
  if (index !== -1) {
    // 삭제할 타워 클라이언트에서 제거
    towers.splice(index, 1);
  } else {
    console.log('삭제할 타워를 찾지 못했습니다.');
  }
  // 클라이언트에 타워 객체 생성
  const TOWER = new Tower(
    data.result.afterUniqueId,
    data.result.tower,
    data.result.posX,
    data.result.posY,
  );
  towers.push(TOWER);
}


//----------------------------------------------------- 여기서부터 아래는 버튼

// 타워 구입 버튼 생성
const buyTowerButton = document.createElement('button');
buyTowerButton.textContent = '타워 구입';
buyTowerButton.style.position = 'absolute';
buyTowerButton.style.top = '10px';
buyTowerButton.style.right = '10px';
buyTowerButton.style.padding = '10px 20px';
buyTowerButton.style.fontSize = '16px';
buyTowerButton.style.cursor = 'pointer';
buyTowerButton.style.display = 'none'; // 초기에는 버튼을 숨긴 상태
buyTowerButton.disabled = true; // 초기에는 비활성화 상태

// 타워 판매 버튼 생성
const sellTowerButton = document.createElement('button');
sellTowerButton.textContent = '타워 판매';
sellTowerButton.style.position = 'absolute';
sellTowerButton.style.top = '70px'; // 판매 버튼 위치 기본값
sellTowerButton.style.right = '10px'; // 판매 버튼 위치 기본값
sellTowerButton.style.padding = '10px 20px';
sellTowerButton.style.fontSize = '16px';
sellTowerButton.style.cursor = 'pointer';
sellTowerButton.style.display = 'none'; // 초기에는 버튼을 숨긴 상태
sellTowerButton.disabled = true; // 초기에는 비활성화 상태

// 타워 업그레이드 버튼 생성
const upgradeTowerButton = document.createElement('button');
upgradeTowerButton.textContent = '업그레이드';
upgradeTowerButton.style.position = 'absolute';
upgradeTowerButton.style.top = '70px'; // 업그레이드 버튼 위치 기본값
upgradeTowerButton.style.right = '10px'; // 업그레이드 버튼 위치 기본값
upgradeTowerButton.style.padding = '10px 20px';
upgradeTowerButton.style.fontSize = '16px';
upgradeTowerButton.style.cursor = 'pointer';
upgradeTowerButton.style.display = 'none'; // 초기에는 버튼을 숨긴 상태
upgradeTowerButton.disabled = true; // 초기에는 비활성화 상태

// addEventListener 함수에서 버튼의 disabled과 값이
// 변경되는 부분들은 사실 없어도 되는 코드이다
// 하지만 확실하게 비활성화 시키기 위해 함수 내에서 변경시키고있다.

// 버튼이 벽에 너무 붙으면 글자가 밀린다(필요하면 안밀리도록 코드 수정할 예정)

// 타워 클릭 이벤트 핸들러
let selectedTowerIndex = null; // 현재 선택된 타워의 인덱스 저장

// 타워 스폰 위치 변수
let towerPosX = 0;
let towerPosY = 0;

// 버튼 클릭 이벤트
canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  let towerFoundState = false;

  // 타워 목록을 순회하여 클릭한 위치에 타워가 있는지 확인
  towers.forEach((tower, index) => {
    // 타워 그림(사각형) 내부에서 클릭했는지 확인
    if (
      mouseX >= tower.x &&
      mouseX <= tower.x + tower.width &&
      mouseY >= tower.y &&
      mouseY <= tower.y + tower.height
    ) {
      // 선택 타워 출력 로그
      selectedTowerIndex = index;
      console.log(`${selectedTowerIndex + 1}번째 타워 선택됨`);
      // 타워 레벨(Id)과 종류(Type) 을 설정(스테이지에 따라 레벨과 종류가 바뀐다면 추후 수정 필요)
      towerId = 1;
      towerType = 0;
      // 버튼 위치 설정(기획이 변경되면 계산식 수정)
      // 판매 및 업그레이드 버튼 - 타워 머리 위로 표시
      sellTowerButton.style.right = `${rect.right - tower.x - 95}px`;
      sellTowerButton.style.top = `${rect.top + tower.y - 100}px`;
      upgradeTowerButton.style.right = `${rect.right - tower.x - 101}px`;
      upgradeTowerButton.style.top = `${rect.top + tower.y - 50}px`;
      // 타워가 선택되면
      // 판매 및 업그레이드 버튼 활성화
      sellTowerButton.style.display = 'block';
      sellTowerButton.disabled = false;
      upgradeTowerButton.style.display = 'block';
      upgradeTowerButton.disabled = false;
      // 구매 버튼 비활성화
      buyTowerButton.style.display = 'none';
      buyTowerButton.disabled = true;

      towerFoundState = true;
    }
  });

  // 타워를 클릭하지 않았을 경우
  if (!towerFoundState) {
    // 타워 생성 버튼 - 마우스 클릭 위치에 표시
    towerPosX = event.clientX - 125;
    towerPosY = rect.top + event.clientY;
    buyTowerButton.style.right = `${rect.right - towerPosX - 95}px`;
    buyTowerButton.style.top = `${towerPosY}px`;
    // 선택된 타워가 없으면 판매 및 업그레이드 버튼 비활성화
    sellTowerButton.style.display = 'none';
    sellTowerButton.disabled = true;
    upgradeTowerButton.style.display = 'none';
    upgradeTowerButton.disabled = true;
    buyTowerButton.style.display = 'block';
    buyTowerButton.disabled = false;
    // 선택된 인덱스 초기화
    selectedTowerIndex = null;
  }
});

// 타워 생성 버튼 이벤트
buyTowerButton.addEventListener('click', () => {
  // 타워가 선택된 상태가 아닐 경우
  if (selectedTowerIndex === null) {
    // 타워 생성 함수 호출
    placeNewTower(towerPosX, towerPosY);
    // 타워를 생성한 후
    // 타워 생성 버튼 비활성화
    buyTowerButton.style.display = 'none';
    buyTowerButton.disabled = true;
    // 타워 생성 스폰 좌표 초기화
    towerPosX = 0;
    towerPosY = 0;
  }
});
document.body.appendChild(buyTowerButton);

// 타워 판매 버튼 이벤트
sellTowerButton.addEventListener('click', () => {
  // 타워가 선택된 상태일 경우
  if (selectedTowerIndex !== null) {
    // 판매 함수 호출
    sellTower(selectedTowerIndex);
    // 타워를 판매한 후
    // 타워 판매 버튼 비활성화
    sellTowerButton.style.display = 'none';
    sellTowerButton.disabled = true;
    // 타워 업그레이드 버튼 비활성화
    upgradeTowerButton.style.display = 'none';
    upgradeTowerButton.disabled = true;
    // 선택된 인덱스 초기화
    selectedTowerIndex = null;
  }
});
document.body.appendChild(sellTowerButton);

// 타워 업그레이드 버튼 이벤트
upgradeTowerButton.addEventListener('click', () => {
  // 타워가 선택된 상태일 경우
  if (selectedTowerIndex !== null) {
    // 내용 미구현
    upgradeTower(selectedTowerIndex);

    // 타워 판매 버튼 비활성화
    sellTowerButton.style.display = 'none';
    sellTowerButton.disabled = true;
    // 타워 업그레이드 버튼 비활성화
    upgradeTowerButton.style.display = 'none';
    upgradeTowerButton.disabled = true;
    // 선택된 인덱스 초기화
    selectedTowerIndex = null;
  }
});
document.body.appendChild(upgradeTowerButton);
