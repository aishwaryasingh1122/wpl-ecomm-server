const authService = require("./services/auth");
const authUtils = require("./utils/auth");
const usersService = require("./services/users");
const productCategoryService = require("./services/product-category");
const productsService = require("./services/products");

exports = module.exports = (app) => {
  //  Verify CORS requests for browser
  app.options("/*", (req, res) => {
    return res.status(200).json();
  });

  app.get("/", (req, res) => {
    res.status(200).json("Server Running");
  });

  // Unverified Requests
  app.post("/api/user/register", authService.registerUser);
  app.post("/api/user/login", authService.loginUser);
  app.get("/api/user/verify/:id", authService.verifyAccount);
  app.get("/api/products", productsService.getProducts);

  // Authentication and authorization middleware
  app.all("/api/account/*", authUtils.authenticate);
  app.all("/api/account/admin/*", authUtils.authorize);

  // Requests valid for all logged-in users
  app.get("/api/account/user-session", (req, res) =>
    authUtils.authenticate(req, res)
  );

  // Requests valid for logged-in users with Admin or stronger roles

  // User Management APIs
  app.get("/api/account/admin/users", usersService.getAllUsers);
  app.put(
    "/api/account/admin/assign-role/:userId/:role",
    usersService.assignUserRole
  );
  app.put(
    "/api/account/admin/toggle-account/:userId",
    usersService.toggleUserActive
  );

  // Product Category Management APIs
  app.post(
    "/api/account/admin/product-category",
    productCategoryService.addCategory
  );
  app.get(
    "/api/account/admin/product-category",
    productCategoryService.fetchCategories
  );
  app.delete(
    "/api/account/admin/product-category/:categoryId",
    productCategoryService.removeCategory
  );

  // Product Management APIs
  app.post("/api/account/admin/product", productsService.addProduct);
  app.put(
    "/api/account/admin/product/toggle-availability/:productId",
    productsService.toggleProductAvailability
  );
  app.put(
    "/api/account/admin/product/update-quantity/:productId",
    productsService.updateQuantity
  );
};
