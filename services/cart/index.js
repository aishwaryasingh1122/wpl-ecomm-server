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
};
