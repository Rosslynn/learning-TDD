import request from "supertest";
import { sequelize } from "../src/config/connection";
import { interactsWithMail as iwm } from "nodemailer-stub";

import { AppServer } from "../src/models/server";
import { User } from "../src/models/user";

interface IUserData {
  userName: string | null;
  email: string | null;
  password: string | null;
}

// Probar la aplicación, para esto se utiliza supertest
const appServer = new AppServer();

// Se ejecuta antes de ejecutar cualquier test, se puede utilizar para hacer un sync a la bd
beforeAll(async () => {
  await sequelize.sync({
    force: process.env.NODE_ENV?.trim() === "development",
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

function postValidUser(userData: object) {
  return request(appServer.app)
    .post(`${appServer.routePrefix}/users`)
    .send(userData);
}

describe("User Registration", () => {
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

  it("returns 400 when userName is null", async () => {
    // Arrange
    const userData = {
      userName: null,
      email: "123@gmail.com",
      password: "P32312312assword",
    };
    // Act
    const response = await postValidUser(userData);

    // Assert
    expect(response.statusCode).toBe(400);
  });

  it("returns validationErrors field in response body when validation error occurs", async () => {
    // Arrange
    const userData = {
      userName: null,
      email: "123@gmail.com",
      password: "P32312312assword",
    };
    // Act
    const response = await postValidUser(userData);

    // Assert
    expect(response.body.validationErrors).not.toBeUndefined();
  });

  it("returns Los nombres son obligatorios when userName is null", async () => {
    // Arrange
    const userData = {
      userName: null,
      email: "123@gmail.com",
      password: "P32312312assword",
    };
    // Act
    const response = await postValidUser(userData);

    // Assert
    expect(response.body.validationErrors.userName).toBe(
      "Los nombres son obligatorios"
    );
  });

  it("returns Debe tener formato de correo: micorreo@hermoso.com when email format is not valid", async () => {
    // Arrange
    const userData = {
      userName: "12112",
      email: "12312",
      password: "P32312312assword",
    };
    // Act
    const response = await postValidUser(userData);

    // Assert
    expect(response.body.validationErrors.email).toBe(
      "Debe tener formato de correo: micorreo@hermoso.com"
    );
  });

  it("Error response contains La contraseña es requerida when password is false", async () => {
    // Arrange
    const userData = {
      userName: "12112",
      email: "12312",
      password: undefined,
    };
    // Act
    const response = await postValidUser(userData);

    // Assert
    expect(
      response.body.validationErrors.password.includes(
        "La contraseña es requerida"
      )
    ).toBe(true);
  });

  it("Error response contains El número mínimo de caracteres es 6 when password length is less than 6", async () => {
    // Arrange
    const userData = {
      userName: "12112",
      email: "12312",
      password: "123",
    };
    // Act
    const response = await postValidUser(userData);

    // Assert
    expect(
      response.body.validationErrors.password.includes(
        "El número mínimo de caracteres es 6"
      )
    ).toBe(true);
  });

  it("Returns userName, email and password array (keys that are not valid) when they are false", async () => {
    // Arrange
    const userData = {
      userName: null,
      email: null,
      password: null,
    };
    // Act
    const response = await postValidUser(userData);

    // Assert
    expect(Object.keys(response.body.validationErrors)).toEqual([
      "userName",
      "email",
      "password",
    ]);
  });

  it.each([
    ["userName", "Los nombres son obligatorios"],
    ["email", "El correo es obligatorio"],
    ["password", "La contraseña es requerida"],
  ])("when %s is null should return %s", async (field, messageReceived) => {
    // Arrange
    const userData: IUserData = {
      userName: "Lynross",
      email: "mauriciobarva@gmail.com",
      password: "123456",
    };

    switch (field) {
      case "userName":
        userData.userName = null;
        break;
      case "email":
        userData.email = null;
        break;
      case "password":
        userData.password = null;
        break;
      default:
        console.log(`${field} no existe.`);
        break;
    }

    // Act
    const response = await postValidUser(userData);

    // Assert
    expect(
      response.body.validationErrors[field].includes(messageReceived)
    ).toBe(true);
  });

  it.each`
    field         | value                | messageReceived
    ${"userName"} | ${null}              | ${"Los nombres son obligatorios"}
    ${"userName"} | ${"12"}              | ${"El mínimo de caracteres para el nombre es 3 y el máximo 32"}
    ${"userName"} | ${"12".repeat(34)}   | ${"El mínimo de caracteres para el nombre es 3 y el máximo 32"}
    ${"email"}    | ${null}              | ${"El correo es obligatorio"}
    ${"email"}    | ${"askdas"}          | ${"Debe tener formato de correo: micorreo@hermoso.com"}
    ${"email"}    | ${"askdas@aaaaaaaa"} | ${"Debe tener formato de correo: micorreo@hermoso.com"}
    ${"password"} | ${null}              | ${"La contraseña es requerida"}
    ${"password"} | ${"4"}               | ${"El número mínimo de caracteres es 6"}
  `(
    "BEST WAY | when $field is $value should return $messageReceived",
    async ({ field, value, messageReceived }) => {
      // Arrange
      const userData: IUserData = {
        userName: "Lynross",
        email: "mauriciobarva@gmail.com",
        password: "123456",
      };

      switch (field) {
        case "userName":
          userData.userName = value;
          break;
        case "email":
          userData.email = value;
          break;
        case "password":
          userData.password = value;
          break;
        default:
          console.log(`${field} no existe.`);
          break;
      }

      // Act
      const response = await postValidUser(userData);

      // Assert
      expect(response.body.validationErrors[field]).toBe(messageReceived);
    }
  );

  it("returns userName already in use when userName is already in use", async () => {
    // Arrange
    const userData = {
      userName: "Lynross",
      email: "mauriciobarva@gmail.com",
      password: "123456",
    };

    await User.create({ ...userData });
    const response = await postValidUser(userData);

    expect(response.body.validationErrors.userName).toBe(
      "userName already in use"
    );
  });

  it("returns E-mail is already in use when same email is already in use", async () => {
    // Arrange
    const userData = {
      userName: "Lynross",
      email: "mauriciobarva@gmail.com",
      password: "123456",
    };

    await User.create({ ...userData, userName: "XD" });
    const response = await postValidUser({ ...userData, userName: "jasja" });

    expect(response.body.validationErrors.email).toBe(
      "E-mail is already in use"
    );
  });

  it("returns error of both, userName and Email when they are already in use", async () => {
    // Arrange
    const userData = {
      userName: "Lynross",
      email: "mauriciobarva@gmail.com",
      password: "123456",
    };

    await User.create({ ...userData });
    const response = await postValidUser(userData);

    // To equal se debe usar comparando objetos o arrays
    expect(Object.keys(response.body.validationErrors)).toEqual([
      "userName",
      "email",
    ]);
  });

  it("creates user in inactive mode", async () => {
    // Arrange
    const userData = {
      userName: "Lynross",
      email: "mauriciobarva@gmail.com",
      password: "123456",
    };

    await postValidUser(userData);
    const dbUser = await User.findOne({
      where: { email: userData.email },
    });

    if (dbUser) {
      expect(dbUser.isActive).toBe(false);
    }
  });

  it("creates an activation token for user", async () => {
    // Arrange
    const userData = {
      userName: "Lynross",
      email: "mauriciobarva@gmail.com",
      password: "123456",
    };

    await postValidUser(userData);
    const dbUser = await User.findOne({
      where: { email: userData.email },
    });

    if (dbUser) {
      expect(dbUser.activationToken).toBeTruthy();
    }
  });

  it("sends an account activation email with activation token", async () => {
    // Arrange
    const userData = {
      userName: "Lynross",
      email: "mauriciobarva@gmail.com",
      password: "123456",
    };

    await postValidUser(userData);
    const dbUser = await User.findOne({
      where: { email: userData.email },
    });
    const lastMail = iwm.lastMail();
    console.log({ lastMail });
    expect(lastMail.to[0]).toContain(userData.email);
    expect(lastMail.content).toContain(dbUser?.activationToken);
  });
});
