import { AppServer } from "./models/server";
import dotenv from "dotenv";

/**
 * Inicializar las variables de entorno de la aplicaciòn
 */
dotenv.config();

/**
 * Instancia del servidor
 * @type { AppServer }
 */
const server: AppServer = new AppServer();
server.listen();
