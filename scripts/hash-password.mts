// ログイン用のパスワードのハッシュを作る（npm run hash-password -- <パスワード> [<パスワード> ...]）。
// scripts/data/initial-users.ts に書くときに使う。データベースに直接1件追加するなら npm run db:set-user が楽。
// 照合時と同じく、大文字・小文字や o と 0、l と 1 の違いをそろえてからハッシュにする。
import { hashPassword } from "../src/lib/password.ts";

for (const password of process.argv.slice(2)) {
  console.log(`${password}\t${hashPassword(password)}`);
}
