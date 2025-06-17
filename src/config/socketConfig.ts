import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { allowedOrigins } from "./allowedOrigins";
const Apikey = process.env.Apikey;
let io: Server | null = null;

const connectedUsers = new Map<string, string>();

interface AuthenticatedSocket extends Socket {
  userId: string;
}

export const initializeSocket = (httpServer: HttpServer): void => {
  io = new Server(httpServer, {
    allowEIO3: true,
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST"],
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

    connectedUsers.set(authenticatedSocket.userId, authenticatedSocket.id);
    //? listen to swap
    socket.on("stake", async (data) => {
      try {

      } catch (error) {
        if (error instanceof Error) {
          console.error("Error saving transaction via worker:", error);
          socket.emit("error", {
            message: error.message || "Unknown error occurred during staking",
          });
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

// import { Server, Socket } from 'socket.io';
// // import chatService from '../services/chatService';
// // import { ChatMessage } from '../types';
// interface SocketData {
//     userId: string;
//     message: string;
//     receiverId: string;
//   }
  
//   const setupChat = (io: Server): void => {
//     io.on('connection', (socket: Socket) => {
//       console.log('User connected:', socket.id);
  
//       socket.on('join', ({ userId }: { userId: string }) => {
//         socket.join(userId);
//       });
  
//       socket.on('sendMessage', async ({ senderId, receiverId, message }: SocketData) => {
//         const chat = await chatService.saveMessage({ senderId, receiverId, message });
//         io.to(receiverId).emit('receiveMessage', chat);
//         io.to(senderId).emit('receiveMessage', chat);
//       });
  
//       socket.on('disconnect', () => {
//         console.log('User disconnected:', socket.id);
//       });
//     });
//   };
  
//   export default setupChat;
// import Chat, { IChat } from '../models/Chat';

// interface ChatData {
//   senderId: string;
//   receiverId: string;
//   message: string;
// }

// class ChatService {
//   async saveMessage({ senderId, receiverId, message }: ChatData): Promise<IChat> {
//     return Chat.create({ sender: senderId, receiver: receiverId, message });
//   }

//   async getMessages(senderId: string, receiverId: string): Promise<IChat[]> {
//     return Chat.find({
//       $or: [
//         { sender: senderId, receiver: receiverId },
//         { sender: receiverId, receiver: senderId },
//       ],
//     }).sort('timestamp');
//   }
// }

// export default new ChatService();
