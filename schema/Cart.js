"use strict";

exports = module.exports = function (app, mongoose) {
  let CartSchema = new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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

  app.db.model("Carts", CartSchema);
};
