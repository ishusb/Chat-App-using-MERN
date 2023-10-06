const asyncHandler = require("express-async-handler");
const User = require("../Models/userModel");
const generateToken = require("../config/generateToken");
// const Token = require("../Models/token");
// const sendEmail = require("../config/sendMail");
const crypto = require("crypto");

//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

//@description     Register new user
//@route           POST /api/user/
//@access          Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Feilds");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  // const token = await new Token({
  //   userId: user._id,
  //   token: crypto.randomBytes(32).toString("hex"),
  // }).save();
  // const url = `${process.env.BASE_URL}users/${user.id}/verify/${token.token}`;
  // await sendEmail(user.email, "Verify Email", url);

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
    // .send({ message: "An Email sent to your account please verify" });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

const userExist = asyncHandler(async (req, res) => {
  try {
    const { email } = req.params;
    const existingUser = await User.findOne({ email });
    res.json({ exists: !!existingUser });
  } catch (error) {
    console.error("Error checking user existence:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//@description     Auth the user
//@route           POST /api/users/login
//@access          Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Password");
  }
  // if (!user.verified) {
  //   let token = await Token.findOne({ userId: user._id });
  //   if (!token) {
  //     token = await new Token({
  //       userId: user._id,
  //       token: crypto.randomBytes(32).toString("hex"),
  //     }).save();
  //     const url = `${process.env.BASE_URL}users/${user._id}/verify/${token.token}`;
  //     await sendEmail(user.email, "Verify Email", url);
  //   }

  //   return res
  //     .status(400)
  //     .send({ message: "An Email sent to your account please verify" });
  // }
});

module.exports = {
  allUsers,
  registerUser,
  authUser,
  userExist,
};
