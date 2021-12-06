exports = module.exports = {
  getCartTotal: (productData) => {
    let cartTotal = 0;
    productData.forEach((cartItem) => {
      cartTotal += cartItem.product.rate * cartItem.quantity;
    });

    return cartTotal;
  },
};
