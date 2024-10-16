# Pangyo Night

![판교 나이트](https://github.com/user-attachments/assets/6a0007e8-1be3-4d8c-91a4-562f1e45144e)

## 기술 스택

- Node.js - Express
  
- AWS RDS(MySQL) - Prisma ORM
  
- Redis cloud - ioredis
  
- Deployment - AWS EC2
  
- PackageManager - Yarn

## 실행 방법
- [게임 플레이](http://shd1495.store:3080/)

## 필수

- [x] 회원가입 / 로그인
- [x] 유저 별 게임 데이터 관리
- [x] 클라이언트가 서버로부터 수신하는 이벤트 종류 정의 및 코드 구현 (WebSocket으로 통신)
- [x] 클라이언트가 서버로 송신하는 이벤트 종류 정의 및 코드 구현 (WebSocket으로 통신)
- [x] 유저 별 최고 기록 스코어 저장

## 도전

- [x] 타워 환불 기능
- [x] 특정 타워 업그레이드 기능
- [x] 보물 고블린 몬스터 출현 기능

## 패킷 구조 및 핸들러 맵핑

[![pngwing com](https://github.com/user-attachments/assets/0b16d6ab-5527-4ff3-8201-a86b290ee0ed)](https://frosted-occupation-9b9.notion.site/Pangyo-Night-11f6a99984a18084a9ecc828bc501ffc)

## API 명세서

[![pngwing com](https://github.com/user-attachments/assets/0b16d6ab-5527-4ff3-8201-a86b290ee0ed)](https://frosted-occupation-9b9.notion.site/Pangyo-Night-API-11f6a99984a180ef850cc0f87a7aa626?pvs=25)

## ERD

![icon](https://github.com/user-attachments/assets/93e32599-fa54-4855-b630-ef5c8c0a3480)
![캡처](https://github.com/user-attachments/assets/fcbfc557-8537-4414-9d9c-9969b92649fd)

## 게임 기획

### 컨셉

- 판교의 등대로 몰려드는 날벌레들이 몰려든다.

- 선배님들을 위해 손수 퇴치에 나선다!

### 게임 시스템

- 베이스는 중앙에 고정된 형태

- 몬스터가 지나는 길은 투명 블록으로 나선의 형태로 베이스까지 이어진다.

- 게임은 웨이브 형태로 진행되며 일정 점수에 도달하면 웨이브 레벨이 상승하며 더욱 강력한 몬스터가 등장한다.

- 몬스터 처치 시 낮은 확률로 황금 고블린이 추가로 등장한다. 황금 고블린은 높은 체력을 지니고 있지만 많은 골드를 제공한다.

- 골드로 타워 구매, 타워 업그레이드, 느려지게하는 장판 생성 등이 가능하다.

- 처음 시작 시 2개의 타워를 제공하며 위치가 마음에 들지 않을 경우 타워를 판매하고 재설치 할 수 있다. 단, 타워 판매는 50%의 골드만 돌려받는다.

- 몬스터가 베이스가 있는 곳까지 도달하면 베이스에 레벨에 비례한 대미지를 입히고 사라진다.

- 최대한 오래 살아남으면서 벌레를 많이 퇴치하는 것이 목표이다.

### 아트
#### 몬스터
- 몬스터
  
![file (1)](https://github.com/user-attachments/assets/4c1268aa-1563-4c8f-af77-56c72d3d9bd7)
![file (2)](https://github.com/user-attachments/assets/8b39dc2d-17a6-4ba6-bb36-49ed76647015)
![file (3)](https://github.com/user-attachments/assets/a53ec3f7-b149-43aa-bcc4-6865b042d8eb)
![file(4)](https://github.com/user-attachments/assets/f4cf5de4-2c01-4b1d-9aa8-7691c7a9cb11)
![file(5)](https://github.com/user-attachments/assets/167d32eb-2885-4f91-b923-afd0d2d93036)

- 황금 고블린

![monster6](https://github.com/user-attachments/assets/a9a23d2e-e00a-4226-8544-f1b36e8da1c3)

#### 베이스

<img src="https://github.com/user-attachments/assets/7d49b050-b9a5-41ca-a3bb-478707040eeb" width="400" height="400"/>

#### 배경

![bg](https://github.com/user-attachments/assets/2fef1bd0-942f-43cb-aa4b-78b80933f87a)

#### 타워

- 전기 살충제 - 밸런스 잡힌 기본 타워

<img src="https://github.com/user-attachments/assets/e5f4199a-01c4-4dfe-8eea-3556b20b0fc9" width="70" height="150"/>
<img src="https://github.com/user-attachments/assets/6cf0d547-175c-40bd-9ce7-a0aae3e26427" width="70" height="150"/>
<img src="https://github.com/user-attachments/assets/de164b0e-739d-4268-8459-71212c3242aa" width="70" height="150"/>

- 화염 살충제 - 공격 속도가 느리지만 강력한 타워

<img src="https://github.com/user-attachments/assets/18331808-26e1-459b-bd64-d7b9a73a39bb" width="70" height="150"/>
<img src="https://github.com/user-attachments/assets/8b3c6120-0ba0-4867-ba69-57bd10ff4735" width="70" height="150"/>
<img src="https://github.com/user-attachments/assets/8fe1fc73-c970-450b-bbd7-e429143f704f" width="70" height="150"/>

- 화학 살충제 - 공격 속도가 빠르지만 약한 타워

<img src="https://github.com/user-attachments/assets/9dda5037-9f23-489d-99cc-48aa1d0e583f" width="70" height="150"/>
<img src="https://github.com/user-attachments/assets/56be1de6-73a5-4fb0-9f8a-11ceb18fd4b7" width="70" height="150"/>
<img src="https://github.com/user-attachments/assets/8bbab2ef-017f-4db4-a74f-b6cee03c17f5" width="70" height="150"/>

## 기능 설명
### 타워 설치

- 게임 시작 시 몬스터 경로에서 가까운 위치에 랜덤하게 2개의 타워를 생성한다.

- 100골드를 사용해서 원하는 위치에 타워를 생성할 수 있고 타워는 3종류가 존재한다.

![타워생성](https://github.com/user-attachments/assets/f33c5887-a5fd-4226-8fec-7e6ea09df7b2)

### 타워 판매

- 판매하고 싶은 타워를 클릭하면 판매 버튼이 활성화되며 판매 시 타워에 사용한 골드의 50%를 돌려받는다.
  
![타워판매](https://github.com/user-attachments/assets/a4678c8b-cf5c-4f22-904d-a513a90fd395)

### 타워 업그레이드

- 업그레이드하고 싶은 타워를 클릭하면 업그레이드 버튼이 활성화되며 업그레이드 시 타워의 레벨이 상승한다.

- 타워의 레벨은 3레벨까지 존재하며 1 -> 2레벨 75골드 / 2 -> 3레벨 175골드를 소모한다.
  
![타워업글](https://github.com/user-attachments/assets/ede166c1-229e-4959-b052-d3db9173f144)

### 슬로우 장판 설치

- 슬로우 장판에 닿은 몬스터는 이동속도가 50% 감소한다.

- 슬로우 장판은 5초의 재사용 대기시간을 가지고 있으며 사용할 때마다 100 골드를 소모한다.
  
![느려짐 장판](https://github.com/user-attachments/assets/0d96e9a0-315c-42c6-9f1c-4b1e39da9fd9)

### 황금 고블린

- 몬스터 처치 시 낮은 확률로 황금 고블린을 추가로 생성시킨다.

- 웨이브 별로 황금 고블린의 생성 확률이 변동되며 황금 고블린은 많은 골드를 제공한다. / 레벨 * 100골드

- 1웨이브 - 0%
- 2웨이브 - 1%
- 3웨이브 - 2%
- 4웨이브 - 3%
- 5웨이브 - 4%
- 6웨이브 - 5%
- 7웨이브 - 5%
