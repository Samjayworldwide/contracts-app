const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.MY_SQL_DATABASE_URL, {
  host: "localhost",
  dialect: "mysql",
});

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection to the database was successful.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  await sequelize.sync({ force: false });
  console.log("All models were synchronized successfully.");
};

connectToDatabase();

module.exports = sequelize;
