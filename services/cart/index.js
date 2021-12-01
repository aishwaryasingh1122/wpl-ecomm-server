const _ = require("lodash");

exports = module.exports = {
  findByUserId: (req, res) => {
    const userId = req.user._id;
    req.app.db.models.Carts.findOne({ userId })
      .populate({ path: "productData.product" })
      .exec((err, cart) => {
        if (err) {
          return res.status(400).json({
            msg: "Failed to load cart. Try again",
          });
        }

        res.status(200).json(cart);
      });
  },
  clearCartByUserId: (req, res) => {
    const userId = req.user._id;
    req.app.db.models.Carts.findOneAndRemove({ userId }, (err) => {
      if (err) {
        return res.status(400).json({
          msg: "Failed to clear cart. Try again",
        });
      }

      res.status(200).json();
    });
  },
  setItemToCart: (req, res) => {
    let workflow = req.app.utility.workflow(req, res);
    workflow.on("validateProductId", () => {
      req.app.db.models.Products.findOne(
        { _id: req.body.productId },
        (err, product) => {
          if (err || !product) {
            return res.status(400).json({
              msg: "Faied to update cart. Invalid product ID",
            });
          }

          workflow.emit("updateCart");
        }
      );
    });

    workflow.on("updateCart", () => {
      const userId = req.user._id;
      // Find cart for user
      req.app.db.models.Carts.findOne({ userId })
        .populate({
          path: "productData.product",
        })
        .exec((err, cart) => {
          if (err) {
            return res.status(400).json({
              msg: "Failed to update cart. Try again!",
            });
          }

          // Create new cart instance if it does not exist.
          if (!cart) {
            cart = new req.app.db.models.Carts({ userId });
          }

          // Get index of product instance in cart.productData
          const productDataIndex = _.findIndex(
            cart.productData,
            (item) => item.product._id == req.body.productId
          );

          // If product does not exist in cart, add product to productData
          if (productDataIndex == -1 && req.body.quantity > 0) {
            cart.productData.push({
              product: req.body.productId,
              quantity: req.body.quantity,
            });
          } else {
            // If product exists and new quantity is 0, remove product from cart.
            if (req.body.quantity == 0) {
              cart.productData.splice(productDataIndex, 1);
            } else {
              // If product exists and new quantity is non-zero, update quantity.
              cart.productData[productDataIndex].quantity = req.body.quantity;
            }
          }

          cart.save((err, updatedCart) => {
            if (err) {
              return res.status(400).json({
                msg: "Failed to update cart. Try again!",
              });
            }

            return res.status(200).json(updatedCart);
          });
        });
    });
    workflow.emit("validateProductId");
  },
};
