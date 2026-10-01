// 現地に貼る手がかり用QRコードの画像を qr-codes/ に生成する（npm run qr）
import { mkdir } from "node:fs/promises";
import QRCode from "qrcode";
import { mockClues } from "../src/lib/clues.ts";

const OUTPUT_DIR = "qr-codes";

await mkdir(OUTPUT_DIR, { recursive: true });

for (const clue of mockClues) {
  const fileName = `${OUTPUT_DIR}/${clue.id}.png`;
  await QRCode.toFile(fileName, clue.qrCode, { width: 600, margin: 2 });
  console.log(`${fileName}  ${clue.name}`);
}
