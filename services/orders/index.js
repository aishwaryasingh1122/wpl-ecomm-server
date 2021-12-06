const cartUtils = require("../../utils/cart");

exports = module.exports = {
  getAllOrders: (req, res) => {
    req.app.db.models
      .Orders({})
      .populate("deliveryAddress")
      .populate("user")
      .populate({ path: "productData.products" })
      .exec((err, orders) => {
        if (err) {
          return res.status(400).json({
            msg: "Failed to retreive orders.",
          });
        }

        return res.status(200).json(orders);
      });
  },
  getOrdersForUser: (req, res) => {
    const userId = req.user._id;
    req.app.db.models
      .Orders({ user: userId })
      .populate("deliveryAddress")
      .populate({ path: "productData.products" })
      .exec((err, orders) => {
        if (err) {
          return res.status(400).json({
            msg: "Failed to retreive orders.",
          });
        }

        return res.status(200).json(orders);
      });
  },
  createOrder: (req, res) => {
    const userId = req.user._id;
    let workflow = req.app.utility.workflow(req, res);
    workflow.on("getCartForUser", () => {
      req.app.db.models.Carts.findOne({ userId })
        .populate({
          path: "productData.product",
        })
        .exec((err, cart) => {
          if (err || !cart) {
            return res.status(400).status({
              msg: "Could not access cart for user.",
            });
          }

          workflow.emit("validateCart", cart);
        });
    });

    workflow.on("validateCart", (cart) => {
      for (const [$index, cartItem] of cart.productData.entries()) {
        console.log("Cart Item", cartItem);
        if (cartItem.quantity > cartItem.product.quantity) {
          // if requested quantity > available quantities; remove item from cart
          cart.productData.splice($index, 1);
          cart.save((err) => {
            if (err) {
              console.log("Failed to save cart", err);
            }
          });

          return res.status(400).json({
            msg: "One or more item quantities cannot be fulfilled.",
          });
        }
      }
      console.log("validation complete");

      workflow.emit("createOrderInDb", cart);
    });

    workflow.on("createOrderInDb", (cart) => {
      const orderParams = {
        orderTotal: cartUtils.getCartTotal(cart.productData),
        deliveryAddress: req.body.deliveryAddress,
        user: req.user._id,
        productData: cart.productData,
      };

      req.app.db.models.Orders.create(orderParams, (err, newOrder) => {
        if (err) {
          return res.status(400).json({
            msg: "Failed to create order.",
          });
        }
        res.status(200).json(newOrder);
        workflow.emit("clearCart");
      });
    });

    workflow.on("clearCart", () => {
      req.app.db.models.Carts.findOneAndUpdate(
        { userId: req.user._id },
        { $set: { productData: [] } },
        (err) => {
          if (err) {
            console.log("Failed to clear cart", err);
          }
        }
      );
    });

    workflow.emit("getCartForUser");
  },
};
