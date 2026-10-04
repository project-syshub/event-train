// 【役割】ログインできるアカウントの一覧。
//
// 【変更すると】
//  - loginId / hashSync("…") の中身 … ログインのIDとパスワードが変わる
//  - mockUsers に1件追加 … ログインできるアカウントが増える（id は他と重ならない値にする）
//
// 【注意】パスワードがコードに直接書かれているので、GitHubを見られる人には分かる。本番運用ではDBに移す。

import bcrypt from "bcryptjs";

export type User = {
  id: string;
  loginId: string;
  passwordHash: string;
};

// TODO: PostgreSQLのusersテーブルに置き換える。現時点ではモックデータ。
export const mockUsers: User[] = [
  {
    id: "user-1",
    loginId: "admin",
    passwordHash: bcrypt.hashSync("pass01", 10),
  },
];

export function findUserByLoginId(loginId: string): User | undefined {
  return mockUsers.find((user) => user.loginId === loginId);
}

export function findUserById(id: string): User | undefined {
  return mockUsers.find((user) => user.id === id);
}
