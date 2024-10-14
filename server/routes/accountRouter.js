import express from 'express';
import { signup, signin, tokenExtension, getRanking } from '../controllers/accountController.js';

const router = express.Router();

// 회원가입
router.post('/signup', signup);

// 로그인
router.post('/signin', signin);

// 토큰 연장하기 (아마 게임 실행중일때만 연장하기로 할 것 같습니다.)
router.post('/tokenextend', tokenExtension);

// 랭킹 조회
router.get('/ranking', getRanking);

export default router;
