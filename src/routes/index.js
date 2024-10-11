const express = require("express");
const {
  createContract,
  getContract,
  getContracts,
} = require("../controllers/contractController");
const {
  createJob,
  getUnpaidJobs,
  payForJob,
} = require("../controllers/jobController");
const { depositBalance } = require("../controllers/balanceController");
const {
  getBestClients,
  getBestProfession,
} = require("../controllers/adminController");
const { createProfile } = require("../controllers/profileController");
const getProfile = require("../middleware/getProfile");

const router = express.Router();

router.post("/create-profile", createProfile);
router.post("/create-contract", getProfile, createContract);
router.post("/create-job", getProfile, createJob);
router.get("/contracts/:id", getProfile, getContract);
router.get("/contracts", getProfile, getContracts);
router.get("/jobs/unpaid", getProfile, getUnpaidJobs);
router.get("/admin/best-profession", getBestProfession);
router.get("/admin/best-clients", getBestClients);
router.post("/jobs/:job_id/pay", getProfile, payForJob);
router.post("/balances/deposit/:userId", getProfile, depositBalance);

module.exports = router;
