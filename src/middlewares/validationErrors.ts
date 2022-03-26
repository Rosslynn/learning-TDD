import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import Debug from "debug";
const debug = Debug("app:ValidationErrors");

interface IUserSignupErrors {
  userName?: string;
  email?: string;
  password?: string;
}

/**
 * Middleware para validar los errores
 * @param req - Solicitud de entrada
 * @param res - Respuesta de la petición
 * @param next - Función para continuar el flujo
 * @returns - Devuelve los errores o continua el flujo
 */
export function validationErrorsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const validationErrors: IUserSignupErrors = {};
    for (const [, value] of Object.entries(result.array())) {
      // Se utiliza Object.prototype, etc ya que si se utiliza validationErrors.hasOwnProperty, es posible que el objeto validationErrors
      // Tenga un método llamado hasOwnProperty, por lo tanto esto puede hacer que el código falle, al utilizar .prototype evitamos esto
      if (Object.prototype.hasOwnProperty.call(validationErrors, value.param)) {
        switch (value.param) {
          case "userName":
            validationErrors.userName += `. ${value.msg}`;
            break;
          case "email":
            validationErrors.email += `. ${value.msg}`;
            break;
          case "password":
            validationErrors.password += `. ${value.msg}`;
            break;
          default:
            debug(
              `${value.param} no ha sido definido, parece que su valor ha sido modificado en el proceso`
            );
            break;
        }
        continue;
      }

      Object.defineProperty(validationErrors, value.param, {
        value: `${value.msg}`,
        enumerable: true,
        writable: true,
      });
    }
    return res.status(400).json({ ok: false, validationErrors });
  }

  next();
}
