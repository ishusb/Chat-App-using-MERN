const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
  userExist,
} = require("../Controllers/userController");
const { protect } = require("../Middleware/authMiddleware");

const router = express.Router();

router.route("/").post(registerUser).get(protect, allUsers);
router.post("/login", authUser);
router.get("/:email", userExist);

module.exports = router;
