const asyncHandler = require("../Middlewares/asyncHandler");
const loginDB = require("../Models/loginModel");
const { createToken } = require("../utilities/generateToken");
const {
  hashPassword,
  comparePassword,
} = require("../utilities/passwordUtilities");
exports.register = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fileds are required" });
  }
  const loginUser = await loginDB.findOne({ email });
  if (loginUser) {
    return res.status(400).json({ message: "User already exist" });
  }
  const hashedPassword = await hashPassword(password);
  console.log(hashedPassword);
  registeredUser = await new loginDB({
    username,
    email,
    password: hashedPassword,
    role,
  });
  const saved = registeredUser.save();
  const token = createToken(registeredUser, "user");
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  if (saved) {
    return res
      .status(201)
      .json({ message: "User saved succesfully", user: registeredUser });
  }
});
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fileds are required" });
  }
  const loginedUser = await loginDB.findOne({ email });
  if (!loginedUser) {
    return res.status(400).json({ message: "User not found" });
  }
  const matchPassword = comparePassword(password, loginedUser.password);
  if (!matchPassword) {
    return res.status(400).json({ message: "Password Incorrect" });
  }
  const { password: pwd, ...userWithoutPassword } = loginedUser.toObject();
  const token = createToken(loginedUser, loginedUser.role);
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  return res
    .status(201)
    .json({ message: "User Logged in succesfully", user: userWithoutPassword });
});
exports.logout = asyncHandler((req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
});
