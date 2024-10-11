const Contract = require("../models/Contract");
const Profile = require("../models/Profile");
const { Op } = require("sequelize");

const createContract = async (request, response) => {
  try {
    const { clientId, contractorId, contractName } = request.body;

    const id = request.user.id;


    if (!clientId || !contractorId || !contractName) {
      return response.status(400).json({
        message: "Client ID, Contractor ID, and contractName are required",
      });
    }

    if (id !== clientId && id !== contractorId) {
      return response.status(400).json({
        message: "invalid profile id",
      });
    }

    const client = await Profile.findByPk(clientId);
    const contractor = await Profile.findByPk(contractorId);

    if (!client || client.type !== "CLIENT") {
      return response
        .status(404)
        .json({ message: "Client not found or invalid profile type" });
    }

    if (!contractor || contractor.type !== "CONTRACTOR") {
      return response
        .status(404)
        .json({ message: "Contractor not found or invalid profile type" });
    }

    const newContract = await Contract.create({
      ClientId: clientId,
      ContractorId: contractorId,
      status: "NEW",
      contractName,
    });

    return response.status(201).json(newContract);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: "Server error" });
  }
};

const getContract = async (request, response) => {
  const { id } = request.params;

  try {
    const contract = await Contract.findOne({
      where: {
        id,
        [Op.or]: [
          { ClientId: request.user.id },
          { ContractorId: request.user.id },
        ],
      },
    });

    if (!contract) {
      return response.status(404).json({ message: "Contract not found" });
    }

    response.json(contract);
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Server error" });
  }
};

const getContracts = async (request, response) => {
  const contracts = await Contract.findAll({
    where: {
      [Op.or]: [
        { ClientId: request.user.id },
        { ContractorId: request.user.id },
      ],
      status: { [Op.not]: "TERMINATED" },
    },
  });
  response.json(contracts);
};

module.exports = {
  createContract,
  getContract,
  getContracts,
};
