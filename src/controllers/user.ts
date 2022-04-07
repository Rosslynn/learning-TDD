import { Request, Response } from "express";
import Debug from "debug";
import crypto from "crypto";

import { User } from "../models/user";
import { sendAccountActivationToken } from "../email/emailService";
import { sequelize } from "../config/connection";

const debug = Debug("app:userController");

function activationAccountToken(length: number) {
  return crypto.randomBytes(length).toString("hex").substring(0, length);
}

export class UserController {
  async createUser(req: Request, res: Response) {
    const { userName, email, password } = req.body;
    const transaction = await sequelize.transaction();
    try {
      const user = await User.create(
        {
          userName,
          email,
          password,
          activationToken: activationAccountToken(16),
        },
        {
          transaction,
          fields: ["userName", "email", "password", "activationToken"],
        }
      );

      await sendAccountActivationToken(
        undefined,
        email,
        undefined,
        user.activationToken
      );

      // Guarda los datos en la bd
      await transaction.commit();

      return res.status(201).json({
        ok: true,
        user,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      debug(error);
      transaction.rollback();
      return res.status(500).json({
        ok: false,
        msg: "Hable con el administrador para solucionar este problema.",
        error,
      });
    }
  }
}
