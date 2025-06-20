import dotenv from "dotenv";
dotenv.config();
import express, { Application, Response, Request, NextFunction } from "express";
import { connectDb } from "./config/db";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import http from "http";
import { allowedOrigins } from "./config/allowedOrigins";
import { globalError } from "./middleware/globalError";
import { initializeSocket } from "./config/socketConfig";
import { cache } from "./common/libs/cache";
import loadRoutes from "./features";

const port = process.env.PORT || 8080;
const app: Application = express();

const server = http.createServer(app);

initializeSocket(server);

const corsConfig = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
};

app.use(cors(corsConfig));
app.use(morgan("tiny"));
app.disable("x-powered-by");
app.set("trust proxy", true);
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: "Too many requests, please try again later.",
// });

// app.use(limiter);
app.use(cookieParser());
app.use((req: Request, res: Response, next: NextFunction) => {
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

loadRoutes(app);

app.use(globalError);

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
