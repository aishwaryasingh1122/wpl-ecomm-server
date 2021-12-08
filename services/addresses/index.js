exports = module.exports = {
  getAddressesForUser: (req, res) => {
    const userId = req.user._id;
    req.app.db.models.Addresses.find(
      { user: userId, isDeleted: false },
      (err, addresses) => {
        if (err) {
          return res.status(400).json({
            msg: "Failed to get addresses.",
          });
        }

        return res.status(200).json(addresses || []);
      }
    );
  },
  addNewAddressForUser: (req, res) => {
    let workflow = req.app.utility.workflow(req, res);
    workflow.on("validateData", () => {
      if (!req.body.name || !req.body.name.trim()) {
        return res.status(400).json({
          msg: "Name is required",
        });
      }

      if (!req.body.mobile || !req.body.mobile.trim()) {
        return res.status(400).json({
          msg: "Mobile is required",
        });
      }

      if (!req.body.addressLine1 || !req.body.addressLine1.trim()) {
        return res.status(400).json({
          msg: "Address Line 1 is required",
        });
      }

      if (!req.body.pincode || !req.body.pincode.trim()) {
        return res.status(400).json({
          msg: "Pincode is required",
        });
      }

      workflow.emit("saveAddress");
    });

    workflow.on("saveAddress", () => {
      const userId = req.user._id;
      const addressToAdd = req.body;
      addressToAdd["user"] = userId;
      req.app.db.models.Addresses.create(addressToAdd, (err, address) => {
        if (err || !address) {
          return res.status(400).json({
            msg: "Failed to add address.",
          });
        }

        return res.status(200).json(address);
      });
    });

    workflow.emit("validateData");
  },
  removeUserAddress: (req, res) => {
    const addressId = req.params.addressId;
    req.app.db.models.Addresses.updateOne(
      { _id: addressId },
      { $set: { isDeleted: true } },
      { new: true },
      (err, updatedAddress) => {
        if (err || !updatedAddress) {
          return res.status(400).json({
            msg: "Failed to remove address.",
          });
        }

        return res.status(200).json(updatedAddress);
      }
    );
  },
  editUserAddress: (req, res) => {
    const addressFieldsToUpdate = {};

    if (req.body.name) {
      addressFieldsToUpdate["name"] = req.body.name;
    }

    if (req.body.mobile) {
      addressFieldsToUpdate["mobile"] = req.body.mobile;
    }

    if (req.body.addressLine1) {
      addressFieldsToUpdate["addressLine1"] = req.body.addressLine1;
    }

    if (req.body.addressLine2) {
      addressFieldsToUpdate["addressLine2"] = req.body.addressLine2;
    }

    if (req.body.apartment) {
      addressFieldsToUpdate["apartment"] = req.body.apartment;
    }

    if (req.body.pincode) {
      addressFieldsToUpdate["pincode"] = req.body.pincode;
    }

    if (req.body.deliveryInstructions) {
      addressFieldsToUpdate["deliveryInstructions"] =
        req.body.deliveryInstructions;
    }

    console.log("Address to update", addressFieldsToUpdate);
    const addressId = req.params.addressId;
    req.app.db.models.Addresses.updateOne(
      { _id: addressId },
      addressFieldsToUpdate,
      (err, updatedAddress) => {
        if (err || !updatedAddress) {
          return res.status(400).json({
            msg: "Failed to update address.",
          });
        }

        res.status(200).json(updatedAddress);
      }
    );
  },
};
