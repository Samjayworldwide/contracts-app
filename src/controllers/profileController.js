const Profile  = require("../models/Profile");

const createProfile = async (request, response) => {
  try {
    const { name, type, profession } = request.body;

    if (!name || !type) {
      return response
        .status(400)
        .json({ message: "Name and type are required" });
    }

    if (type !== "CLIENT" && type !== "CONTRACTOR") {
      return response.status(400).json({ message: "Invalid profile type" });
    }

    if (type === "CONTRACTOR" && !profession) {
      return response
        .status(400)
        .json({ message: "Contractors must have a profession" });
    }

    const newProfile = await Profile.create({
      name,
      type,
      profession: type === "CONTRACTOR" ? profession : null,
    });

    return response.status(201).json(newProfile);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createProfile,
};
