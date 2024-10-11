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

const NUM_OF_MONSTERS = 5; // 몬스터 개수

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
backgroundImage.src = '../assets/images/bg.webp';

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

let monsterPath;

function generateRandomMonsterPath() {
  const path = [];
  let currentX = 0;
  let currentY = 500; // 500 ~ 520 범위의 y 시작 (캔버스 y축 중간쯤에서 시작할 수 있도록 유도)

  path.push({ x: currentX, y: currentY });

  while (currentX < canvas.width) {
    currentX += Math.floor(Math.random() * 100) + 50; // 50 ~ 150 범위의 x 증가
    // x 좌표에 대한 clamp 처리
    if (currentX > canvas.width) {
      currentX = canvas.width;
    }

    currentY += Math.floor(Math.random() * 200) - 100; // -100 ~ 100 범위의 y 변경
    // y 좌표에 대한 clamp 처리
    if (currentY < 0) {
      currentY = 0;
    }
    if (currentY > canvas.height) {
      currentY = canvas.height;
    }

    path.push({ x: currentX, y: currentY });
  }

  return path;
}

function initMap() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // 배경 이미지 그리기
  drawPath();
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
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY); // 피타고라스 정리로 두 점 사이의 거리를 구함 (유클리드 거리)
    const angle = Math.atan2(deltaY, deltaX); // 두 점 사이의 각도는 tan-1(y/x)로 구해야 함 (자세한 것은 역삼각함수 참고): 삼각함수는 변의 비율! 역삼각함수는 각도를 구하는 것!

    for (let j = gap; j < distance - gap; j += segmentLength) {
      // 사실 이거는 삼각함수에 대한 기본적인 이해도가 있으면 충분히 이해하실 수 있습니다.
      // 자세한 것은 https://thirdspacelearning.com/gcse-maths/geometry-and-measure/sin-cos-tan-graphs/ 참고 부탁해요!
      const x = startX + Math.cos(angle) * j; // 다음 이미지 x좌표 계산(각도의 코사인 값은 x축 방향의 단위 벡터 * j를 곱하여 경로를 따라 이동한 x축 좌표를 구함)
      const y = startY + Math.sin(angle) * j; // 다음 이미지 y좌표 계산(각도의 사인 값은 y축 방향의 단위 벡터 * j를 곱하여 경로를 따라 이동한 y축 좌표를 구함)
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

  // 타워 스폰 X 좌표값 제한
  let sumX = posX + offsetX;
  if (sumX > 1750) sumX = 1700;
  else if (sumX < 10) sumX = 80;

  // 타워 스폰 Y 좌표값 제한
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

function placeNewTower() {
  /* 
    타워를 구입할 수 있는 자원이 있을 때 타워 구입 후 랜덤 배치하면 됩니다.
    빠진 코드들을 채워넣어주세요! 
  */

  // 서버로 타워 구매 정보 전송
  const { x, y } = getRandomPositionNearPath(200);

  sendTowerEvent(21, {
    userGold: userGold,
    uniqueId: towerUniqueId++,
    towerCount: towers.length,
    towerId: towerId,
    towerType: towerType,
    posX: x,
    posY: y,
  });
}

function sellTower(index) {
  sendTowerEvent(22, { tower: towers[index] });
}
function placeBase() {
  const lastPoint = monsterPath[0];
  base = new Base(lastPoint.x + 200, lastPoint.y - 150, baseHp);
  base.draw(ctx, baseImage);
}

function spawnMonster() {
  monsters.push(new Monster(monsterPath, monsterImages, monsterAssetData.data, monsterLevel));
  //  console.log("MONSTERS", MONSTERS);
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
    sendEvent(31, { score, currentLevel: monsterLevel, nextLevel: monsterLevel + 1 });
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

  monsterPath = generateRandomMonsterPath(); // 몬스터 경로 생성
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

      if (!isInitGame) {
        initGame();
      }
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

    if (data.type === 'waveLevelIncrease') {
      console.log(data.message);
      if (data.waveLevel) monsterLevel = data.waveLevel; // 몬스터레벨 동기화
    }

    if (data.type === 'killMonster') {
      userGold = +data.result.userGold;
      score = +data.result.score;
      changeWave();
    }

    if (data.type === 'attackedByMonster') {
      baseHp = +data.result.attackPower;
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

//----------------------------------------------------- 여기서부터 아래는 버튼

const buyTowerButton = document.createElement('button');
buyTowerButton.textContent = '타워 구입';
buyTowerButton.style.position = 'absolute';
buyTowerButton.style.top = '10px';
buyTowerButton.style.right = '10px';
buyTowerButton.style.padding = '10px 20px';
buyTowerButton.style.fontSize = '16px';
buyTowerButton.style.cursor = 'pointer';

buyTowerButton.addEventListener('click', placeNewTower);

document.body.appendChild(buyTowerButton);

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

// addEventListener 함수에서 sellTowerButton.disabled과 upgradeTowerButton.disabled 값이
// 변경되는 부분들은 사실 없어도 되는 코드이다
// 하지만 확실하게 비활성화 시키기 위해 함수 내에서 변경시키고있다.

// 타워 클릭 이벤트 핸들러
let selectedTowerIndex = null; // 현재 선택된 타워의 인덱스 저장

// 타워 판매 버튼 클릭 이벤트
canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  let towerFoundState = false;

  // 타워 목록을 순회하여 클릭한 타워가 있는지 확인
  towers.forEach((tower, index) => {
    // 사각형 타워 내부에서 클릭했는지 확인
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
      // 타워 판매 버튼 위치 설정 (타워 머리 위로 표시, 버튼 추가되면 계산식 수정)
      sellTowerButton.style.right = `${rect.right - tower.x - 95}px`;
      sellTowerButton.style.top = `${rect.top + tower.y - 100}px`;
      upgradeTowerButton.style.right = `${rect.right - tower.x - 101}px`;
      upgradeTowerButton.style.top = `${rect.top + tower.y - 50}px`;
      // 타워가 선택되면 판매 및 업그레이드 버튼 활성화
      sellTowerButton.style.display = 'block';
      sellTowerButton.disabled = false;
      upgradeTowerButton.style.display = 'block';
      upgradeTowerButton.disabled = false;
      towerFoundState = true;
    }
  });

  // 타워를 클릭하지 않았을 경우 판매 버튼 비활성화
  if (!towerFoundState) {
    // 선택된 타워가 없으면 판매 및 업그레이드 버튼 비활성화
    sellTowerButton.style.display = 'none';
    sellTowerButton.disabled = true;
    upgradeTowerButton.style.display = 'none';
    upgradeTowerButton.disabled = true;
  }
});

// 타워 판매 버튼 이벤트
sellTowerButton.addEventListener('click', () => {
  // 타워가 선택된 상태일 경우
  if (selectedTowerIndex !== null) {
    // 판매 함수 호출
    sellTower(selectedTowerIndex);
    // 타워를 판매한 후 버튼 비활성화
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
  if (selectedTowerIndex !== null) {
    // 내용 미구현
    console.log('업그레이드(미구현)');
  }
});
document.body.appendChild(upgradeTowerButton);
