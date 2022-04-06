import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import Debug from "debug";
import bcrypt from "bcrypt";
import { sequelize } from "../config/connection";

const debug = Debug("app:userModel");

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare userName: string;
  declare email: string;
  declare password: string;
  declare isActive: CreationOptional<boolean>;
  declare activationToken: CreationOptional<string>;
  /*   declare fullName: CreationOptional<string>; */
}

User.init(
  {
    userName: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        isIn: {
          args: [[true, false]],
          msg: "El valor de isActive debe ser true o false",
        },
      },
    },
    activationToken: {
      type: DataTypes.STRING,
    },
    /*    fullName: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.userName} ${this.name}`;
      },
      set() {
        throw new Error(
          "No intentes colocar un valor a una propiedad virtual (fullName)"
        );
      },
    }, */
  },
  {
    sequelize,
    modelName: "User",
  }
);

User.beforeCreate(async (user) => {
  try {
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
  } catch (error) {
    debug(error);
  }
});

// TODO: Para crear el método que retorne si la contraseña hace match se utiliza User.prototype, así comoe está ababo

User.prototype.toJSON = function () {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...user } = this.get();
  return user;
};

export { User };
