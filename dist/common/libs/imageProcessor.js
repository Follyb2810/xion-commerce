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
exports.processImageWithSharp = processImageWithSharp;
const crypto_1 = __importDefault(require("crypto"));
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
function processImageWithSharp(inputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const imgId = crypto_1.default.randomBytes(5).toString('hex');
        const outputFilename = `${imgId}-processed.webp`;
        const tempDir = path_1.default.join(__dirname, "..", "temp");
        const outputPath = path_1.default.join(tempDir, outputFilename);
        yield promises_1.default.mkdir(tempDir, { recursive: true });
        const metadata = yield (0, sharp_1.default)(inputPath).metadata();
        if (metadata.format === "svg") {
            throw new Error("SVG format is not supported for processing");
        }
        yield (0, sharp_1.default)(inputPath)
            .resize(1080, 720, { fit: "cover" })
            .webp({ quality: 80 })
            .toFile(outputPath);
        return outputPath;
    });
}
//? add image as watermark
// await sharp(inputPath)
//   .resize(1080, 720, { fit: "cover" })
//   .composite([
//     {
//       input: path.join(__dirname, "..", "assets", "logo.png"),
//       gravity: "southeast", // position: bottom right
//       blend: "overlay",     // blend mode
//     },
//   ])
//   .webp({ quality: 80 })
//   .toFile(outputPath);
//? add text
// import Jimp from 'jimp';
// const textImage = new Jimp(300, 50, 0x00000000); // transparent
// const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
// textImage.print(font, 10, 10, "chaincart");
// await textImage.writeAsync(path.join(__dirname, "text.png"));
// await sharp(inputPath)
//   .resize(1080, 720)
//   .composite([
//     { input: path.join(__dirname, "text.png"), gravity: "northwest" }
//   ])
//   .webp({ quality: 80 })
//   .toFile(outputPath);
//? add border
// await sharp(inputPath)
//   .resize(1080, 720)
//   .extend({
//     top: 10,
//     bottom: 10,
//     left: 10,
//     right: 10,
//     background: { r: 0, g: 0, b: 0, alpha: 1 }, // black border
//   })
//   .webp({ quality: 80 })
//   .toFile(outputPath);
