import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

// redis 연결
const redisClient = new Redis({
     host: process.env.REDIS_HOST,
     port: process.env.REDIS_PORT,
     password: process.env.REDIS_PASSWORD,
});

redisClient.on("connect", () => {
     console.log("Redis connect");
});

redisClient.on("error", (err) => {
     console.error("Redis error: ", err);
});

export default redisClient;
