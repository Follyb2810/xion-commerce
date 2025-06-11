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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnectedUsers = exports.getIO = exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
require("./../utils/taccStatusUpdater");
const Apikey = process.env.Apikey;
let io = null;
const connectedUsers = new Map();
const initializeSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: '*',
            credentials: true,
        },
    });
    io.use((socket, next) => {
        var _a;
        const apiKeyHeader = socket.handshake.headers["api-key"];
        const apiKey = Array.isArray(apiKeyHeader)
            ? (_a = apiKeyHeader[0]) === null || _a === void 0 ? void 0 : _a.toLowerCase()
            : apiKeyHeader === null || apiKeyHeader === void 0 ? void 0 : apiKeyHeader.toLowerCase();
        if (apiKey === (Apikey === null || Apikey === void 0 ? void 0 : Apikey.toLowerCase())) {
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
    io.on("connection", (socket) => {
        const authenticatedSocket = socket;
        console.log({ socket: socket.id });
        console.log(`User connected with socket id: ${authenticatedSocket.id}`);
        connectedUsers.set(authenticatedSocket.userId, authenticatedSocket.id);
        //? listen to swap
        socket.on('stake', (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log({ data }, 'listening to stake event');
                console.log('finally back to default');
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error('Error saving transaction via worker:', error);
                    socket.emit('error', { message: error.message || 'Unknown error occurred during staking' });
                }
            }
        }));
        //? listen to message
        socket.on("connect_error", (err) => {
            console.error("Connection Error:", err);
        });
        socket.on("disconnect", () => {
            console.log(`User disconnected with socket id: ${authenticatedSocket.id}`);
            connectedUsers.delete(authenticatedSocket.userId);
        });
    });
};
exports.initializeSocket = initializeSocket;
const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
exports.getIO = getIO;
const getConnectedUsers = () => connectedUsers;
exports.getConnectedUsers = getConnectedUsers;
