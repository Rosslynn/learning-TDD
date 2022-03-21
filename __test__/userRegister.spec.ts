import request from "supertest";
import { sequelize } from "../src/database/connection";

import { AppServer } from "../src/models/server";
import { User } from "../src/models/user";

// Probar la aplicación, para esto se utiliza supertest
const appServer = new AppServer();

// Se ejecuta antes de ejecutar cualquier test, se puede utilizar para hacer un sync a la bd
beforeAll(async () => {
  await sequelize.sync({
    alter: process.env.NODE_ENV?.trim() === "development",
  });
});

// Se ejecuta antes de cada test, individualmente
beforeEach(async () => {
  User.destroy({ truncate: true });
});

// Se debe cerrar la conexión para acabar todo
afterAll(async () => {
  await sequelize.close();
});

describe("User Registration", () => {
  function postValidUser(userData: object) {
    return request(appServer.app)
      .post(`${appServer.routePrefix}/users`)
      .send(userData);
  }
  it("returns 201 OK when signup request is valid", async () => {
    // Arrange
    const statusExpected = 201;
    const userData = {
      userName: "user1",
      email: "user1@gmail.com",
      password: "P3assword",
    };

    // Act
    const response = await postValidUser(userData);

    // Assert
    expect(response.statusCode).toBe(statusExpected);
  });

  it("saves the user to database", async () => {
    // Arrange
    const userData = {
      userName: "123",
      email: "123@gmail.com",
      password: "P32312312assword",
    };

    // Act
    await postValidUser(userData);

    // Assert
    const dbUsers = await User.findAll({
      where: {
        userName: userData.userName,
      },
    });

    expect(dbUsers).not.toBeNull();
  });

  it("saves the userName and email to database", async () => {
    // Arrange
    const userData = {
      userName: "123",
      email: "123@gmail.com",
      password: "P32312312assword",
    };

    // Act
    await postValidUser(userData);

    // Assert
    const [dbUser] = await User.findAll({
      where: {
        userName: userData.userName,
      },
    });

    expect(dbUser.userName).toBe("123");
    expect(dbUser.email).toBe("123@gmail.com");
  });

  it("hashes the password in database", async () => {
    // Arrange
    const userData = {
      userName: "123",
      email: "123@gmail.com",
      password: "P32312312assword",
    };

    // Act
    const response = await postValidUser(userData);

    // Assert
    expect(response.body.user.password).not.toBe(userData.password);
  });
});
