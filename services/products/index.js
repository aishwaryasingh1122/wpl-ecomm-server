const tempImagesDir = "temp";
const stream = require("stream"),
  fs = require("fs"),
  firebaseAdmin = require("firebase-admin");

const uploadProductImage = (imgData, fileName) => {
  if (imgData.indexOf("base64") != -1) {
    imgData = imgData.split("base64,")[1];
  }

  const fileType = fileName.substring(fileName.lastIndexOf(".") + 1);

  let bufferStream = new stream.PassThrough();
  bufferStream.end(new Buffer.from(imgData, "base64"));
  const defaultBucket = firebaseAdmin
    .storage()
    .bucket(process.env.FIREBASE_STORAGE_BUCKET_NAME);

  if (!fs.existsSync(tempImagesDir)) {
    fs.mkdirSync(tempImagesDir);
  }

  // Temporarily create image file on filesystem
  fs.writeFile(
    `${tempImagesDir}/${fileName}`,
    imgData,
    "base64",
    (err, res) => {
      if (err) {
        console.log("fs err", err);
      }
    }
  );

  return defaultBucket.upload(`temp/${fileName}`, {
    destination: `product-images/${fileName}`,
    gzip: true,
    contentType: fileType,
    public: true,
    metadata: {
      contentType: fileType,
    },
  });
};

const removeTempFile = (fileName) => {
  fs.unlinkSync(`${tempImagesDir}/${fileName}`);
};

exports = module.exports = {
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
        const uploadData = await uploadProductImage(
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
        removeTempFile(productData.fileName);
      });
    });

    workflow.emit("validateData");
  },
};
