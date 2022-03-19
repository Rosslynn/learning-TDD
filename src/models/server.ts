import express, { Application } from "express";
import { sequelize } from "../database/connection";
import cors from "cors";
import Debug from "debug";
const debug = Debug("app:server");

import { userRouter } from "../routes/user";

/**
 * Clase encargada de al abstraer la inicialización del servidor
 */
export class AppServer {
  /**
   *  Propiedad que contiene la aplicación de express
   */
  readonly app!: Application;

  /**
   * Propiedad que contiene el puerto utilizado por el servidor
   */
  private port!: string | number;

  /**
   * Varbiable que contiene el prefijo de las rutas de la API
   */
  readonly routePrefix!: string;

  /**
   * Singleton de la clase AppServer
   */
  private static singletonAppServer: AppServer;

  /**
   * Constructor que inicializa el objeto de la clase AppServer
   */
  constructor() {
    // eslint-disable-next-line no-extra-boolean-cast
    if (!!AppServer.singletonAppServer) {
      return AppServer.singletonAppServer;
    }

    this.app = express();
    this.middlewares();
    this.routePrefix = "/api/1.0";
    this.port = process.env.PORT || 8080;
    this.routes();
    this.databaseConnection();
    AppServer.singletonAppServer = this;
  }

  /**
   * Método encargado de poner en marcha el servidor
   */
  listen(): void {
    this.app.listen(this.port, () => {
      debug(`Server is running on port ${this.port}...`);
    });
  }

  /**
   * Método encargado de la definición de las rutas de la aplicación
   */
  private routes(): void {
    this.app.use(`${this.routePrefix}/users`, userRouter);
  }

  /**
   * Método para establecer la conexión a la base de datos
   */
  private async databaseConnection(): Promise<void> {
    try {
      await sequelize.sync({
        alter: process.env.NODE_ENV?.trim() === "development",
      });
      await sequelize.authenticate();
      debug("Conexión a la base de datos establecida con éxito.");
    } catch (error) {
      debug("server", error);
      throw new Error(`Error al inicializar la base de datos... ${error}`);
    }
  }

  /**
   * Método que contiene los middlewares de la aplicación
   */
  private middlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());
  }
}
