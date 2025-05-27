import crypto from 'crypto';
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

export async function processImageWithSharp(inputPath: string): Promise<string> {
  const imgId = crypto.randomBytes(5).toString('hex');
  const outputFilename = `${imgId}-processed.webp`;
  const tempDir = path.join(__dirname, "..", "temp");
  const outputPath = path.join(tempDir, outputFilename);
  await fs.mkdir(tempDir, { recursive: true });

  const metadata = await sharp(inputPath).metadata();
  if (metadata.format === "svg") {
    throw new Error("SVG format is not supported for processing");
  }

  await sharp(inputPath)
    .resize(1080, 720, { fit: "cover" })
    .webp({ quality: 80 })
    .toFile(outputPath);

  return outputPath;
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

