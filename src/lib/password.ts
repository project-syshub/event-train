// 【役割】ログインのIDとパスワードの入力の揺れをそろえる処理と、パスワードのハッシュ化。
//
// 【変更すると】
//  - normalizePassword … 入力の揺れをどこまで許すか（今は大文字・小文字、o と 0、l と 1 を同じものとして扱う）
//
// 【注意】normalizePassword を変えたら、データベースにある全員の password_hash を作り直す必要がある
// （照合できなくなるため）。

import bcrypt from "bcryptjs";

// 参加者が紙のカードを見て入力するときに間違えやすい違いをそろえる
//  - 全角・半角、前後の空白、大文字・小文字（スマホが先頭を自動で大文字にすることがある）
//  - o（オー）と 0（ゼロ）、l（エル）と 1（イチ）
export function normalizePassword(password: string): string {
  return password.normalize("NFKC").trim().toLowerCase().replace(/o/g, "0").replace(/l/g, "1");
}

// IDは全角の数字や前後の空白、大文字・小文字の違いを無視する
export function normalizeLoginId(loginId: string): string {
  return loginId.normalize("NFKC").trim().toLowerCase();
}

// データベースに保存するハッシュを作る（入力の揺れをそろえてからハッシュにする）
export function hashPassword(password: string): string {
  return bcrypt.hashSync(normalizePassword(password), 10);
}

export function passwordMatches(password: string, passwordHash: string): boolean {
  return bcrypt.compareSync(normalizePassword(password), passwordHash);
}
