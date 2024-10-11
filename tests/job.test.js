const request = require("supertest");
const Contract = require("../src/models/Contract");
const Profile = require("../src/models/Profile");
const Job = require("../src/models/Job");
const sequelize = require("../src/config/databaseConfig");
const app = require("../app");

describe("creating a job", () => {
  let clientId;
  let contractorId;
  let contractId;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    const client = await Profile.create({
      name: "Mary Doe",
      type: "CLIENT",
    });
    clientId = client.id;

    const contractor = await Profile.create({
      name: "John Doe",
      type: "CONTRACTOR",
      profession: "Chef",
    });
    contractorId = contractor.id;

    const contract = await Contract.create({
      ClientId: clientId,
      ContractorId: contractorId,
      contractName: "Cooking for a wedding",
      status: "NEW",
    });

    contractId = contract.id;
  });

  it("should create a job inside a contract", async () => {
    const res = await request(app)
      .post("/create-job")
      .set("profile_id", clientId)
      .send({
        contractId: contractId,
        jobDescription: "cooking an italian dish",
        jobPrice: 5000,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.jobDescription).toBe("cooking an italian dish");
    expect(res.body.jobPrice).toBe(5000);

    const updatedContract = await Contract.findByPk(contractId);
    expect(updatedContract.status).toBe("IN_PROGRESS");
  });
});

describe("paying for a job", () => {
  let clientId;
  let contractorId;
  let contractId;
  let jobId;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    const client = await Profile.create({
      name: "Mary Doe",
      type: "CLIENT",
      balance: 5000,
    });
    clientId = client.id;

    const contractor = await Profile.create({
      name: "John Doe",
      type: "CONTRACTOR",
      profession: "Chef",
      balance: 0,
    });
    contractorId = contractor.id;

    const contract = await Contract.create({
      ClientId: clientId,
      ContractorId: contractorId,
      contractName: "Cooking for a wedding",
      status: "NEW",
    });
    contractId = contract.id;

    const job = await Job.create({
      ContractId: contractId,
      jobDescription: "cooking an italian dish",
      jobPrice: 5000,
      paymentDate: null,
      paid: false,
    });
    jobId = job.id;
  });

  it("should test if payment for a job was successful", async () => {
    const res = await request(app)
      .post(`/jobs/${jobId}/pay`)
      .set("profile_id", clientId);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Payment successful");

    const client = await Profile.findByPk(clientId);
    expect(parseFloat(client.balance)).toBe(0);

    const contractor = await Profile.findByPk(contractorId);
    expect(parseFloat(contractor.balance)).toBe(5000);

    const contract = await Contract.findByPk(contractId);
    expect(contract.status).toBe("TERMINATED");

    const job = await Job.findByPk(jobId);
    expect(job.paid).toBe(true);
    expect(job.paymentDate).not.toBeNull();
  });

  it("should return 400 if a non-client tries to pay for the job", async () => {
    const res = await request(app)
      .post(`/jobs/${jobId}/pay`)
      .set("profile_id", contractorId);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Only Clients are allowed to pay");
  });

  it("should return 400 if client has insufficient balance", async () => {
    const client = await Profile.findByPk(clientId);
    client.balance = 3000;
    await client.save();

    const res = await request(app)
      .post(`/jobs/${jobId}/pay`)
      .set("profile_id", clientId);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Insufficient balance");
  });
});

describe("gettinh all unpaid jobs that are in progress", () => {
  let clientId;
  let contractorId;
  let contractId;
  let contractId2;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    const client = await Profile.create({
      name: "Mary Doe",
      type: "CLIENT",
      balance: 5000,
    });
    clientId = client.id;

    const contractor = await Profile.create({
      name: "John Doe",
      type: "CONTRACTOR",
      profession: "Chef",
      balance: 0,
    });
    contractorId = contractor.id;

    const contract = await Contract.create({
      ClientId: clientId,
      ContractorId: contractorId,
      contractName: "Cooking for a wedding",
      status: "IN_PROGRESS",
    });
    contractId = contract.id;

    const contract2 = await Contract.create({
      ClientId: clientId,
      ContractorId: contractorId,
      contractName: "Cooking for a wedding",
      status: "TERMINATED",
    });
    contractId2 = contract2.id;

    await Job.create({
      ContractId: contractId2,
      jobDescription: "cooking a Nigerian dish",
      jobPrice: 5000,
      paymentDate: null,
      paid: false,
    });

    await Job.create({
      ContractId: contractId2,
      jobDescription: "cooking an american dish",
      jobPrice: 5000,
      paymentDate: null,
      paid: true,
    });

    await Job.create({
      ContractId: contractId,
      jobDescription: "cooking an italian dish",
      jobPrice: 5000,
      paymentDate: null,
      paid: false,
    });

    await Job.create({
      ContractId: contractId,
      jobDescription: "cooking a spanish dish",
      jobPrice: 5000,
      paymentDate: null,
      paid: false,
    });
  });

  it("should get all unpaid jobs in a contract in progress", async () => {
    const res = await request(app)
      .get("/jobs/unpaid")
      .set("profile_id", clientId);

    expect(res.statusCode).toBe(200);

    expect(res.body.length).toBe(2);

    const jobDescriptions = res.body.map((job) => job.jobDescription);

    expect(jobDescriptions).toContain("cooking an italian dish");
    expect(jobDescriptions).toContain("cooking a spanish dish");

    expect(jobDescriptions).not.toContain("cooking a Nigerian dish");
    expect(jobDescriptions).not.toContain("cooking an american dish");
  });
});
