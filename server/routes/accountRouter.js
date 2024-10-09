import express from 'express';
// import { signup, signin } from '../controllers/accountController.js';

const router = express.Router();

// 회원가입
router.post('/signup', signup);

// 로그인
router.post('/signin', signin);

export default router;
