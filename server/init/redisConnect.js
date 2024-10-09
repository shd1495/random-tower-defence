import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

// redis 연결
const redisClient = new Redis({
  host: process.env.REDIS_HOST, 
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD, 
  
});

redisClient.on('connect', () => {
  console.log('Redis connect');
});

redisClient.on('error', (err) => {
  console.error('Redis error: ', err);
});



await redisClient.connect(); // 클라이언트 연결

export default redisClient;