import jwtDecode from "jwt-decode";
import { NextPageContext } from "next";
import cookies from "next-cookies";
import { isToken } from "../schema/Token";

export default function logged(ctx: NextPageContext) {
  const { auth } = cookies(ctx);

  if (!auth) {
    return false;
  }

  const decoded: any = jwtDecode(auth);

  return isToken(decoded);
}
