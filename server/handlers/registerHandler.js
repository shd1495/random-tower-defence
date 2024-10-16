import { handleConnection, handleEvent, handleDisconnect } from './helper.js';
import { addUser } from '../models/userModel.js';
import jsonwebtoken from 'jsonwebtoken';
import account from '../services/accountService.js';

const registerHandler = (io) => {
  // 유저 접속시 (대기하는 함수)
  io.on('connection', async (socket) => {
    const authorization = socket.handshake.query.token;

    // 토큰 검증
    let decodedToken;

    try {
      // 토큰 존재 여부
      if (!authorization)
        socket.emit('tokenNotFound', {
          message: '요청한 사용자의 토큰이 존재하지 않습니다.',
        });

      // 토큰 타입 확인
      const [tokenType, token] = authorization.split(' ');
      if (tokenType !== 'Bearer')
        socket.emit('Bearer', {
          message: '토큰 타입이 Bearer 형식이 아닙니다.',
        });

      // 토큰 검증
      decodedToken = jsonwebtoken.verify(token, process.env.SESSION_SECRET_KEY);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        socket.emit('tokenExpired', {
          message: '토큰이 만료되었습니다.',
        });
      } else {
        socket.emit('unauthorized', {
          message: '유효하지 않은 토큰입니다.',
        });
      }
      return socket.disconnect();
    }

    const userId = await account.findAccountById(decodedToken.accountId);
    if (!userId) {
      throw new Error('유저가 존재하지 않습니다.');
    }

    const user = {
      socketId: socket.id,
      userId: userId.uuid,
    };

    // 유저 등록
    await addUser(user);
    handleConnection(socket, user.userId);

    // 이벤트 처리
    socket.on('event', (data) => handleEvent(io, socket, data));

    // 몬스터 이벤트 처리
    socket.on('monsterEvent', (data) => handleEvent(io, socket, data));

    // 타워 이벤트 처리
    socket.on('towerEvent', (data) => handleEvent(io, socket, data));

    // 접속 해제시 이벤트
    socket.on('disconnect', () => handleDisconnect(socket, user.userId));
  });
};

export default registerHandler;
