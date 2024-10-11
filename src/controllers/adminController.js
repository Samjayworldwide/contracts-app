const Job = require("../models/Job");
const sequelize = require("../config/databaseConfig");
const Contract = require("../models/Contract");
const Profile = require("../models/Profile");
const { Op } = require("sequelize");

const getBestProfession = async (request, response) => {
  const { startDate, endDate } = request.query;

  if (!startDate || !endDate)
    return response
      .status(400)
      .json({ message: "Please provide start and end dates" });

  try {
    const bestProfession = await Job.findAll({
      attributes: [
        [sequelize.fn("sum", sequelize.col("jobPrice")), "total_earned"],
        [sequelize.col("Contract.Contractor.profession"), "profession"],
      ],
      include: {
        model: Contract,
        include: {
          model: Profile,
          as: "Contractor",
          attributes: ["profession"],
          where: { type: "CONTRACTOR" },
        },
      },
      where: {
        paid: 1,
        paymentDate: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      },
      group: [
        "Contract.Contractor.profession",
        "Contract.id",
        "Contract.contractName",
        "Contract.status",
        "Contract.ClientId",
        "Contract.ContractorId",
      ],
      order: [[sequelize.fn("sum", sequelize.col("jobPrice")), "DESC"]],
      limit: 1,
    });

    if (!bestProfession.length)
      return response
        .status(404)
        .json({ message: "No professions found in the given range" });

    response.json(bestProfession);
  } catch (error) {
    console.error("Error fetching best profession:", error);
    return response.status(500).json({ message: "Internal server error" });
  }
};

const getBestClients = async (request, response) => {
  const { startDate, endDate, limit = 2 } = request.query;

  if (!startDate || !endDate)
    return response
      .status(400)
      .json({ message: "Please provide start and end dates" });

  const bestClients = await Job.findAll({
    attributes: [
      [sequelize.fn("sum", sequelize.col("jobPrice")), "total_paid"],
      [sequelize.col("Contract.Client.id"), "clientId"],
      [sequelize.col("Contract.Client.name"), "clientName"],
      [sequelize.col("Contract.id"), "contractId"],
      [sequelize.col("Contract.contractName"), "contractName"],
      [sequelize.col("Contract.status"), "contractStatus"],
    ],
    include: {
      model: Contract,
      include: {
        model: Profile,
        as: "Client",
        attributes: [],
      },
    },
    where: {
      paid: true,
      paymentDate: {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      },
    },
    group: [
      "Contract.Client.id",
      "Contract.id",
      "Contract.contractName",
      "Contract.status",
    ],
    order: [[sequelize.fn("sum", sequelize.col("jobPrice")), "DESC"]],
    limit: parseInt(limit, 10),
  });

  if (!bestClients.length)
    return response
      .status(404)
      .json({ message: "No clients found in the given range" });

  response.json(bestClients);
};

module.exports = {
  getBestClients,
  getBestProfession,
};
