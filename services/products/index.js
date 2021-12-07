const fileUploadUtils = require("../../utils/file-storage");

exports = module.exports = {
  getProductById: (req, res) => {
    const productId = req.params.productId;
    req.app.db.models.Products.findOne({ _id: productId })
      .populate({ path: "category", select: "title" })
      .exec((err, product) => {
        if (err) {
          return res.status(400).json({
            msg: "Failed to get product details. Try again",
          });
        }

        return res.status(200).json(product);
      });
  },
  addProduct: (req, res) => {
    let workflow = req.app.utility.workflow(req, res);
    workflow.on("validateData", () => {
      if (!req.body.name || req.body.name === "") {
        return res.status(400).json({
          msg: "Product name is required.",
        });
      }

      if (!req.body.weight) {
        return res.status(400).json({
          msg: "Product weight is required.",
        });
      }

      if (!req.body.unit || req.body.unit === "") {
        return res.status(400).json({
          msg: "Unit is required.",
        });
      }

      if (!req.body.rate) {
        return res.status(400).json({
          msg: "Product rate is required.",
        });
      }

      if (!req.body.category || req.body.category === "") {
        return res.status(400).json({
          msg: "Category is required.",
        });
      }

      if (
        !req.body.imgData ||
        req.body.imgData == "" ||
        !req.body.fileName ||
        req.body.fileName == ""
      ) {
        return res.status(400).json({
          msg: "Product image is required.",
        });
      }

      if (!req.body.quantity) {
        return res.status(400).json({
          msg: "Product quantity is required.",
        });
      }

      if (!req.body.bufferQuantity) {
        return res.status(400).json({
          msg: "Buffer quantity is required.",
        });
      }

      workflow.emit("addImageToBucket", req.body);
    });

    workflow.on("addImageToBucket", async (productData) => {
      try {
        const uploadData = await fileUploadUtils.uploadProductImage(
          productData.imgData,
          productData.fileName
        );

        productData.imageURL = uploadData[0].metadata.mediaLink;

        delete productData.imgData;

        workflow.emit("addProductToDB", productData);
      } catch (e) {
        console.log("Image upload err", e);
        return res.status(400).json({
          msg: "Failed to upload product image. Try again!",
        });
      }
    });

    workflow.on("addProductToDB", (productData) => {
      req.app.db.models.Products.create(productData, (err, newProduct) => {
        if (err) {
          return res.status(400).json({
            msg: "Failed to add product. Try again",
          });
        }

        res.status(200).json(newProduct);
        fileUploadUtils.removeTempFile(productData.fileName);
      });
    });

    workflow.emit("validateData");
  },
  getProducts: (req, res) => {
    req.app.db.models.Products.find({})
      .populate({ path: "category", select: "title" })
      .exec((err, products) => {
        if (err) {
          return res.status(400).json({
            msg: "Failed to get products. Try again",
          });
        }

        return res.status(200).json(products);
      });
  },
  toggleProductAvailability: (req, res) => {
    const productId = req.params.productId;
    req.app.db.models.Products.findOne({ _id: productId }).exec(
      (err, product) => {
        if (err) {
          return res.status(400).json({
            msg: "Failed to update product. Try again!",
          });
        }

        if (!product) {
          return res.status(400).json({
            msg: "Product Id invalid.",
          });
        }

        product.isDeleted = !product.isDeleted;
        product.save((error, updatedProduct) => {
          if (error) {
            return res.status(400).json({
              msg: "Failed to update product.",
            });
          }

          if (!updatedProduct) {
            return res.status(400).json({
              msg: "Failed to update product. Try again!",
            });
          }

          res.status(200).json();
        });
      }
    );
  },
  updateQuantity: (req, res) => {
    const productId = req.params.productId;
    const paramsToUpdate = {};

    if (req.body.quantity) {
      paramsToUpdate.quantity = req.body.quantity;
    }

    if (req.body.bufferQuantity) {
      paramsToUpdate.bufferQuantity = req.body.bufferQuantity;
    }

    req.app.db.models.Products.updateOne(
      { _id: productId },
      { $set: paramsToUpdate },
      { new: true }
    ).exec((err, updatedProduct) => {
      if (err) {
        return res.status(400).json({
          msg: "Failed to update product.",
        });
      }

      if (!updatedProduct) {
        return res.status(400).json({
          msg: "Failed to update product. Try again!",
        });
      }

      res.status(200).json();
    });
  },
  editProduct: (req, res) => {
    let workflow = req.app.utility.workflow(req, res);
    workflow.on("validateData", () => {
      if (!req.body._id || req.body._id === "") {
        return res.status(400).json({
          msg: "Product Id is required.",
        });
      }

      if (!req.body.name || req.body.name === "") {
        return res.status(400).json({
          msg: "Product name is required.",
        });
      }

      if (!req.body.weight) {
        return res.status(400).json({
          msg: "Product weight is required.",
        });
      }

      if (!req.body.unit || req.body.unit === "") {
        return res.status(400).json({
          msg: "Unit is required.",
        });
      }

      if (!req.body.rate) {
        return res.status(400).json({
          msg: "Product rate is required.",
        });
      }

      if (!req.body.category || req.body.category === "") {
        return res.status(400).json({
          msg: "Category is required.",
        });
      }

      if (
        !req.body.imageURL &&
        (!req.body.imgData ||
          req.body.imgData == "" ||
          !req.body.fileName ||
          req.body.fileName == "")
      ) {
        return res.status(400).json({
          msg: "Product image is required.",
        });
      }

      if (!req.body.quantity) {
        return res.status(400).json({
          msg: "Product quantity is required.",
        });
      }

      if (!req.body.bufferQuantity) {
        return res.status(400).json({
          msg: "Buffer quantity is required.",
        });
      }

      if (req.body.imgData && req.body.imgData.trim()) {
        workflow.emit("addImageToBucket", req.body);
      } else {
        workflow.emit("updateProductInDB", req.body);
      }
    });

    workflow.on("addImageToBucket", async (productData) => {
      try {
        const uploadData = await fileUploadUtils.uploadProductImage(
          productData.imgData,
          productData.fileName
        );

        productData.imageURL = uploadData[0].metadata.mediaLink;

        delete productData.imgData;

        workflow.emit("updateProductInDB", productData);
      } catch (e) {
        console.log("Image upload err", e);
        return res.status(400).json({
          msg: "Failed to upload product image. Try again!",
        });
      }
    });

    workflow.on("updateProductInDB", (productData) => {
      const productId = productData._id;
      delete productData._id;
      req.app.db.models.Products.updateOne(
        { _id: productId },
        { $set: { productData } },
        (err) => {
          if (err) {
            return res.status(400).json({
              msg: "Failed to update product.",
            });
          }

          res.status(200).json();
        }
      );
    });

    workflow.emit("validateData");
  },
};
