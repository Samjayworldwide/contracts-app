const request = require("supertest");
const Contract = require("../src/models/Contract");
const Profile = require("../src/models/Profile");
const Job = require("../src/models/Job");
const sequelize = require("../src/config/databaseConfig");
const app = require("../app");

describe("getting the best profession", () => {
  let clientId;
  let clientId2;
  let contractorId;
  let contractorId2;
  let contractId;
  let contractId2;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    const client = await Profile.create({
      name: "Mary Doe",
      type: "CLIENT",
      balance: 2000,
    });
    clientId = client.id;

    const client2 = await Profile.create({
      name: "Max Doe",
      type: "CLIENT",
      balance: 4000,
    });
    clientId2 = client2.id;

    const contractor = await Profile.create({
      name: "John Doe",
      type: "CONTRACTOR",
      profession: "Chef",
      balance: 10000,
    });
    contractorId = contractor.id;

    const contractor2 = await Profile.create({
      name: "John Mel",
      type: "CONTRACTOR",
      profession: "Software developer",
      balance: 16000,
    });
    contractorId2 = contractor2.id;

    const contract = await Contract.create({
      ClientId: clientId,
      ContractorId: contractorId,
      contractName: "Cooking for a wedding",
      status: "TERMINATED",
    });
    contractId = contract.id;

    const contract2 = await Contract.create({
      ClientId: clientId2,
      ContractorId: contractorId2,
      contractName: "Building a web application",
      status: "TERMINATED",
    });
    contractId2 = contract2.id;

    await Job.create({
      ContractId: contractId,
      jobDescription: "cooking a Nigerian dish",
      jobPrice: 5000,
      paymentDate: "2024-10-07 00:00:00",
      paid: true,
    });

    await Job.create({
      ContractId: contractId,
      jobDescription: "cooking an american dish",
      jobPrice: 5000,
      paymentDate: "2024-10-07 00:00:00",
      paid: true,
    });

    await Job.create({
      ContractId: contractId2,
      jobDescription: "Building an e-commerce store",
      jobPrice: 8000,
      paymentDate: "2024-10-07 00:00:00",
      paid: true,
    });

    await Job.create({
      ContractId: contractId2,
      jobDescription: "building a logistics website",
      jobPrice: 8000,
      paymentDate: "2024-10-07 00:00:00",
      paid: true,
    });
  });

  it("should return the profession that was paid the most", async () => {
    const startDate = "2024-10-06 00:00:00";
    const endDate = "2024-10-08 00:00:00";
    const res = await request(app).get(
      `/admin/best-profession?startDate=${encodeURIComponent(
        startDate
      )}&endDate=${encodeURIComponent(endDate)}`
    );

    expect(res.statusCode).toBe(200);

    expect(res.body.length).toBe(1);
    expect(res.body[0].profession).toBe("Software developer");
    expect(res.body[0].total_earned).toBe("16000.00");
  });
});

describe("getting the best clients", () => {
  let clientId;
  let clientId2;
  let contractorId;
  let contractorId2;
  let contractId;
  let contractId2;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    const client = await Profile.create({
      name: "Mary Doe",
      type: "CLIENT",
      balance: 2000,
    });
    clientId = client.id;

    const client2 = await Profile.create({
      name: "Max Doe",
      type: "CLIENT",
      balance: 4000,
    });
    clientId2 = client2.id;

    const contractor = await Profile.create({
      name: "John Doe",
      type: "CONTRACTOR",
      profession: "Chef",
      balance: 10000,
    });
    contractorId = contractor.id;

    const contractor2 = await Profile.create({
      name: "John Mel",
      type: "CONTRACTOR",
      profession: "Software developer",
      balance: 16000,
    });
    contractorId2 = contractor2.id;

    const contract = await Contract.create({
      ClientId: clientId,
      ContractorId: contractorId,
      contractName: "Cooking for a wedding",
      status: "TERMINATED",
    });
    contractId = contract.id;

    const contract2 = await Contract.create({
      ClientId: clientId2,
      ContractorId: contractorId2,
      contractName: "Building a web application",
      status: "TERMINATED",
    });
    contractId2 = contract2.id;

    await Job.create({
      ContractId: contractId,
      jobDescription: "cooking a Nigerian dish",
      jobPrice: 5000,
      paymentDate: "2024-10-06 00:00:00",
      paid: true,
    });

    await Job.create({
      ContractId: contractId,
      jobDescription: "cooking an american dish",
      jobPrice: 5000,
      paymentDate: "2024-10-07 00:00:00",
      paid: true,
    });

    await Job.create({
      ContractId: contractId2,
      jobDescription: "Building an e-commerce store",
      jobPrice: 8000,
      paymentDate: "2024-10-07 00:00:00",
      paid: true,
    });

    await Job.create({
      ContractId: contractId2,
      jobDescription: "building a logistics website",
      jobPrice: 8000,
      paymentDate: "2024-10-07 00:00:00",
      paid: true,
    });
  });

  it("should return the profession that was paid the most", async () => {
    const startDate = "2024-10-06 00:00:00";
    const endDate = "2024-10-08 00:00:00";
    const limit = 2;
    const res = await request(app).get(
      `/admin/best-clients?startDate=${encodeURIComponent(
        startDate
      )}&endDate=${encodeURIComponent(endDate)}&limit=${limit}`
    );

    expect(res.statusCode).toBe(200);

    expect(res.body.length).toBe(2);

    expect(res.body[0]).toHaveProperty('total_paid');
    expect(res.body[0]).toHaveProperty('clientId');
    expect(res.body[0]).toHaveProperty('clientName');
  });
});
