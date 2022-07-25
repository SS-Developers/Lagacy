let io: any;

export default {
  init: (httpServer: any) => {
    io = require("socket.io")(httpServer, {
      cors: {
        origin: "*",
      },
      Credential: true,
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};
