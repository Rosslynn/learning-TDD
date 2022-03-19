import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../database/connection";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare userName: string;
  declare email: string;
  declare password: string;
  /*   declare fullName: CreationOptional<string>; */
}

User.init(
  {
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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
  { sequelize, modelName: "User" }
);

export { User };
