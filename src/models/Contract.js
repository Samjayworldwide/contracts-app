const { DataTypes } = require("sequelize");
const sequelize = require("../config/databaseConfig");
const Profile = require("./Profile");

const Contract = sequelize.define(
  "Contract",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    contractName: { type: DataTypes.STRING, allowNull: false },
    status: {
      type: DataTypes.ENUM("NEW", "IN_PROGRESS", "TERMINATED"),
      allowNull: false,
    },
  },
  { timestamps: false }
);

Contract.belongsTo(Profile, { as: "Client", foreignKey: "ClientId" });
Contract.belongsTo(Profile, { as: "Contractor", foreignKey: "ContractorId" });

module.exports = Contract;
