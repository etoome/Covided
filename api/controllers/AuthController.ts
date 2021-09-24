import { Request, Response } from "express";

import { default as jwt } from "jsonwebtoken";
import { argon2id, argon2Verify } from "hash-wasm";
import crypto from "crypto";

import * as db from "../db";
import { JWT_SECRET_KEY } from "../keys/jwt";
import {
  Epidemiologist,
  isEpidemiologist,
  isUser,
  isUserAuth,
  User,
  UserAuth,
} from "../schema/User";
import { Token } from "../schema/Token";

class AuthController {
  private static sendToken(res: Response, payload?: Token) {
    if (payload !== undefined) {
      const token = jwt.sign(payload, JWT_SECRET_KEY, {
        expiresIn: "1h",
      });

      return res
        .cookie("auth", token, {
          httpOnly: true,
          secure: false,
          sameSite: "strict",
          maxAge: 1 * 60 * 60 * 1000,
          path: "/",
        })
        .send({ message: "Logged In" });
    } else {
      return res
        .cookie("auth", "", {
          httpOnly: true,
          secure: false,
          sameSite: "strict",
          maxAge: 0,
          path: "/",
        })
        .send({ message: "Logged out" });
    }
  }

  public async register(req: Request, res: Response) {
    if (!isUser(req.body)) {
      return res.status(400).send({ message: "body information invalid" });
    }
    const {
      username,
      password,
      first_name,
      last_name,
      address: {
        street: address_street,
        number: address_number,
        postal_code: address_postal_code,
        city: address_city,
      },
    }: User = req.body;

    if (await db.userExists(username)) {
      return res.status(400).send({ message: "Username already taken" });
    }

    const hashed = await argon2id({
      password: password,
      salt: crypto.randomBytes(32),
      parallelism: 1,
      iterations: 256,
      memorySize: 512, // use 512KB memory
      hashLength: 32, // output size = 32 bytes
      outputType: "encoded", // return standard encoded string containing parameters needed to verify the key
    });

    const id = await db.addUser({
      username,
      password: hashed,
      first_name,
      last_name,
      address: {
        street: address_street,
        number: address_number,
        postal_code: address_postal_code,
        city: address_city,
      },
    });

    if (isEpidemiologist(req.body)) {
      const { center, service_phone }: Epidemiologist = req.body;
      await db.addEpidemiologist({ id, center, service_phone });
    }

    const role = await db.getUserRole(id);
    return AuthController.sendToken(res, { username, role });
  }

  public async login(req: Request, res: Response) {
    if (!isUserAuth(req.body)) {
      return res.status(400).send({ message: "body information invalid" });
    }

    const { username, password }: UserAuth = req.body;

    const user = await db.getUserAuth(username);
    if (user === undefined) {
      return res.status(400).send({ message: "No account" });
    }

    if (
      !(await argon2Verify({
        password: password,
        hash: user.password,
      }))
    ) {
      return res.status(400).send({ message: "Wrong password" });
    }

    const role = await db.getUserRole(user.id);
    AuthController.sendToken(res, { username, role });
  }

  public async logout(req: Request, res: Response) {
    AuthController.sendToken(res);
  }
}

export default AuthController;
