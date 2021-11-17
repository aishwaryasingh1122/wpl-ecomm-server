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
        res.status(400).json({
          msg: "Failed to assign user role. Try again!",
        });
      }

      if (!docs || !docs.modifiedCount) {
        res.status(400).json({
          msg: "Failed to assign user role. Try again!",
        });
      }

      res.status(200).json();
    });
  },
};
