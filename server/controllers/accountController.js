// import { throwError } from '../utils/errorHandle.js';
// import accountService from '../services/accountService.js';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import Joi from 'joi';

// /**
//  * 회원가입
//  * @param {Object} req
//  * @param {Object} res
//  * @param {*} next
//  * @returns
//  */
// export async function signup(req, res, next) {
//   const { account, password, name } = req.body;
//   try {
//     const schema = Joi.object({
//       id: Joi.string()
//         .pattern(/^[a-zA-Z0-9]+$/)
//         .min(6)
//         .max(16)
//         .required(),
//       password: Joi.string().min(6).max(16).required(),
//       confirmPassword: Joi.valid(Joi.ref(`password`)).required(),
//       name: Joi.string()
//         .pattern(/^[가-힣]+$/)
//         .min(2)
//         .max(4)
//         .required(),
//     });
//     const { error } = schema.validate(req.body);
//     await accountService.findAccount();
//     await accountService.createAccount();
//     return res.status(201).json({ message: '' });
//   } catch (error) {
//     next(error);
//   }
// }

// /**
//  * 로그인
//  * @param {*} req
//  * @param {*} res
//  * @param {*} next
//  * @returns
//  */
// export async function signin(req, res, next) {
//   try {
//     await accountService.findAccount();
//     res.header('authorization', `Bearer ${token}`);
//     return res.status(200).json({ message: '' });
//   } catch (error) {
//     next(error);
//   }
// }
