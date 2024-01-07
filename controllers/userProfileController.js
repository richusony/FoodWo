const { userModel } = require("../models/userSchema");

async function viewEditProfilePage(req, res) {
  const userId = req.session.user._id;
  const userExists = await userModel.findOne({ _id: userId });

  if (userExists) {
    res.render("../views/editProfile.ejs", { user: userExists });
  }else{
    res.render("../views/pageNotFound.ejs");
  }
}

module.exports = {
  viewEditProfilePage,
};
