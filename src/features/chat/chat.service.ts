import { Server, Socket } from 'socket.io';
import ChatModel from './chat.model'; 
import {getIO} from './../../config/socketConfig'

interface CustomSocket extends Socket {
    userId?: string;
}
let io = getIO();

io.on('connection', (socket: CustomSocket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId: string) => {
        socket.userId = userId;
        console.log(`${userId} joined the chat`);
    });

    socket.on('sendMessage', async ({ sender, receiver, message }) => {
        try {
            let chat = await ChatModel.findOne({ users: { $all: [sender, receiver] } });

            if (!chat) {
                chat = new ChatModel({ users: [sender, receiver], messages: [] });
            }

            const newMessage = {
                sender,
                receiver,
                message,
                timestamp: new Date()
            };

            chat.messages.push(newMessage);
            await chat.save();
            io.to(receiver).emit('receiveMessage', newMessage);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
