exports = module.exports = {
  getAllUsers: (req, res) => {
    req.app.db.models.User.find({}, { password: false }).exec((err, users) => {
      if (err) {
        return res.status(401).json({
          msg: "Failed to fetch users.",
        });
      }

      res.status(200).json(users);
    });
  },
};
