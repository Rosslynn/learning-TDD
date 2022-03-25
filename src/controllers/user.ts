import { Request, Response } from "express";
import Debug from "debug";
const debug = Debug("app:userController");

import { User } from "../models/user";

export class UserController {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  async createUser(req: Request, res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userName, email, password } = req.body;

    try {
      const user = await User.create({ userName, email, password });

      return res.status(201).json({
        ok: true,
        user,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      debug(error);
      return res.status(500).json({
        ok: false,
        msg: "Hable con el administrador para solucionar este problema.",
        error,
      });
    }
  }
}
