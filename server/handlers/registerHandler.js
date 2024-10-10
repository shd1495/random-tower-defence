import { handleConnection, handleEvent, handleDisconnect } from './helper.js';
import { addUser } from '../models/userModel.js';
import { prisma } from '../utils/prisma/index.js';
import jsonwebtoken from 'jsonwebtoken';

const registerHandler = (io) => {
  // 유저 접속시 (대기하는 함수)
  io.on('connection', async (socket) => {
    const authorization = socket.handshake.query.token;

    // 토큰 존재 여부
    if (!authorization) throw new Error('요청한 사용자의 토큰이 존재하지 않습니다.');

    // 토큰 타입 확인
    const [tokenType, token] = authorization.split(' ');
    console.log(tokenType);
    if (tokenType !== 'Bearer') throw new Error('토큰 타입이 Bearer 형식이 아닙니다.');

    // 토큰 검증
    const decodedToken = jsonwebtoken.verify(token, process.env.SESSION_SECRET_KEY);

    console.log(decodedToken);

    // 이벤트 처리
    const userId = await prisma.accounts.findUnique({
      where: { id: decodedToken.accountId },
      select: {
        uuid: true,
      },
    });

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
