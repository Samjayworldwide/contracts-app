const Profile = require("../models/Profile");
const Job = require("../models/Job");
const Contract = require("../models/Contract");

const depositBalance = async (request, response) => {
  const { userId } = request.params;
  const { amount } = request.body;

  const client = await Profile.findByPk(userId);

  if (!client) {
    return response.status(400).json({ message: "Client not found" });
  }

  if (client.type !== "CLIENT")
    return response.status(400).json({ message: "Only clients can deposit" });

  const totalJobs = await Job.sum("jobPrice", {
    include: [
      {
        model: Contract,
        where: { ClientId: userId },
        attributes: [],
      },
    ],
    where: { paid: false },
  });

  if (amount > totalJobs * 0.25)
    return response
      .status(400)
      .json({ message: "Cannot deposit more than 25% of unpaid jobs" });

  client.balance = parseFloat(client.balance) + parseFloat(amount);
  await client.save();

  response.json({ message: "Deposit successful" });
};

module.exports = {
  depositBalance,
};
