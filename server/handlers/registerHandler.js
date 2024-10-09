import { v4 as uuidv4 } from "uuid";
import { handleConnection, handleEvent, handleDisconnect } from "./helper.js";

const registerHandler = (io) => {
     // 유저 접속시 (대기하는 함수)
     io.on("connection", async (socket) => {
          // 이벤트 처리

          // 유저 등록
          //await addUser(user);
          handleConnection(socket);

          // 이벤트 처리
          socket.on("event", (data) => handleEvent(io, socket, data));

          // 몬스터 이벤트 처리

          socket.on("monsterEvent", (data) => handleEvent(io, socket, data));
          // 접속 해제시 이벤트
          socket.on("disconnect", () => handleDisconnect(socket));
     });
};

export default registerHandler;
