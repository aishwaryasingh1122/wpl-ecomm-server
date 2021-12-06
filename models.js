"use strict";

exports = module.exports = (app, mongoose) => {
  require("./schema/User")(app, mongoose);
  require("./schema/Authentication")(app, mongoose);
  require("./schema/ProductCategory")(app, mongoose);
  require("./schema/Product")(app, mongoose);
  require("./schema/Cart")(app, mongoose);
  require("./schema/Address")(app, mongoose);
  require("./schema/Order")(app, mongoose);
};
