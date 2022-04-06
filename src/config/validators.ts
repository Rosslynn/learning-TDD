import { User } from "../models/user";

/**
 * Función para validar si ya existe un correo electrónico en la base de datos
 * @param email - Correo electrónico a buscar
 * @returns - String con el error, de lo contrario true y continua el flujo
 */
export async function validateExistingEmail(email: string) {
  const dbUser = await User.findOne({ where: { email } });

  if (dbUser) {
    throw "E-mail is already in use";
  }

  return true;
}

/**
 * Función para validar si existe un usuario con la propiedad userName creado en la base de datos
 * @param userName - Username a buscar si existe en la base de datos
 * @returns - Strng con el error, de lo contrario true y continua el flujo
 */
export async function validateExistingUserName(userName: string) {
  const dbUser = await User.findOne({ where: { userName } });

  if (dbUser) {
    throw "userName already in use";
  }

  return true;
}
