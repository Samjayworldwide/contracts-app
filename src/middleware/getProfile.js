const Profile = require("../models/Profile");

const getProfile = async (request, response, next) => {
  const profileId = request.get("profile_id");
  if (!profileId)
    return response.status(401).json({ message: "Missing profile_id" });

  const profile = await Profile.findByPk(profileId);
  if (!profile)
    return response.status(404).json({ message: "Profile not found" });

  request.user = profile;
  next();
};

module.exports = getProfile;
