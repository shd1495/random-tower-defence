import accountRouter from './routes/accountRouter.js';
import express from 'express';
import initSocket from './init/socket.js';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { loadGameAssets } from './init/assets.js';
import errorHandleMiddleware from './middlewares/errorHandleMiddleware.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const PORT = process.env.SECRET_PORT;

const app = express();
const server = createServer(app);

app.use(cookieParser());
// body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('client/public'));

app.use('/api', accountRouter);
// 소켓 초기화
initSocket(server);
app.use(errorHandleMiddleware);

server.listen(PORT, async () => {
  console.log(`${PORT} 포트로 서버가 열렸습니다.`);

  try {
    const assets = await loadGameAssets();
    console.log('assets 파일이 정상적으로 로드되었습니다.');
  } catch (error) {
    console.error('assets 파일을 불러오는 데 실패했습니다.', error);
  }
});
