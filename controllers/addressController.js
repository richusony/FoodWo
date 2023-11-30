const { addressModel } = require("../models/addressSchema");
const { userModel } = require("../models/userSchema");

async function viewNewAddressPage(req, res) {
  res.render("../views/addAddress.ejs");
}

module.exports = {
  viewNewAddressPage,
};
