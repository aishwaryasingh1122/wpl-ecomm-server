const cartUtils = require("../../utils/cart");
const mailUtils = require("../../utils/mail");

const permittedOrderStatuses = [
  "CANCELLED",
  "NEW",
  "PROCESSING",
  "DISPATCHED",
  "COMPLETED",
];

exports = module.exports = {
  getAllOrders: (req, res) => {
    req.app.db.models.Orders.find({})
      .populate("deliveryAddress")
      .populate({ path: "productData.product" })
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
    req.app.db.models.Orders.find({ user: userId })
      .populate({ path: "productData.product" })
      .populate("deliveryAddress")
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
        workflow.emit("sendConfirmationMail", newOrder._id);
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

    workflow.on("sendConfirmationMail", (orderId) => {
      const subject = `${process.env.APP_NAME} - Order Received!`;

      console.log(
        "Order details URL",
        `${process.env.STORE_APP_URL}/orders/details/${orderId}`
      );
      const templateLocals = {
        username: req.user.firstName,
        appName: process.env.APP_NAME,
        verificationLink: `${process.env.STORE_APP_URL}/orders/details/${orderId}`,
      };
      mailUtils
        .sendMail(req.user.email, subject, "ORDER_CONFIRMATION", templateLocals)
        .then(() => {
          res.status(200).json();
        })
        .catch((err) => {
          console.log("Sendmail err", err);
        });
    });

    workflow.emit("getCartForUser");
  },
  updateOrderStatus: (req, res) => {
    const orderId = req.params.orderId;
    const newStatus = req.params.status;

    if (
      !orderId ||
      !newStatus ||
      permittedOrderStatuses.indexOf(newStatus.toUpperCase()) == -1
    ) {
      return res.status(400).json({
        msg: "Failed to update order status. OrderId and status required or status maybe invalid",
      });
    }

    req.app.db.models.Orders.findOneAndUpdate(
      { _id: orderId },
      { $set: { status: newStatus.toUpperCase() } },
      (err) => {
        if (err) {
          return res.status(400).json({
            msg: "Failed to update order status.",
          });
        }

        return res.status(200).json();
      }
    );
  },
};
