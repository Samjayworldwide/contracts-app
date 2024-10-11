const { DataTypes } = require("sequelize");
const sequelize = require("../config/databaseConfig");
const Contract = require("./Contract");

const Job = sequelize.define(
  "Job",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    jobDescription: { type: DataTypes.STRING, allowNull: false },
    jobPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    paid: { type: DataTypes.BOOLEAN, defaultValue: false },
    paymentDate: { type: DataTypes.DATE },
  },
  { timestamps: false }
);

Job.belongsTo(Contract);

module.exports = Job;
