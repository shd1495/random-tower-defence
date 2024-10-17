import { throwError } from '../utils/errorHandle.js';
import accountService from '../services/accountService.js';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import score from '../services/scoreService.js';

/**
 * 회원 가입
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns {Object} response
 */
export async function signup(req, res, next) {
  try {
    const { accountId, password, confirmPassword } = req.body;
    // 데이터 유효성 검사
    const schema = Joi.object({
      accountId: Joi.string()
        .pattern(/^[a-zA-Z0-9]+$/)
        .min(6)
        .max(16)
        .required(),
      password: Joi.string().min(6).max(16).required(),
      confirmPassword: Joi.valid(Joi.ref('password')).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) throw throwError(`${error.details[0].message}`, 400);

    // 계정 찾기, 계정 있는지 확인
    const existingAccount = await accountService.findAccount(accountId);
    if (existingAccount) throw throwError('이미 사용 중인 계정 ID입니다.', 409);

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    const uuid = uuidv4();
    // HIGHLIGHT: 계정 추가 부분 uuid
    const newAccount = await accountService.createAccount(accountId, hashedPassword, uuid);

    return res.status(201).json({ message: '회원 가입에 성공', account: newAccount });
  } catch (error) {
    next(error);
  }
}

/**
 * 로그인
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns {Object} response
 */
export async function signin(req, res, next) {
  try {
    const { accountId, password } = req.body;
    const schema = Joi.object({
      accountId: Joi.string()
        .pattern(/^[a-zA-Z0-9]+$/)
        .min(6)
        .max(16)
        .required(),
      password: Joi.string().min(6).max(16).required(),
    });
    const { error } = schema.validate(req.body);
    if (error) throw throwError(`${error.details[0].message}`, 400);

    // 존재하는 지, password는 일치하는지
    const existingAccount = await accountService.findAccount(accountId);

    // error: 계정이 존재하지 않는 경우
    if (!existingAccount) throw throwError('계정이 존재 하지 않습니다.', 404);

    const isValidPassword = await bcrypt.compare(password, existingAccount.password);
    if (!isValidPassword) throw throwError('비밀 번호가 일치하지 않습니다.', 401);

    // JWT 토큰, secret-key는 나중에 수정해야 함
    const token = jwt.sign({ accountId: existingAccount.id }, process.env.SESSION_SECRET_KEY, {
      expiresIn: '10m',
    });

    const refreshToken = jwt.sign(
      { accountId: existingAccount.id },
      process.env.REFRESH_TOKEN_KEY,
      {
        expiresIn: '1d',
      },
    );

    // res.header('authorization', `Bearer ${token}`);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // HTTPS 환경에서만 전송 나중에 배포시에 수정
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    return res
      .status(201)
      .json({ message: '로그인 성공', token: `Bearer ${token}`, account: accountId });
  } catch (error) {
    next(error);
  }
}

/**
 * 게임 실행 중 토큰연장하는 함수
 * @returns {Object} response
 */
export async function tokenExtension(req, res, next) {
  try {
    const { refreshToken } = req.cookies;

    // 리프레쉬 토큰 검증하기
    if (!refreshToken) throw throwError('발급받은 리프레쉬 토큰이 없습니다.', 401);

    const id = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY).accountId;
    const existingAccount = await accountService.findAccountById(id);

    // error: 계정이 존재하지 않는 경우
    if (!existingAccount) throw throwError('계정이 존재 하지 않습니다.', 404);

    // 새롭게 토큰 갱신하여 연장하기
    const token = jwt.sign({ accountId: existingAccount.id }, process.env.SESSION_SECRET_KEY, {
      expiresIn: '10m',
    });

    // res.header('authorization', `Bearer ${token}`);

    return res.status(201).json({ message: '액세스 토큰 갱신 성공', token: `Bearer ${token}` });
  } catch (error) {
    next(error);
  }
}

/**
 * 랭킹 조회
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns {Object} response
 */
export async function getRanking(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const rankingData = await score.getRanking(page, limit);
    if (!rankingData) throw throwError('랭킹 데이터가 존재하지 않습니다.', 404);

    return res.status(200).json(rankingData);
  } catch (error) {
    next(error);
  }
}
