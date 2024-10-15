import express from 'express';
import { signup, signin, tokenExtension, getRanking } from '../controllers/accountController.js';

const router = express.Router();

// 회원가입
router.post('/signup', signup);

// 로그인
router.post('/signin', signin);

// 토큰 연장하기
router.post('/tokenextend', tokenExtension);

// 랭킹 조회
router.get('/ranking', getRanking);

export default router;
