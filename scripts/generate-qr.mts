// 現地に貼る手がかり用QRコードの画像を qr-codes/ に生成する（npm run qr）。
// clues.ts の qrCode をそのままQRにする。qr.quel.jp などで自分でQRを作る場合は使わなくてよい。
//
// 【変更すると】
//  - width … 出力する画像の大きさ（ピクセル）
//  - margin … QRの周りの白い余白（小さすぎると読み取りにくくなる）
//  - OUTPUT_DIR … 画像の保存先（qr-codes/ はGitの管理外）
import { mkdir } from "node:fs/promises";
import QRCode from "qrcode";
import { mockClues } from "../src/lib/clues.ts";

const OUTPUT_DIR = "qr-codes";

await mkdir(OUTPUT_DIR, { recursive: true });

// QRの文字列がまだ決まっていない手がかりは飛ばす
for (const clue of mockClues.filter((c) => c.qrCode !== undefined)) {
  const fileName = `${OUTPUT_DIR}/${clue.id}.png`;
  await QRCode.toFile(fileName, clue.qrCode!, { width: 600, margin: 2 });
  console.log(`${fileName}  ${clue.name}`);
}
