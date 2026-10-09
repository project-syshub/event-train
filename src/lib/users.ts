// 【役割】ログインできるアカウントをデータベース（users テーブル）から探し、パスワードを照合する。
//
// 【アカウントを追加・変更するとき】
//  - `npm run db:set-user -- <ID> <パスワード>` … 1件追加する（同じIDがあればパスワードを変える）
//  - 最初の50人＋admin は scripts/data/initial-users.mts にあり、`npm run db:setup` で登録される
//  - 入力の揺れ（大文字・小文字、o と 0 など）の許し方は password.ts で決めている
//
// 運営用のアカウントは ADMIN_LOGIN_ID。リセット・全出しのボタンと一斉メッセージの送信は、このアカウントだけが使える
//
// users テーブル：id（ログイン状態・発見記録に使う。変えない）/ login_id（入力するID）/ password_hash

import { getSql } from "./db";
import { getSessionUserId } from "./session";
import { normalizeLoginId, passwordMatches } from "./password";

export type User = {
  id: string;
  loginId: string;
  passwordHash: string;
};

type UserRow = { id: string; login_id: string; password_hash: string };

function toUser(row: UserRow): User {
  return { id: row.id, loginId: row.login_id, passwordHash: row.password_hash };
}

export async function findUserByLoginId(loginId: string): Promise<User | undefined> {
  const rows = (await getSql()`
    SELECT id, login_id, password_hash FROM users WHERE login_id = ${normalizeLoginId(loginId)}
  `) as UserRow[];
  return rows[0] ? toUser(rows[0]) : undefined;
}

export async function findUserById(id: string): Promise<User | undefined> {
  const rows = (await getSql()`
    SELECT id, login_id, password_hash FROM users WHERE id = ${id}
  `) as UserRow[];
  return rows[0] ? toUser(rows[0]) : undefined;
}

export function verifyPassword(user: User, password: string): boolean {
  return passwordMatches(password, user.passwordHash);
}

// 運営用アカウントのID（このIDでログインしたときだけ、管理用のボタンとメッセージ送信が使える）
export const ADMIN_LOGIN_ID = "admin";

export function isAdmin(user: Pick<User, "loginId">): boolean {
  return user.loginId === ADMIN_LOGIN_ID;
}

// ログイン中の人が運営用アカウントならそのユーザーを、そうでなければ null を返す（管理用の API で使う）
export async function getSessionAdmin(): Promise<User | null> {
  const userId = await getSessionUserId();
  const user = userId ? await findUserById(userId) : undefined;
  return user && isAdmin(user) ? user : null;
}
