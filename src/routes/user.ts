import { Router } from "express";

import { UserController } from "../controllers/user";

/**
 * Rutas de usuario
 * @type {Router}
 */
const userRouter: Router = Router();

/**
 * Controlador del usuario
 * @type {UserController}
 */
const userController: UserController = new UserController();

userRouter.post("/", userController.createUser);

export { userRouter };
