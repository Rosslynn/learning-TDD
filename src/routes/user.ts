import { Router } from "express";
import { validationErrorsMiddleware } from "../middlewares/validationErrors";

import { UserController } from "../controllers/user";
import { body } from "express-validator";
import {
  validateExistingEmail,
  validateExistingUserName,
} from "../config/validators";

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
    body("userName")
      .notEmpty()
      .withMessage("Los nombres son obligatorios")
      .bail()
      .isLength({ min: 3, max: 32 })
      .withMessage("El mínimo de caracteres para el nombre es 3 y el máximo 32")
      .bail()
      .custom(validateExistingUserName),
    body("email")
      .notEmpty()
      .withMessage("El correo es obligatorio")
      .bail()
      .isEmail()
      .withMessage("Debe tener formato de correo: micorreo@hermoso.com")
      .bail()
      .custom(validateExistingEmail),
    body("password")
      .notEmpty()
      .withMessage("La contraseña es requerida")
      .bail()
      .isLength({ min: 6 })
      .withMessage("El número mínimo de caracteres es 6"),
    validationErrorsMiddleware,
  ],
  userController.createUser
);

export { userRouter };
