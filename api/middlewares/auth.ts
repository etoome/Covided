import { default as jwt } from "jsonwebtoken";

import { JWT_SECRET_KEY } from "../keys/jwt";

import { NextFunction, Request, Response } from "express";

export default function auth(req: Request, res: Response, next: NextFunction) {
  if (req.cookies.auth !== undefined) {
    try {
      if (jwt.verify(req.cookies.auth, JWT_SECRET_KEY)) {
        return next();
      }
    } catch (err) {
      throw new Error(`jwt.verify : ${err}`);
    }
  }

  return res.status(403).send({ message: "Invalid token cookie" });
}
