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