const asyncHandler = require("express-async-handler");
const User = require("../Models/userModel");
const Token = require("../Models/token");

const passwordLink = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Please Enter all the Feilds");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error("User with given email does not exist!");
  }
  let token = await token.findOne({ userId: user._id });
  if (!token) {
    token = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();
  }

  const url = `${process.env.BASE_URL}password-reset/${user._id}/${token.token}/`;
  await sendEmail(user.email, "Password Reset", url);

  res
    .status(200)
    .send({ message: "Password reset link sent to your email account" });
});

module.exports = { passwordLink };
