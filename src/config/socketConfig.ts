import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import './../utils/taccStatusUpdater'
const Apikey = process.env.Apikey;
let io: Server | null = null;

const connectedUsers = new Map<string, string>();

interface AuthenticatedSocket extends Socket {
  userId: string;
}

export const initializeSocket = (httpServer: HttpServer): void => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      credentials: true,
    },
  });
  io.use((socket, next) => {
    const apiKeyHeader = socket.handshake.headers["api-key"];
    const apiKey = Array.isArray(apiKeyHeader)
      ? apiKeyHeader[0]?.toLowerCase()
      : apiKeyHeader?.toLowerCase();

    if (apiKey === Apikey?.toLowerCase()) {
      return next();
    }
    return next(new Error("Invalid API key"));
  });

  //   io.use((socket: Socket, next) => {
  //     const userId = socket.handshake.auth.userId;
  //     if (!userId || typeof userId !== 'string') {
  //       return next(new Error("Invalid user ID"));
  //     }

  //     (socket as AuthenticatedSocket).userId = userId;
  //     next();
  //   });

  io.on("connection", (socket: Socket) => {
    const authenticatedSocket = socket as AuthenticatedSocket;
    console.log({ socket: socket.id })

    console.log(`User connected with socket id: ${authenticatedSocket.id}`);
    connectedUsers.set(authenticatedSocket.userId, authenticatedSocket.id);
    //? listen to swap
    socket.on('stake', async (data) => {
      try {
        console.log({ data }, 'listening to stake event');

        console.log('finally back to default');
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error saving transaction via worker:', error);
          socket.emit('error', { message: error.message || 'Unknown error occurred during staking' });
        }
      }
    });

    //? listen to message
    socket.on("connect_error", (err) => {
      console.error("Connection Error:", err);
    });

    socket.on("disconnect", () => {
      console.log(
        `User disconnected with socket id: ${authenticatedSocket.id}`
      );
      connectedUsers.delete(authenticatedSocket.userId);
    });
  });
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

export const getConnectedUsers = (): Map<string, string> => connectedUsers;