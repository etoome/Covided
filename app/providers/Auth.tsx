import { createContext } from "react";
import { Token } from "../schema/Token";

type AuthContext = {
  user: Token | undefined;
};

export const AuthContext = createContext<AuthContext>({
  user: undefined,
});
