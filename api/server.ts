import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";

import * as db from "./db";

import authMiddleware from "./middlewares/auth";

import registerRouter from "./routes/register";
import loginRouter from "./routes/login";
import logoutRouter from "./routes/logout";
import queryRouter from "./routes/query";

class Server {
  private app;

  constructor() {
    this.app = express();
    this.appConfig();
    this.routerConfig();
    this.dbConnect();
  }

  private appConfig() {
    this.app.use(express.json());
    this.app.use(urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(
      cors({
        // origin: process.env.APP_URL,
        // methods: "GET,POST",
        // credentials: true,
      })
    );
    this.app.use(helmet());
    this.app.use(hpp());
  }

  private routerConfig() {
    this.app.use("/register", registerRouter);
    this.app.use("/login", loginRouter);
    this.app.use("/logout", logoutRouter);
    this.app.use("/query", authMiddleware, queryRouter);
  }

  private dbConnect() {
    db.connect().then(() => {
      console.log("DB connected");
    });
  }

  public start = (port: number) => {
    return new Promise((resolve, reject) => {
      this.app
        .listen(port, () => {
          resolve(port);
        })
        .on("error", (err: Object) => reject(err));
    });
  };
}

export default Server;
