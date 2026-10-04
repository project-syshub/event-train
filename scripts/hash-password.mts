// ログイン用のパスワードのハッシュを作る（npm run hash-password -- <パスワード> [<パスワード> ...]）。
// 出力された値を src/lib/users.ts の passwordHash に書く。
// 照合時と同じく、大文字・小文字や o と 0、l と 1 の違いをそろえてからハッシュにする。
import bcrypt from "bcryptjs";
import { normalizePassword } from "../src/lib/users.ts";

for (const password of process.argv.slice(2)) {
  console.log(`${password}\t${bcrypt.hashSync(normalizePassword(password), 10)}`);
}
