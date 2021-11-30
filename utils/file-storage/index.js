const tempImagesDir = "temp";
const stream = require("stream"),
  fs = require("fs"),
  firebaseAdmin = require("firebase-admin");

exports = module.exports = {
  uploadProductImage: (fileData, fileName) => {
    if (fileData.indexOf("base64") != -1) {
      fileData = fileData.split("base64,")[1];
    }

    const fileType = fileName.substring(fileName.lastIndexOf(".") + 1);

    let bufferStream = new stream.PassThrough();
    bufferStream.end(new Buffer.from(fileData, "base64"));
    const defaultBucket = firebaseAdmin
      .storage()
      .bucket(process.env.FIREBASE_STORAGE_BUCKET_NAME);

    if (!fs.existsSync(tempImagesDir)) {
      fs.mkdirSync(tempImagesDir);
    }

    // Temporarily create image file on filesystem
    fs.writeFile(
      `${tempImagesDir}/${fileName}`,
      fileData,
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
  },
  removeTempFile: (fileName) => {
    fs.unlinkSync(`${tempImagesDir}/${fileName}`);
  },
};
