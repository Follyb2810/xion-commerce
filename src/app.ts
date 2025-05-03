import express, { Application, Response, Request, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();
import crypto from "crypto";
import { connectDb } from "./config/db";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoute from "./routes/authRoutes";
import walletRoute from "./routes/walletRoutes";
import productRoute from "./routes/productRoutes";
import orderRoute from "./routes/orderRoutes";
import cartRoute from "./routes/cartRoutes";
import xionRoute from "./routes/xionRoutes";
import categoryRoute from "./routes/categoryRoutes";
import cron from "node-cron";
import rateLimit from 'express-rate-limit'
import path from "path";
import http from "http";
import { Server, Socket } from "socket.io";
import { allowedOrigins } from "./config/allowedOrigins";

interface IUserSocket extends Socket {
  data: {
    username: string;
    userId?: string;
  };
}

const port = process.env.PORT || 8080;
const app: Application = express();

const server = http.createServer(app);

const io = new Server(server, {
  allowEIO3: true,
  cors: {
    origin: allowedOrigins,
    credentials: true,
    // origin: 'http://localhost:8080',
    methods: ["GET", "POST"],
  },
});
const corsConfig = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsConfig));
app.use(morgan("tiny"));
app.disable("x-powered-by");
app.set("trust proxy", true);
app.use(express.json());
// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests
//   message: 'Too many requests, please try again later.'
// });

// app.use(limiter)
app.use(cookieParser());
app.use((req: Request, res: Response, next: NextFunction) => {
  // if (req.headers['x-forwarded-proto'] !== 'https') {
  //   return res.redirect(`https://${req.headers.host}${req.url}`);
  // }
  const origin: string | undefined = req.headers.origin;
  console.log(origin, "origin");
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  console.log(req.method, "req.method");
  if (req.method === "OPTIONS") {
    res.status(200).end();
  } else {
    next();
  }
  // next();
});

app.get("/ping", (req: Request, res: Response, next: NextFunction) => {
  console.log(`Server pinging ${new Date().toISOString()}`);
  res.send("Ping the ser");
});

app.get("/cosmos", (req: Request, res: Response) => {
  res.send("cosmos commerce");
});
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use("/api", authRoute);
app.use("/api", walletRoute);
app.use("/api/product", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/order", orderRoute);
app.use("/api/category", categoryRoute);
app.use("/api/xion", xionRoute);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Global Error Handler:", err);

  res.status(500).json({
    success: false,
    message: err.message || "An unexpected error occurred",
  });
});
// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });
// global.io = new Server(httpServer);
// socket.js
// const { Server } = require("socket.io");

// let io;
// module.exports = {
//   init: (server) => {
//     io = new Server(server);
//     return io;
//   },
//   getIO: () => {
//     if (!io) throw new Error("Socket.io not initialized!");
//     return io;
//   }
// };
// const io = require('./socket').getIO();
// io.emit('event', payload);




//?
//?
// io.use((socket, next) => {
//   const apiKey = socket.handshake.headers['cyber-api-key']?.toLowerCase();
//   if (apiKey === Apikey) {
//     return next();
//   }
//   return next(new Error('Invalid API key'));
// });


const emailToSocketId = new Map()
io.on("connection", (socket: IUserSocket) => {
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
    console.log(
      `Private message from ${socket.id} to ${receiverId}: ${message}`
    );

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
  socket.on("chat_mesaage", (msg:string) => {
    io.emit('chat_mesaage',{user:socket.data.username,msg})
  });
  //! typing betweeen buyer and seller
  socket.on('typing',()=>{
    //? messae to the buyer or seller
    socket.broadcast.emit('typing',socket.data.username)
  })
  socket.on('stop_typing',()=>{
    //? messae to the buyer or seller
    socket.broadcast.emit('stop_typing',socket.data.username)
  })
  // Send a welcome message ONLY to the connected user
  socket.emit("welcome", { message: `Welcome, ${socket.id}!` });

  // Send a message to EVERYONE, including the sender
  io.emit("broadcast", { message: `${socket.id} joined the chat` });

  // Send a message to EVERYONE EXCEPT the sender
  socket.broadcast.emit("broadcast", { message: `User ${socket.id} joined` });
  socket.on('room:join',(data)=>{
    console.log(data)
    emailToSocketId.set(data,socket.id)
    socket.to(socket.id).emit('room:join',data)
    
  })
  socket.on("disconnect", () => {
    io.emit('disconnect',{system:'chat disonneeted',message:`${socket.data.username} has lefthe chatt`})
    console.log("User disconnected:", socket.id);
  });
});
connectDb()
  .then(() => {
    //? socket
    server.listen(port, () =>
      console.log(`Server running on http://localhost:${port}`)
    );
    // app.listen(port, () => console.log("we are on port " + port));
    console.log("database is running succesfull");
  })
  .catch((error) => {
    console.log("Invalid database connection: ", error);
  });
  
  
  /**
  client
  const socket = io("http://localhost:3000", {
  auth: {
    token: "user-auth-token",
    userId: "1234"
  }
});
server
io.on("connection", (socket) => {
  const { token, userId } = socket.handshake.auth; // OR use .query if using query params
  console.log("New connection from user:", userId, "with token:", token);

  // You can now store this info, verify the token, or reject the socket if needed
});
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  try {
    const user = jwt.verify(token, "your-secret-key");
    socket.user = user; // attach user info to socket
    next();
  } catch (err) {
    console.log("Authentication failed");
    next(new Error("Authentication error"));
  }
});


  
  */
