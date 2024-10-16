import { getTowers, clearTowers } from '../models/towerModel.js';
import { clearMonsters } from '../models/monsterModel.js';
import { getUsers, removeUser } from '../models/userModel.js';
import { clearGameData } from '../models/gameModel.js';
import { clearWaveLevel } from '../models/waveLevelModel.js';
import { CLIENT_VERSION } from '../utils/constants.js';
import handlerMappings from './handlerMapping.js';

/**
 * 접속 해제
 * @param {Object} socket
 * @param {String} uuid
 */
export const handleDisconnect = async (socket, uuid) => {
  // 접속 해제시 타워 초기화
  clearTowers(uuid);
  console.log(`${uuid} 유저의 모든 타워를 삭제하였습니다`, await getTowers(uuid));

  // 접속 해제시 연결 초기화
  removeUser(uuid);
  clearWaveLevel(uuid);
  clearMonsters(uuid);
  clearGameData(uuid);
  console.log(`${uuid} 유저가 연결을 해제했습니다`);
  console.log('현재 접속 중인 유저들: ', await getUsers());
};

/**
 * 유저 접속
 * @param {Object} socket
 * @param {String} uuid
 */
export const handleConnection = async (socket, uuid) => {
  console.log('새로운 유저가 연결되었습니다.', uuid);
  console.log('현재 접속 중인 유저들:', await getUsers());

  socket.emit('connected', { uuid }); // 'connected' 이벤트로 변경
};

/**
 * 이벤트 핸들러
 * @param {Object} io
 * @param {Object} socket
 * @param {Object} data
 * @returns {null}
 * @author response를 클라이언트에 전달하고 type으로 이벤트 구분
 */
export const handleEvent = async (io, socket, data) => {
  // 클라언트 버전 체크
  //if (!data.CLIENT_VERSION) throw new Error('클라이언트 버전이 존재하지 않습니다.');
  if (!CLIENT_VERSION.includes(data.clientVersion)) {
    socket.emit('response', {
      status: 'fail',
      message: 'Client version does not match',
    });
    return;
  }

  //핸들러 체크
  const handler = handlerMappings[data.handlerId];

  if (!handler) {
    socket.emit('response', {
      status: 'fail',
      message: 'handler not found.',
    });
    return;
  }

  const response = await handler(data.userId, data.payload, socket, io);

  // 한 유저에게 보낼시
  socket.emit('response', response);
};
