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
