"use strict";

exports = module.exports = function (app, mongoose) {
  let OrderSchema = new mongoose.Schema(
    {
      orderTotal: {
        type: Number,
        required: true,
      },
      deliveryAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Addresses",
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      status: {
        type: String,
        default: "NEW",
        required: true,
        enum: ["CANCELLED", "NEW", "PROCESSING", "DISPATCHED", "COMPLETED"],
      },
      productData: {
        type: [
          {
            product: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Products",
            },
            quantity: {
              type: Number,
            },
          },
        ],
        default: [],
      },
    },
    {
      timestamps: {
        createdAt: "createdAt",
        updatedAt: "updatedAt",
      },
    }
  );

  app.db.model("Orders", OrderSchema);
};
