import { throwError } from '../utils/errorHandle.js';
import accountService from '../services/accountService.js';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

/**
//  * 회원가입
//  * @param {Object} req
//  * @param {Object} res
//  * @param {*} next
//  * @returns
//  */

export async function signup(req, res) {
  try {
    const { accountId, password, confirmPassword } = req.body;
    console.log(req.body);
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
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // 계정 찾기, 계정 있는지 확인
    const existingAccount = await accountService.findAccount(accountId);
    if (existingAccount) {
      return res.status(400).json({ message: '이미 사용 중인 계정 ID입니다.' });
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    const uuid = uuidv4();
    // HIGHLIGHT: 계정 추가 부분 uuid
    const newAccount = await accountService.createAccount(accountId, hashedPassword, uuid);

    return res.status(201).json({ message: '회원 가입에 성공', account: newAccount });
  } catch (error) {
    console.error('회원가입 오류:', error);
    return res.status(500).json({ message: '서버에 문제가 발생했습니다.' });
  }
}

/**
 * 로그인
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
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
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // 존재하는 지, password는 일치하는지
    const existingAccount = await accountService.findAccount(accountId);
    if (!existingAccount) {
      // error: 계정이 존재하지 않는 경우
      return res.status(400).json({ message: '계정이 존재 하지 않습니다.' });
    }

    const isValidPassword = await bcrypt.compare(password, existingAccount.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: '비밀 번호 일치 X' });
    }

    // JWT 토큰, secret-key는 나중에 수정해야 함
    const token = jwt.sign({ accountId: existingAccount.id }, process.env.SESSION_SECRET_KEY, {
      expiresIn: '1h',
    });

    res.header('authorization', `Bearer ${token}`);

    // 쿠키에 저장 refresh 토큰, 이 부분은 필요없으면 삭제 할 것
    // 사용하려면 재발급 관련 코드 짤 것
    // const refreshToken = jwt.sign({ accountId: existingAccount.id }, 'refresh-key', {
    //   expiresIn: '7d',
    // });

    // res.cookie('refreshToken', refreshToken, {
    //   httpOnly: true,
    //   secure: true,
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    return res.status(201).json({ message: '로그인 성공', account: accountId });
  } catch (error) {
    next(error);
  }
}
