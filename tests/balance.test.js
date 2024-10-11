const request = require("supertest");
const Contract = require("../src/models/Contract");
const Profile = require("../src/models/Profile");
const Job = require("../src/models/Job");
const sequelize = require("../src/config/databaseConfig");
const app = require("../app");

describe("depositing to account", () => {
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

    await Job.create({
      ContractId: contractId,
      jobDescription: "cooking an italian dish",
      jobPrice: 5000,
      paymentDate: null,
      paid: false,
    });
  });

  it("should deposit the amount to the user balance", async () => {
    const depositAmount = 1000;
    const res = await request(app)
      .post(`/balances/deposit/${clientId}`)
      .set("profile_id", clientId)
      .send({ amount: depositAmount });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe("Deposit successful");

    const client = await Profile.findByPk(clientId);
    expect(parseFloat(client.balance)).toBe(depositAmount);
  });

  it("should return 400 if client not found", async () => {
    const nonExistentClientId = 9999;

    const res = await request(app)
      .post(`/balances/deposit/${nonExistentClientId}`)
      .send({ amount: 1000 })
      .set("profile_id", clientId);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe("Client not found");
  });

  it("should return 400 if a non-client tries to deposit", async () => {
    const depositAmount = 1000;

    const res = await request(app)
      .post(`/balances/deposit/${contractorId}`)
      .send({ amount: depositAmount })
      .set("profile_id", contractorId);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe("Only clients can deposit");
  });

  it("should return 400 if deposit exceeds 25% of unpaid jobs", async () => {
    const depositAmount = 2000;

    const res = await request(app)
      .post(`/balances/deposit/${clientId}`)
      .send({ amount: depositAmount })
      .set("profile_id", clientId);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe(
      "Cannot deposit more than 25% of unpaid jobs"
    );
  });
});
