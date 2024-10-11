const { DataTypes } = require("sequelize");
const sequelize = require("../config/databaseConfig");

const Profile = sequelize.define(
  "Profile",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    type: {
      type: DataTypes.ENUM("CLIENT", "CONTRACTOR"),
      allowNull: false,
    },
    profession: { type: DataTypes.STRING },
  },
  { timestamps: false }
);

module.exports = Profile;
