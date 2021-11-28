exports = module.exports = {
  addCategory: (req, res) => {
    let workflow = req.app.utility.workflow(req, res);
    workflow.on("checkCategoryExists", () => [
      req.app.db.models.ProductCategories.findOne({
        title: req.body.title,
      }).exec((err, category) => {
        if (err) {
          return res.status(400).json({
            msg: "Failed to add product category. Try again",
          });
        }

        if (category) {
          return res.status(400).json({
            msg: "Product category already exists.",
          });
        }

        workflow.emit("createProductCategory", req.body.title);
      }),
    ]);

    workflow.on("createProductCategory", (title) => {
      req.app.db.models.ProductCategories.create({ title }, (err, category) => {
        if (err) {
          return res.status(400).json({
            msg: "Failed to add product category. Try again",
          });
        }

        res.status(200).json(category);
      });
    });

    workflow.emit("checkCategoryExists");
  },
  fetchCategories: (req, res) => {
    req.app.db.models.ProductCategories.find({}, (err, categories) => {
      if (err) {
        return res.status(400).json({
          msg: "Failed to add product category. Try again",
        });
      }

      res.status(200).json(categories);
    });
  },
  removeCategory: (req, res) => {
    const categoryId = req.params.categoryId;
    let workflow = req.app.utility.workflow(req, res);
    workflow.on("checkCategoryExists", () => [
      req.app.db.models.ProductCategories.findOne({
        _id: categoryId,
      }).exec((err, category) => {
        if (err) {
          return res.status(400).json({
            msg: "Failed to remove product category. Try again",
          });
        }

        if (!category) {
          return res.status(400).json({
            msg: "Product category does not exist.",
          });
        }

        workflow.emit("removeProductCategory", categoryId);
      }),
    ]);

    workflow.on("removeProductCategory", (categoryId) => {
      req.app.db.models.ProductCategories.updateOne(
        { _id: categoryId },
        { $set: { isDeleted: true } },
        (err, category) => {
          if (err) {
            return res.status(400).json({
              msg: "Failed to remove product category. Try again",
            });
          }

          res.status(200).json(category);
        }
      );
    });

    workflow.emit("checkCategoryExists");
  },
};
