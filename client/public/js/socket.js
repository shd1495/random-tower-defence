import { socket } from "socket.io";

socket.on("connection", (data) => {
     console.log("connection: ", data);
});

const sendMonsterEvent = (handleId, payload) => {
     socket.emit("monsterEvent", {
          userId,
          clientVersion: CLIENT_VERSION,
          handleId,
          payload,
     });
};

export { sendMonsterEvent };
