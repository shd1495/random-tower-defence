import { getUsers, removeUser } from '../models/userModel.js';
import { CLIENT_VERSION } from '../utils/constants.js';
import handlerMappings from './handlerMapping.js';

/**
 * 접속 해제
 * @param {Object} socket
 * @param {String} uuid
 */
export const handleDisconnect = async (socket, uuid) => {
  await removeUser(uuid);
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
 * @returns
 */
export const handleEvent = async (io, socket, data) => {
  // 클라언트 버전 체크
  //if (!data.CLIENT_VERSION) throw new Error('클라이언트 버전이 존재하지 않습니다.');
  if (!CLIENT_VERSION.includes(data.clientVersion)) {
    socket.emit('response', {
      status: '실패',
      message: '클라이언트 버전이 맞지 않습니다.',
    });
    return;
  }

  //핸들러 체크
  const handler = handlerMappings[data.handlerId];

  if (!handler) {
    socket.emit('response', { status: '실패', message: '핸들러를 찾을 수 없습니다.' });
    return;
  }

  const response = await handler(data.userId, data.payload, socket, io);

  // 한 유저에게 보낼시
  socket.emit('response', response);
};
