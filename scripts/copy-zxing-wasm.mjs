// 虫眼鏡のQR読み取りに使う zxing-wasm の本体（.wasm）を public/zxing/ にコピーする。
// npm install のあとに自動で実行される（package.json の postinstall）。Vercel でもビルド前に実行される。
// 外部のCDNに頼らず、このアプリ自身から配信するため。public/zxing/ はGitの管理外。
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("public/zxing", { recursive: true });
copyFileSync("node_modules/zxing-wasm/dist/reader/zxing_reader.wasm", "public/zxing/zxing_reader.wasm");
