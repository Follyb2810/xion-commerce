"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db_1 = require("./config/db");
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const walletRoutes_1 = __importDefault(require("./routes/walletRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const xionRoutes_1 = __importDefault(require("./routes/xionRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const allowedOrigins_1 = require("./config/allowedOrigins");
const port = process.env.PORT || 8080;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    allowEIO3: true,
    cors: {
        origin: allowedOrigins_1.allowedOrigins,
        credentials: true,
        // origin: 'http://localhost:8080',
        methods: ["GET", "POST"],
    },
});
const corsConfig = {
    origin: allowedOrigins_1.allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use((0, cors_1.default)(corsConfig));
app.use((0, morgan_1.default)("tiny"));
app.disable("x-powered-by");
app.set("trust proxy", true);
app.use(express_1.default.json());
// app.use(express.static("public"));
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests
//   message: 'Too many requests, please try again later.'
// });
// app.use(limiter)
app.use((0, cookie_parser_1.default)());
app.use((req, res, next) => {
    // if (req.headers['x-forwarded-proto'] !== 'https') {
    //   return res.redirect(`https://${req.headers.host}${req.url}`);
    // }
    const origin = req.headers.origin;
    console.log(origin, "origin");
    if (origin && allowedOrigins_1.allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    console.log(req.method, "req.method");
    if (req.method === "OPTIONS") {
        res.status(200).end();
    }
    else {
        next();
    }
    // next();
});
app.get("/ping", (req, res, next) => {
    console.log(`Server pinging ${new Date().toISOString()}`);
    res.send("Ping the ser");
});
app.get("/cosmos", (req, res) => {
    res.send("cosmos commerce");
});
app.get("/", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "public", "index.html"));
});
app.use("/api", authRoutes_1.default);
app.use("/api", walletRoutes_1.default);
app.use("/api/product", productRoutes_1.default);
app.use("/api/cart", cartRoutes_1.default);
app.use("/api/order", orderRoutes_1.default);
app.use("/api/category", categoryRoutes_1.default);
app.use("/api/xion", xionRoutes_1.default);
app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err);
    res.status(500).json({
        success: false,
        message: err.message || "An unexpected error occurred",
    });
});
//?
//?
// io.use((socket, next) => {
//   const apiKey = socket.handshake.headers['cyber-api-key']?.toLowerCase();
//   if (apiKey === Apikey) {
//     return next();
//   }
//   return next(new Error('Invalid API key'));
// });
// Start the server and configure Socket.IO
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    socket.data.username = "New User";
    //? listen to message
    socket.on("connect_error", (err) => {
        console.error("Connection Error:", err);
    });
    // Notify others (excluding sender) that a new user joined
    socket.broadcast.emit("broadcast", {
        system: "User",
        message: `${socket.id} with ${socket.data.username} has joined the chat`,
    });
    // Broadcast to all users (including sender)
    io.emit("broadcast", {
        system: "User",
        message: `${socket.id} with ${socket.data.username} has join the chat`,
    });
    // Listen for a "message" event from a user
    socket.on("message", (data) => {
        console.log(`Message from ${socket.id}:`, data);
        // Broadcast the message to everyone (including sender)
        io.emit("message", { sender: socket.id, text: data });
    });
    // Listen for a "privateMessage" event from a user
    socket.on("privateMessage", ({ receiverId, message }) => {
        console.log(`Private message from ${socket.id} to ${receiverId}: ${message}`);
        // Send the message only to the specified receiver
        io.to(receiverId).emit("privateMessage", {
            sender: socket.id,
            text: message,
        });
    });
    //! message to all
    io.emit("chat_message", {
        system: "User",
        message: `${socket.id} with ${socket.data.username} has join the chat`,
    });
    // ! chat between buyer and seller
    socket.on("chat_mesaage", (msg) => {
        io.emit('chat_mesaage', { user: socket.data.username, msg });
    });
    //! typing betweeen buyer and seller
    socket.on('typing', () => {
        //? messae to the buyer or seller
        socket.broadcast.emit('typing', socket.data.username);
    });
    socket.on('stop_typing', () => {
        //? messae to the buyer or seller
        socket.broadcast.emit('stop_typing', socket.data.username);
    });
    // Send a welcome message ONLY to the connected user
    socket.emit("welcome", { message: `Welcome, ${socket.id}!` });
    // Send a message to EVERYONE, including the sender
    io.emit("broadcast", { message: `${socket.id} joined the chat` });
    // Send a message to EVERYONE EXCEPT the sender
    socket.broadcast.emit("broadcast", { message: `User ${socket.id} joined` });
    socket.on("disconnect", () => {
        io.emit('disconnect', { system: 'chat disonneeted', message: `${socket.data.username} has lefthe chatt` });
        console.log("User disconnected:", socket.id);
    });
});
(0, db_1.connectDb)()
    .then(() => {
    //? socket
    server.listen(port, () => console.log(`Server running on http://localhost:${port}`));
    // app.listen(port, () => console.log("we are on port " + port));
    console.log("database is running succesfull");
})
    .catch((error) => {
    console.log("Invalid database connection: ", error);
});
