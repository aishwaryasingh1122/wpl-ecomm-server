"use strict";

exports = module.exports = function (app, mongoose) {
  let AddresSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },
      mobile: {
        type: String,
        required: true,
      },
      addressLine1: {
        type: String,
        required: true,
      },
      addressLine2: {
        type: String,
      },
      apartment: {
        type: String,
      },
      pincode: {
        type: String,
        required: true,
      },
      deliveryInstructions: {
        type: String,
      },
      isDeleted: {
        type: Boolean,
        default: false,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    {
      timestamps: {
        createdAt: "createdAt",
        updatedAt: "updatedAt",
      },
    }
  );

  app.db.model("Addresses", AddresSchema);
};
