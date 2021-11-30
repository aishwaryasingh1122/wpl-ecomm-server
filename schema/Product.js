"use strict";

exports = module.exports = function (app, mongoose) {
  let ProductSchema = new mongoose.Schema(
    {
      name: {
        type: String,
      },
      weight: {
        type: Number,
      },
      unit: {
        type: String,
      },
      rate: {
        type: Number,
      },
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductCategories",
      },
      imageURL: {
        type: String,
      },
      quantity: {
        type: Number,
      },
      bufferQuantity: {
        type: Number,
      },
    },
    {
      timestamps: {
        createdAt: "createdAt",
        updatedAt: "updatedAt",
      },
    }
  );

  app.db.model("Products", ProductSchema);
};
