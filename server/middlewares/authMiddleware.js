import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma/index.js';
import { throwError } from '../utils/errorHandle.js';
import accountService from '../services/accountService.js';

export default async function (req, res, next) {
  try {
    const authorization = req.headers['authorization'];

    console.log('authorization', authorization);

    // 토큰 존재 여부
    if (!authorization) throw throwError('요청한 사용자의 토큰이 존재하지 않습니다.', 404);

    // 토큰 타입 확인
    const [tokenType, token] = authorization.split(' ');
    if (tokenType !== 'Bearer') throw throwError('토큰 타입이 Bearer 형식이 아닙니다.', 401);

    // 토큰 검증
    const decodedToken = jwt.verify(token, process.env.SESSION_SECRET_KEY);

    // 토큰 사용자 조회
    const accountId = decodedToken.accountId;
    const account = await accountService.findAccountById(accountId);

    if (!account) throw throwError('토큰 사용자가 존재하지 않습니다.', 404);

    // 사용자 정보 저장
    req.account = account.accountId;

    next();
  } catch (error) {
    // 토큰 만료, 시그니처 조작
    if (error.name === 'TokenExpiredError') {
      // 토큰 만료 되었을때만 토큰연장해주기위해 체크
      req.accessTokenExpired = true;
      return next();
    } else if (error.name === 'JsonWebTokenError') {
      next(throwError('토큰이 유효하지 않습니다.', 401));
    }

    next(error);
  }
}
