export interface Token {
  username: string;
  role: "user" | "epidemiologist";
}

export function isToken(token: Token): token is Token {
  return (
    token &&
    typeof token.username === "string" &&
    ["user", "epidemiologist"].includes(token.role)
  );
}
