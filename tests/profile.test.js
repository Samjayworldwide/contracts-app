const request = require("supertest");
const Profile = require("../src/models/Profile");
const sequelize = require("../src/config/databaseConfig");
const app = require("../app");

describe("Client Profile Creation", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); 
  });

  it("should create a new profile", async () => {
    const res = await request(app).post("/create-profile").send({
      name: "John Doe",
      type: "CLIENT",
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe("John Doe");

    const profileInDb = await Profile.findByPk(res.body.id);
    expect(profileInDb).not.toBeNull();
    expect(profileInDb.name).toBe("John Doe");
  });

  it("should return 400 for missing required fields", async () => {
    const res = await request(app).post("/create-profile").send({});

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe("Name and type are required");
  });
});

describe("Contractor Profile Creation", () => {
    beforeAll(async () => {
      await sequelize.sync({ force: true }); 
    });
  
    it("should create a new profile", async () => {
      const res = await request(app).post("/create-profile").send({
        name: "John Doe",
        type: "CONTRACTOR",
        profession: "Chef"
      });
  
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.name).toBe("John Doe");
  
      const profileInDb = await Profile.findByPk(res.body.id);
      expect(profileInDb).not.toBeNull();
      expect(profileInDb.name).toBe("John Doe");
    });
  
    it("should return 400 for missing required fields", async () => {
      const res = await request(app).post("/create-profile").send({});
  
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe("Name and type are required");
    });
  });
