const Job = require("../models/Job");
const Contract = require("../models/Contract");
const Profile = require("../models/Profile");
const sequelize = require("../config/databaseConfig");
const { Op } = require("sequelize");

const createJob = async (request, response) => {
  try {
    const { contractId, jobDescription, jobPrice } = request.body;

    if (!contractId || !jobDescription || !jobPrice) {
      return response.status(400).json({
        message: "Contract ID, job description, and job price are required",
      });
    }

    const contract = await Contract.findByPk(contractId);
    if (!contract) {
      return response.status(404).json({ message: "Contract not found" });
    }

    const id = request.user.id;

    if (id !== contract.ClientId) {
      return response
        .status(404)
        .json({ message: "Only a client can create a job" });
    }

    const newJob = await Job.create({
      ContractId: contractId,
      jobDescription,
      jobPrice,
      paid: false,
    });

    await sequelize.transaction(async (t) => {
      contract.status = "IN_PROGRESS";

      await contract.save({ transaction: t });
    });

    return response.status(201).json(newJob);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: "Server error" });
  }
};

const getUnpaidJobs = async (request, response) => {
  const unpaidJobs = await Job.findAll({
    where: { paid: false },
    include: [
      {
        model: Contract,
        where: {
          [Op.or]: [
            { ClientId: request.user.id },
            { ContractorId: request.user.id },
          ],
          status: "IN_PROGRESS",
        },
      },
    ],
  });
  response.json(unpaidJobs);
};

const payForJob = async (request, response) => {
  const { job_id } = request.params;
  const job = await Job.findOne({ where: { id: job_id }, include: Contract });

  const profile = await Profile.findByPk(request.user.id);

  if (profile.type !== "CLIENT")
    return response
      .status(400)
      .json({ message: "Only Clients are allowed to pay" });

  if (request.user.id !== job.Contract.ClientId)
    return response
      .status(400)
      .json({ message: "Unauthorized client paying for a job" });

  const client = await Profile.findByPk(job.Contract.ClientId);
  const contractor = await Profile.findByPk(job.Contract.ContractorId);
  const contract = await Contract.findByPk(job.Contract.id);

  if (!client || !contractor) {
    return response
      .status(404)
      .json({ message: "Client or Contractor not found" });
  }

  if (!job.jobPrice || isNaN(job.jobPrice)) {
    return response.status(400).json({ message: "Invalid job price" });
  }

  const jobPrice = parseFloat(job.jobPrice);
  const clientBalance = parseFloat(client.balance);
  const contractorBalance = parseFloat(contractor.balance);

  if (clientBalance < jobPrice) {
    return response.status(400).json({ message: "Insufficient balance" });
  }

  await sequelize.transaction(async (t) => {
    client.balance = (clientBalance - jobPrice).toFixed(2);
    contractor.balance = (contractorBalance + jobPrice).toFixed(2);
    contract.status = "TERMINATED";
    job.paid = true;
    job.paymentDate = new Date();

    await client.save({ transaction: t });
    await contract.save({ transaction: t });
    await contractor.save({ transaction: t });
    await job.save({ transaction: t });
  });

  response.json({ message: "Payment successful" });
};

module.exports = {
  createJob,
  payForJob,
  getUnpaidJobs,
};
