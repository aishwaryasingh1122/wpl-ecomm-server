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
  assignUserRole: (req, res) => {
    const userId = req.params.userId;
    const roleToAssign = req.params.role;

    req.app.db.models.User.updateOne(
      { _id: userId },
      { $set: { role: roleToAssign } }
    ).exec((err, docs) => {
      if (err) {
        return res.status(400).json({
          msg: "Failed to assign user role. Try again!",
        });
      }

      if (!docs || !docs.modifiedCount) {
        return res.status(400).json({
          msg: "Failed to assign user role. Try again!",
        });
      }

      res.status(200).json();
    });
  },
  toggleUserActive: (req, res) => {
    const userId = req.params.userId;
    req.app.db.models.User.findOne({ _id: userId }).exec((err, user) => {
      if (err) {
        return res.status(400).json({
          msg: "Failed to update user account status.",
        });
      }

      if (!user) {
        return res.status(400).json({
          msg: "User Id invalid.",
        });
      }

      user.isActive = !user.isActive;
      user.save((error, updatedUser) => {
        if (error) {
          return res.status(400).json({
            msg: "Failed to update user account status.",
          });
        }

        if (!updatedUser) {
          return res.status(400).json({
            msg: "Failed to update user account status. Try again!",
          });
        }

        res.status(200).json();
      });
    });
  },
};
