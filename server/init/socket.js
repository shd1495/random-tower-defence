import { Server as SocketIO } from "socket.io";
import registerHandler from "../handlers/registerHandler.js";

const initSocket = (server) => {
     const io = new SocketIO();
     io.attach(server);

     // 클라이언트와 소켓 이벤트 처리 등록
     registerHandler(io);
};

export default initSocket;
