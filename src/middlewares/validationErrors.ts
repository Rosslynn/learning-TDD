import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

interface IUserErrors {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
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
    const validationErrors: IUserErrors = {};
    for (const [, value] of Object.entries(result.array())) {
      // eslint-disable-next-line no-prototype-builtins
      if (validationErrors.hasOwnProperty(value.param)) {
        validationErrors[value.param] += `. ${value.msg}`;
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
