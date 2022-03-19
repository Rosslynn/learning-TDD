import request from "supertest";

import { AppServer } from "../src/models/server";

// Probar la aplicación, para esto se utiliza supertest
const appServer = new AppServer();

describe("User Registration", () => {
  /*   it("returns 200 OK when signup request is valid", async () => {
    // Arrange
    const statusExpected = 200;
    const userData = {
      userName: "user1",
      email: "user1@gmail.com",
      password: "P3assword",
    };

    // Act
    const response = await request(appServer.app)
      .post(`${appServer.routePrefix}/users`)
      .send(userData);

    // Assert
    expect(response.statusCode).toBe(statusExpected);
  });
 */
  it("return success message when signup request is valid", async () => {
    // Arrange
    const statusCode = 201;
    const userData = {
      userName: "user1123",
      email: "use1231231r1@gmail.com",
      password: "P32312312assword",
    };

    // Act
    const response = await request(appServer.app)
      .post(`${appServer.routePrefix}/users`)
      .send(userData);

    // Assert
    // Se toma el body y se compara que en la respuesta exista una propiedad .msg con el valor "ok"
    expect(response.statusCode).toBe(statusCode);
  });
});
