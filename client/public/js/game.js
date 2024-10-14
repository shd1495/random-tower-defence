import { Base } from './base.js';
import { Monster } from './monster.js';
import { Tower } from './tower.js';
import { CLIENT_VERSION } from './constants.js';
import { getGameAssets } from '../init/assets.js';
import { extendAccessToken } from '../utils/extendAccessToken.js';

const { monsterAssetData, towerAssetData, gameAssetData, waveLevelAssetData } = getGameAssets();

const SERVER_URL = 'http://localhost:3080'; // 실제 서버 주소로 변경하세요.

/* 
  어딘가에 엑세스 토큰이 저장이 안되어 있다면 로그인을 유도하는 코드를 여기에 추가해주세요!
*/
extendAccessToken();

let serverSocket; // 서버 웹소켓 객체
let sendEvent;
let sendMonsterEvent;
let sendTowerEvent;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 느림 장판 배열
let slowEffects = [];
let slowEffectCooldown = 0;
const SLOW_EFFECT_COOLDOWN = 1000;

const NUM_OF_MONSTERS = 6; // 몬스터 개수

let userGold = 0; // 유저 골드
let base; // 기지 객체
let baseHp = 0; // 기지 체력
let towerUniqueId = 1; // 타워 고유 아이디
let towerType = 0; // 타워 종류
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

const scoreBoardImage = new Image();
scoreBoardImage.src = '../assets/images/ScoreBoard3.png';

const monsterImages = [];
for (let i = 1; i <= NUM_OF_MONSTERS; i++) {
  const img = new Image();
  img.src = `../assets/images/monster${i}.png`;
  monsterImages.push(img);
}

function drawScoreboard(ctx, scoreBoardImage) {
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;

  // 상대적인 위치 및 크기 계산
  const x = canvasWidth * 0;
  const y = canvasHeight * 0;
  const width = canvasWidth * 0.25; //
  const height = width * 0.6;

  ctx.drawImage(scoreBoardImage, x, y, width, height);
}
let monsterPath = [];
let bgm = null;
let bgmInitialized = false;

function initializeBGM() {
  if (!bgmInitialized) {
    bgm = new Audio('../assets/sound/bgmSound.mp3');
    bgm.loop = true;
    bgm.volume = 0.15;
    bgm.play();
    bgmInitialized = true;
  }
}
initializeBGM();

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

function drawSlowEffects(ctx) {
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = 'blue';
  slowEffects.forEach((effect) => {
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
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
      // towers DB 와 검증할 데이터들
      uniqueId: towerUniqueId++,
      towerCount: i + 1,
      clientTowers: towers,
      towerType: towerType,
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
    // getUserGold 와 검증할 데이터
    userGold: userGold,
    // towers DB 와 검증할 데이터들
    uniqueId: towerUniqueId++,
    towerCount: towers.length,
    clientTowers: towers,
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
    posX: towers[index].x + 190,
    posY: towers[index].y + 120,
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

// 느려짐 효과 생성기(장판 생성 버튼) (createSlowEffect, isClickOnPath, isPointNearLine, updateSlowEffects)
function createSlowEffect(rightBtnX, rightBtnY) {
  // const position = getRandomPositionOnPath();
  // slowEffects.push({
  //   x: position.posX,
  //   y: position.posY,
  //   radius: 50,
  //   duration: 5000,
  //   createdAt: Date.now(),
  // });
  if (slowEffectCooldown > 0) {
    return;
  }

  slowEffects.push({
    x: rightBtnX,
    y: rightBtnY,
    radius: 50,
    duration: 5000,
    createdAt: Date.now(),
  });

  slowEffectCooldown = SLOW_EFFECT_COOLDOWN;
}

// 마우스 포인터로 지정한 위치에 스킬을 쓰게 만드는 것 구현하기
// slowEffect 시간 지나면 사라지도록
function updateSlowEffects() {
  const now = Date.now();
  slowEffects = slowEffects.filter((effect) => now - effect.createdAt < effect.duration);
}

let lastTime = 0;
const fps = 60;
const interval = 1000 / fps;

function gameLoop(currentTime) {
  //   requestAnimationFrame(gameLoop);
  const delta = currentTime - lastTime;

  if (delta >= interval) {
    lastTime = currentTime - (delta % interval);
    // 렌더링 시에는 항상 배경 이미지부터 그려야 합니다! 그래야 다른 이미지들이 배경 이미지 위에 그려져요!
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // 배경 이미지 다시 그리기
    drawScoreboard(ctx, scoreBoardImage);
    drawPath(monsterPath); // 경로 다시 그리기

    ctx.font = '25px "bitbit"';
    ctx.fillStyle = 'pink';
    ctx.fillText(`최고 기록: ${highScore}`, 100, 50); // 최고 기록 표시
    ctx.fillStyle = 'white';
    ctx.fillText(`점수: ${score}`, 100, 100); // 현재 스코어 표시
    ctx.fillStyle = 'yellow';
    ctx.fillText(`골드: ${userGold}`, 100, 150); // 골드 표시
    ctx.fillStyle = 'skyblue';
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

    // 느림 장판 설정
    drawSlowEffects(ctx);
    updateSlowEffects();

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

        // 몬스터 느려짐 효과 적용
        let isInSlowEffect = false;
        slowEffects.forEach((effect) => {
          const deltaX = monster.x - effect.x + effect.radius / 2;
          const deltaY = monster.y - effect.y;

          const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
          if (distance < effect.radius) {
            isInSlowEffect = true;
          }
        });

        if (isInSlowEffect) {
          monster.slow();
        } else {
          monster.normal();
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
          // 웨이브 레벨업  요청하기 보내주기
        }
        monsters.splice(i, 1);
      }
    }
  }

  if (slowEffectCooldown > 0) {
    slowEffectCooldown -= 10;
    if (slowEffectCooldown < 0) {
      slowEffectCooldown = 0;
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
  drawScoreboard(ctx, scoreBoardImage);

  setInterval(spawnMonster, monsterSpawnInterval); // 설정된 몬스터 생성 주기마다 몬스터 생성

  // 58분마다 한번씩 토큰연장 현재 토큰 만료시간이 1시간으로 지정해놔서 게임실행 중 58분마다 연장해 주는 걸로 했습니다.
  // setInterval(extendAccessToken, 7 * 60 * 1000);
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

  /* 토큰 유효하지 않을 시 */
  // 토큰 만료 시
  serverSocket.on('tokenExpired', (data) => {
    console.log(data.message);
    alert('세션이 만료되었습니다. 다시 로그인해 주세요.');

    window.location.href = 'index.html';
  });

  // 토큰 조작 시
  serverSocket.on('unauthorized', (data) => {
    console.log(data.message);
    alert('유효하지 않은 토큰입니다.');

    window.location.href = 'index.html';
  });

  serverSocket.on('response', (data) => {
    if (data.type === 'gameStart' && data.status === 'success') {
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

    if (data.type === 'gameEnd' && data.status === 'success') {
      console.log(data.message);
      alert('게임 오버. 스파르타 본부를 지키지 못했다...ㅠㅠ');
      location.reload();
    }

    if (data.type === 'setTower' && data.status === 'success') {
      responseSetTower(data);
      if (data.result.userGold) {
        userGold = +data.result.userGold;
      }
    }

    if (data.type === 'sellTower' && data.status === 'success') {
      responseSellTower(data);
      userGold = +data.result.userGold;
    }

    if (data.type === 'upgradeTower' && data.status === 'success') {
      responseUpgradeTower(data);
      userGold = +data.result.userGold;
    }

    if (data.type === 'waveLevelIncrease' && data.status === 'success') {
      console.log(data.message);
      if (data.waveLevel) monsterLevel = data.waveLevel; // 몬스터레벨 동기화
      if (data.monsterSpawnInterval) monsterSpawnInterval = data.monsterSpawnInterval;
      console.log(monsterSpawnInterval, data.monsterSpawnInterval);
    }

    if (data.type === 'killMonster' && data.status === 'success') {
      userGold = +data.result.userGold;
      score = +data.result.score;
      changeWave();
      sendEvent(13);
    }

    if (data.type === 'attackedByMonster' && data.status === 'success') {
      baseHp = +data.result.attackPower;
    }

    if (data.type === 'createGoldMonster' && data.status === 'success') {
      if (data.result.goldMonsterId) {
        spawnGoldMonster(data.result.goldMonsterId); // 황금 고블린 생성
      }
    }

    if (data.status === 'fail') {
      alert(data.message);
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
 * response 받을때 불러오는 upgradeTower 함수
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
    data.result.uniqueId,
    data.result.tower,
    data.result.posX,
    data.result.posY,
  );
  towers.push(TOWER);
}

//----------------------------------------------------- 여기서부터 아래는 버튼

// 타워1 구입 버튼 생성
const buyTowerButton1 = document.createElement('button');
buyTowerButton1.textContent = '타워1 구입';
buyTowerButton1.style.width = '150px'; // 버튼의 가로 크기 설정
buyTowerButton1.style.height = '50px'; // 버튼의 세로 크기 설정
buyTowerButton1.style.position = 'absolute';
buyTowerButton1.style.top = '10px';
buyTowerButton1.style.right = '10px';
buyTowerButton1.style.padding = '10px 20px';
buyTowerButton1.style.fontSize = '16px';
buyTowerButton1.style.cursor = 'pointer';
buyTowerButton1.style.display = 'none'; // 초기에는 버튼을 숨긴 상태
buyTowerButton1.disabled = true; // 초기에는 비활성화 상태

// 일반 타워2 구입 버튼 생성
const buyTowerButton2 = document.createElement('button');
buyTowerButton2.textContent = '타워2 구입';
buyTowerButton2.style.width = '150px'; // 버튼의 가로 크기 설정
buyTowerButton2.style.height = '50px'; // 버튼의 세로 크기 설정
buyTowerButton2.style.position = 'absolute';
buyTowerButton2.style.top = '10px';
buyTowerButton2.style.right = '10px';
buyTowerButton2.style.padding = '10px 20px';
buyTowerButton2.style.fontSize = '16px';
buyTowerButton2.style.cursor = 'pointer';
buyTowerButton2.style.display = 'none'; // 초기에는 버튼을 숨긴 상태
buyTowerButton2.disabled = true; // 초기에는 비활성화 상태

// 일반 타워2 구입 버튼 생성
const buyTowerButton3 = document.createElement('button');
buyTowerButton3.textContent = '타워3 구입';
buyTowerButton3.style.width = '150px'; // 버튼의 가로 크기 설정
buyTowerButton3.style.height = '50px'; // 버튼의 세로 크기 설정
buyTowerButton3.style.position = 'absolute';
buyTowerButton3.style.top = '10px';
buyTowerButton3.style.right = '10px';
buyTowerButton3.style.padding = '10px 20px';
buyTowerButton3.style.fontSize = '16px';
buyTowerButton3.style.cursor = 'pointer';
buyTowerButton3.style.display = 'none'; // 초기에는 버튼을 숨긴 상태
buyTowerButton3.disabled = true; // 초기에는 비활성화 상태

// 타워 판매 버튼 생성
const sellTowerButton = document.createElement('button');
sellTowerButton.textContent = '타워 판매';
sellTowerButton.style.width = '150px'; // 버튼의 가로 크기 설정
sellTowerButton.style.height = '50px'; // 버튼의 세로 크기 설정
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
upgradeTowerButton.style.width = '150px'; // 버튼의 가로 크기 설정
upgradeTowerButton.style.height = '50px'; // 버튼의 세로 크기 설정
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
      mouseX <= tower.x + tower.width * tower.imgMagnification &&
      mouseY >= tower.y &&
      mouseY <= tower.y + tower.height * tower.imgMagnification
    ) {
      // 선택 타워 출력 로그
      selectedTowerIndex = index;
      console.log(`${selectedTowerIndex + 1}번째 타워 선택됨`);
      // 버튼 위치 설정(기획이 변경되면 계산식 수정)
      // 판매 및 업그레이드 버튼 - 타워 머리 위로 표시
      upgradeTowerButton.style.left = `${rect.left + tower.x + (tower.width * tower.imgMagnification) / 2 + 50}px`;
      upgradeTowerButton.style.top = `${rect.top + tower.y + (tower.height * tower.imgMagnification) / 2 - 50}px`;
      sellTowerButton.style.left = `${rect.left + tower.x + (tower.width * tower.imgMagnification) / 2 - 200}px`;
      sellTowerButton.style.top = `${rect.top + tower.y + (tower.height * tower.imgMagnification) / 2 - 50}px`;
      // 타워가 선택되면
      // 판매 및 업그레이드 버튼 활성화
      upgradeTowerButton.style.display = 'block';
      upgradeTowerButton.disabled = false;
      sellTowerButton.style.display = 'block';
      sellTowerButton.disabled = false;
      // 구매 버튼 비활성화
      buyTowerButton1.style.display = 'none';
      buyTowerButton1.disabled = true;
      buyTowerButton2.style.display = 'none';
      buyTowerButton2.disabled = true;
      buyTowerButton3.style.display = 'none';
      buyTowerButton3.disabled = true;

      towerFoundState = true;
    }
  });

  // 타워를 클릭하지 않았을 경우
  if (!towerFoundState) {
    // 타워 생성 버튼 - 마우스 클릭 위치에 표시
    towerPosX = event.clientX;
    towerPosY = event.clientY;
    buyTowerButton1.style.left = `${towerPosX - 75}px`;
    buyTowerButton1.style.top = `${towerPosY - 75}px`;
    buyTowerButton2.style.left = `${towerPosX - 175}px`;
    buyTowerButton2.style.top = `${towerPosY + 25}px`;
    buyTowerButton3.style.left = `${towerPosX + 25}px`;
    buyTowerButton3.style.top = `${towerPosY + 25}px`;
    // 선택된 타워가 없으면 판매 및 업그레이드 버튼 비활성화
    upgradeTowerButton.style.display = 'none';
    upgradeTowerButton.disabled = true;
    sellTowerButton.style.display = 'none';
    sellTowerButton.disabled = true;
    buyTowerButton1.style.display = 'block';
    buyTowerButton1.disabled = false;
    buyTowerButton2.style.display = 'block';
    buyTowerButton2.disabled = false;
    buyTowerButton3.style.display = 'block';
    buyTowerButton3.disabled = false;
    // 선택된 인덱스 초기화
    selectedTowerIndex = null;
  }
});

// 타워1 생성 버튼 이벤트
buyTowerButton1.addEventListener('click', () => {
  // 타워 종류(Type)를 설정(스테이지에 따라 레벨과 종류가 바뀐다면 추후 수정 필요)
  towerType = 0;
  buyTowerButton();
});
document.body.appendChild(buyTowerButton1);

// 타워2 생성 버튼 이벤트
buyTowerButton2.addEventListener('click', () => {
  // 타워 종류(Type)를 설정(스테이지에 따라 레벨과 종류가 바뀐다면 추후 수정 필요)
  towerType = 3;
  buyTowerButton();
});
document.body.appendChild(buyTowerButton2);

// 타워3 생성 버튼 이벤트
buyTowerButton3.addEventListener('click', () => {
  // 타워 종류(Type)를 설정(스테이지에 따라 레벨과 종류가 바뀐다면 추후 수정 필요)
  towerType = 6;
  buyTowerButton();
});
document.body.appendChild(buyTowerButton3);

// 타워 생성 버튼 이벤트 로직
function buyTowerButton() {
  // 타워가 선택된 상태가 아닐 경우
  if (selectedTowerIndex === null) {
    // 타워 생성 함수 호출
    placeNewTower(towerPosX, towerPosY);
    // 타워를 생성한 후
    // 타워 생성 버튼 비활성화
    buyTowerButton1.style.display = 'none';
    buyTowerButton1.disabled = true;
    buyTowerButton2.style.display = 'none';
    buyTowerButton2.disabled = true;
    buyTowerButton3.style.display = 'none';
    buyTowerButton3.disabled = true;
    // 타워 생성 스폰 좌표 초기화
    towerPosX = 0;
    towerPosY = 0;
  }
}

// 타워 판매 버튼 이벤트
sellTowerButton.addEventListener('click', () => {
  // 타워가 선택된 상태일 경우
  if (selectedTowerIndex !== null) {
    // 판매 함수 호출
    sellTower(selectedTowerIndex);
    // 타워를 판매한 후
    // 타워 업그레이드 버튼 비활성화
    upgradeTowerButton.style.display = 'none';
    upgradeTowerButton.disabled = true;
    // 타워 판매 버튼 비활성화
    sellTowerButton.style.display = 'none';
    sellTowerButton.disabled = true;
    // 선택된 인덱스 초기화
    selectedTowerIndex = null;
  }
});
document.body.appendChild(sellTowerButton);

// 타워 업그레이드 버튼 이벤트
upgradeTowerButton.addEventListener('click', () => {
  // 타워가 선택된 상태일 경우
  if (selectedTowerIndex !== null && towers[selectedTowerIndex].nextGradeId !== -1) {
    // 업그레이드 함수 호출
    upgradeTower(selectedTowerIndex);

    // 타워 업그레이드 버튼 비활성화
    upgradeTowerButton.style.display = 'none';
    upgradeTowerButton.disabled = true;
    // 타워 판매 버튼 비활성화
    sellTowerButton.style.display = 'none';
    sellTowerButton.disabled = true;
    // 선택된 인덱스 초기화
    selectedTowerIndex = null;
  } else if (towers[selectedTowerIndex].nextGradeId === -1)
    console.log('업그레이드 할 타워 레벨이 MAX 입니다.');
});
document.body.appendChild(upgradeTowerButton);

// 마우스 오른쪽 버튼 클릭 (느림 장판 만들기)
canvas.addEventListener('contextmenu', (event) => {
  event.preventDefault(); // 기본 메뉴 차단 (캔버스 상에서 기본 컨텍스트 메뉴 안나오게 설정)
  // 캔버스 내부의 모든 요소들의 위치와 크기를 rect 객체로 챙겨와,
  const rect = canvas.getBoundingClientRect();

  // 마우스 클릭 순간 브라우저 창의 왼쪽 경계부터 마우스 포인터의 x, y좌표
  // client는 페이지 전체 좌표로 클릭한 곳이 canvas 내 어느 위치인지 확인하려면 canvas 내부의 요소의 left, top값을 빼줘야 한다(마우스가 클릭한 위치를 canvas 내부에서 상대적으로 찾는 것)
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  if (
    mouseX >= 0 &&
    mouseX <= canvas.width &&
    mouseY >= 0 &&
    mouseY <= canvas.height &&
    slowEffectCooldown === 0
  ) {
    createSlowEffect(mouseX, mouseY);
  }
});
