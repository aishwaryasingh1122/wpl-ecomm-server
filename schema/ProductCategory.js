"use strict";

exports = module.exports = function (app, mongoose) {
  let ProductCategoriesSchema = new mongoose.Schema(
    {
      title: {
        type: String,
        unique: true,
      },
      isDeleted: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: {
        createdAt: "createdAt",
        updatedAt: "updatedAt",
      },
    }
  );

  app.db.model("ProductCategories", ProductCategoriesSchema);
};
