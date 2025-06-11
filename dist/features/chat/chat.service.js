"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chat_model_1 = __importDefault(require("./chat.model"));
const socketConfig_1 = require("./../../config/socketConfig");
let io = (0, socketConfig_1.getIO)();
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('join', (userId) => {
        socket.userId = userId;
        console.log(`${userId} joined the chat`);
    });
    socket.on('sendMessage', (_a) => __awaiter(void 0, [_a], void 0, function* ({ sender, receiver, message }) {
        try {
            let chat = yield chat_model_1.default.findOne({ users: { $all: [sender, receiver] } });
            if (!chat) {
                chat = new chat_model_1.default({ users: [sender, receiver], messages: [] });
            }
            const newMessage = {
                sender,
                receiver,
                message,
                timestamp: new Date()
            };
            chat.messages.push(newMessage);
            yield chat.save();
            io.to(receiver).emit('receiveMessage', newMessage);
        }
        catch (error) {
            console.error('Error sending message:', error);
        }
    }));
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
