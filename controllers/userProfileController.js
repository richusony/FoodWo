const { userModel } = require("../models/userSchema");

async function viewEditProfilePage(req, res) {
  const userId = req.session.user._id;
  const userExists = await userModel.findOne({ _id: userId });

  if (userExists) {
    res.render("../views/editProfile.ejs", { user: userExists });
  } else {
    res.render("../views/pageNotFound.ejs");
  }
}

async function updateUserDetails(req, res) {
  const profileImage = req.file?.path;
  const { fullName, email, phone } = req.body;
  const userId = req.session.user._id;

  console.log(profileImage,req.body);

  if (!profileImage) {
    const updateUser = await userModel.updateOne(
      { _id: userId },
      { fullname: fullName, email: email, phone: phone }
    );
    if (updateUser) {
      res.status(200).json({ success: "Profile Updated" });
    } else {
      res.status(400).json({ err: "something went wrong" });
    }
  } else {
    const updateUser = await userModel.updateOne(
      { _id: userId },
      { fullname: fullName, email: email, phone: phone, image: profileImage }
    );
    if (updateUser) {
      res.status(200).json({ success: "Profile Updated" });
    } else {
      res.status(400).json({ err: "something went wrong" });
    }
  }
}

module.exports = {
  viewEditProfilePage,
  updateUserDetails,
};
