const request = require("supertest");
const Contract = require("../src/models/Contract");
const Profile = require("../src/models/Profile");
const sequelize = require("../src/config/databaseConfig");
const app = require("../app");

describe("Contract Creation", () => {
  let clientId;
  let contractorId;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    const client = await Profile.create({
      name: "John Doe",
      type: "CLIENT",
    });
    clientId = client.id;

    const contractor = await Profile.create({
      name: "John Doe",
      type: "CONTRACTOR",
      profession: "Chef",
    });
    contractorId = contractor.id;
  });

  it("should create a new contract", async () => {
    const res = await request(app)
      .post("/create-contract")
      .set("profile_id", 1)
      .send({
        clientId: clientId,
        contractorId: contractorId,
        contractName: "Cooking for a wedding",
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.contractName).toBe("Cooking for a wedding");

    const contractInDb = await Contract.findByPk(res.body.id);
    expect(contractInDb).not.toBeNull();
    expect(contractInDb.contractName).toBe("Cooking for a wedding");
  });

  it("should return 400 for missing required fields", async () => {
    const res = await request(app)
      .post("/create-contract")
      .set("profile_id", clientId)
      .send({});

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe(
      "Client ID, Contractor ID, and contractName are required"
    );
  });
});

describe("getting a contract", () => {
  let clientId;
  let contractorId;
  let contractId;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    const client = await Profile.create({
      name: "John Doe",
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

  it("should retrieve a contract by its id", async () => {
    const res = await request(app)
      .get(`/contracts/${contractId}`)
      .set("profile_id", clientId);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("id", contractId);
    expect(res.body.contractName).toBe("Cooking for a wedding");
  });

  it("should return 404 if the user is not authorized to access the contract", async () => {
    const unauthorizedUser = await Profile.create({
      name: "Unauthorized User",
      type: "CLIENT",
    });

    const res = await request(app)
      .get(`/contracts/${contractId}`)
      .set("profile_id", unauthorizedUser.id);

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toBe("Contract not found");
  });
});

describe("getting all contracts that are not terminated", () => {
  let clientId;
  let contractorId;
  let contractId;
  let contractId2;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    const client = await Profile.create({
      name: "John Doe",
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

    const contract2 = await Contract.create({
      ClientId: clientId,
      ContractorId: contractorId,
      contractName: "Cooking for a party",
      status: "IN_PROGRESS",
    });
    contractId2 = contract2.id;

    await Contract.create({
      ClientId: clientId,
      ContractorId: contractorId,
      contractName: "Terminated project",
      status: "TERMINATED",
    });
  });

  it("should retrieve all contracts for a user, excluding terminated ones", async () => {
    const res = await request(app)
      .get("/contracts")
      .set("profile_id", clientId);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(2);

    const contractNames = res.body.map((contract) => contract.contractName);
    expect(contractNames).toContain("Cooking for a wedding");
    expect(contractNames).toContain("Cooking for a party");
    expect(contractNames).not.toContain("Terminated project");
  });
});
