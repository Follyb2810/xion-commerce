"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const db_1 = require("./config/db");
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const allowedOrigins_1 = require("./config/allowedOrigins");
const globalError_1 = require("./middleware/globalError");
const socketConfig_1 = require("./config/socketConfig");
const features_1 = __importDefault(require("./features"));
const port = process.env.PORT || 8080;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
(0, socketConfig_1.initializeSocket)(server);
const corsConfig = {
    origin: allowedOrigins_1.allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
};
app.use((0, cors_1.default)(corsConfig));
app.use((0, morgan_1.default)("tiny"));
app.disable("x-powered-by");
app.set("trust proxy", true);
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: "Too many requests, please try again later.",
// });
// app.use(limiter);
app.use((0, cookie_parser_1.default)());
app.use((req, res, next) => {
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
(0, features_1.default)(app);
app.use(globalError_1.globalError);
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
