import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import Debug from "debug";

const debug = Debug("app:databaseConnection");
dotenv.config();

/**
 * Instancia de Sequelize
 * @type { Sequelize }
 */
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const sequelize: Sequelize = new Sequelize(process.env.DB_CNN!, {
  logging: (msg) => debug(msg),
});
// Intentar pasarle la cadena a ver
export { sequelize };
