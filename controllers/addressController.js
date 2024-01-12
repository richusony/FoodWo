const { userModel } = require("../models/userSchema");
const { addressModel } = require("../models/addressSchema");
const { isKannur } = require("./pincodeController");

async function viewNewAddressPage(req, res) {
  res.render("../views/addAddress.ejs");
}

async function newAddress(req, res) {
  const { houseName, city, pincode, label } = req.body;
  const userId = req.session.user._id;
  const address = await addressModel.findOne({ userId: userId });

  const newAddressData = {
    userId: userId,
    city: city,
    pincode: pincode,
    label: label,
    country: "India",
    state: "Kerala",
    district: "Kannur",
  };

  if (!isKannur(parseInt(pincode))) {
    return res
      .status(404)
      .json({ err: "Service is not available on this pincode" });
  }

  if (!address) {
    await addressModel.create({
      userId: userId,
      address1: { ...newAddressData, houseName: houseName },
    });
    return res.status(200).json({ added: true });
  }

  if (!address.address1) {
    await addressModel.updateOne(
      { userId: userId },
      { address1: { ...newAddressData, houseName: houseName } }
    );
    return res.status(200).json({ added: true });
  }

  if (!address.address2) {
    await addressModel.updateOne(
      { userId: userId },
      { address2: { ...newAddressData, houseName: houseName } }
    );
    return res.status(200).json({ added: true });
  }

  if (!address.address3) {
    await addressModel.updateOne(
      { userId: userId },
      { address3: { ...newAddressData, houseName: houseName } }
    );
    return res.status(200).json({ added: true });
  }

  return res.status(404).json({ err: "Address limit exceeded" });
}

async function viewUpdateAddressPage(req, res) {
  const addressId = req.params.aid;
  const userId = req.session.user._id;

  const address = await addressModel.findOne({ userId: userId });

  // Find and delete the address based on its ID
  if (address.address1 && address.address1._id.toString() === addressId) {
    res.render("../views/editAddress.ejs", { address: address.address1 });
  } else if (
    address.address2 &&
    address.address2._id.toString() === addressId
  ) {
    res.render("../views/editAddress.ejs", { address: address.address2 });
  } else if (
    address.address3 &&
    address.address3._id.toString() === addressId
  ) {
    res.render("../views/editAddress.ejs", { address: address.address3 });
  } else {
    return res.status(404).json({ err: "Address not found" });
  }
}

async function updateAddress(req, res) {
  const addressId = req.params.aid;
  const userId = req.session.user._id;
  const { houseName, city, pincode, label } = req.body;

  const newAddressData = {
    userId: userId,
    city: city,
    pincode: pincode,
    label: label,
    country: "India",
    state: "Kerala",
    district: "Kannur",
  };

  if (!isKannur(parseInt(pincode))) {
    return res
      .status(404)
      .json({ err: "Service is not available on this pincode" });
  }

  try {
    const address = await addressModel.findOne({ userId: userId });

    if (!address) {
      return res.status(404).json({ err: "User address not found" });
    }

    // Find and delete the address based on its ID
    if (
      address.address1 &&
      address.address1._id.toString() === addressId
    ) {
      await addressModel.updateOne({ userId: userId }, {
        address1: { ...newAddressData, houseName: houseName }
      });
    } else if (
      address.address2 &&
      address.address2._id.toString() === addressId
    ) {
      await addressModel.updateOne(
        { userId: userId },
        { address2: { ...newAddressData, houseName: houseName } }
      );
    } else if (
      address.address3 &&
      address.address3._id.toString() === addressId
    ) {
      await addressModel.updateOne(
        { userId: userId },
        { address3: { ...newAddressData, houseName: houseName } }
      );
    } else {
      return res.status(404).json({ err: "Address not found" });
    }

    return res.status(200).json({ success: "Address updated" });
  } catch (error) {
    return res.status(500).json({ err: "Internal server error" });
  }
}

async function deleteAddress(req, res) {
  const userId = req.session.user._id;
  const addressIdToDelete = req.params.addressId; // Assuming you get the address ID from the request params

  try {
    const address = await addressModel.findOne({ userId: userId });

    if (!address) {
      return res.status(404).json({ err: "User address not found" });
    }

    // Find and delete the address based on its ID
    if (
      address.address1 &&
      address.address1._id.toString() === addressIdToDelete
    ) {
      await addressModel.updateOne(
        { userId: userId },
        { $unset: { address1: 1 } }
      );
    } else if (
      address.address2 &&
      address.address2._id.toString() === addressIdToDelete
    ) {
      await addressModel.updateOne(
        { userId: userId },
        { $unset: { address2: 1 } }
      );
    } else if (
      address.address3 &&
      address.address3._id.toString() === addressIdToDelete
    ) {
      await addressModel.updateOne(
        { userId: userId },
        { $unset: { address3: 1 } }
      );
    } else {
      return res.status(404).json({ err: "Address not found" });
    }

    return res.status(200).json({ deleted: true });
  } catch (error) {
    return res.status(500).json({ err: "Internal server error" });
  }
}

module.exports = {
  viewNewAddressPage,
  newAddress,
  viewUpdateAddressPage,
  updateAddress,
  deleteAddress,
};
