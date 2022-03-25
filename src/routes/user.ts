import { Router } from "express";
import { validationErrorsMiddleware } from "../middlewares/validationErrors";

import { UserController } from "../controllers/user";
import { body } from "express-validator";

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

userRouter.post(
  "/",
  [
    body("userName").notEmpty().withMessage("Los nombres son obligatorios"),
    body("email")
      .notEmpty()
      .withMessage("El correo es obligatorio")
      .isEmail()
      .withMessage("Debe tener formato de correo: micorreo@hermoso.com"),
    body("password")
      .notEmpty()
      .withMessage("La contraseña es requerida")
      .isLength({ min: 6 })
      .withMessage("El número mínimo de caracteres es 6"),
    validationErrorsMiddleware,
  ],
  userController.createUser
);

export { userRouter };
