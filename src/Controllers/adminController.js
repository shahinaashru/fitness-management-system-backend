const asyncHandler = require("../Middlewares/asyncHandler");
const adminDB = require("../Models/adminModel");
const loginDB = require("../Models/loginModel");
const { createToken } = require("../utilities/generateToken");
const {
  hashPassword,
  comparePassword,
} = require("../utilities/passwordUtilities");
// exports.login = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ message: "All fileds are required" });
//   }
//   const admin = await adminDB.findOne({ email });
//   if (!admin) {
//     return res.status(400).json({ message: "admin not found" });
//   }
//   const matchPassword = comparePassword(password, admin.password);
//   if (!matchPassword) {
//     return res.status(400).json({ message: "Password Incorrect" });
//   }
//   const token = createToken(admin, admin.role);
//   res.cookie("admin_token", token);
//   return res
//     .status(201)
//     .json({ message: "Admin Details Retrieved succesfully", admin: admin });
// });
// exports.register = asyncHandler(async (req, res) => {
//   console.log(req.body);
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ message: "All fileds are required" });
//   }
//   const admin = await adminDB.findOne({ email });
//   if (admin) {
//     return res.status(400).json({ message: "Admin details already exist" });
//   }
//   const hashedPassword = await hashPassword(password);
//   console.log(hashedPassword);
//   registeredadmin = await new adminDB({
//     email,
//     password: hashedPassword,
//   });
//   const saved = registeredadmin.save();
//   const token = createToken(registeredadmin, "admin");
//   res.cookie("admin_token", token);
//   if (saved) {
//     return res.status(201).json({
//       message: "Admin details saved succesfully",
//       admin: registeredadmin,
//     });
//   }
// });
// exports.logout = asyncHandler((req, res) => {
//   res.clearCookie("admin_token");
//   res.status(200).json({ message: "Logout successful" });
// });
exports.createUser = asyncHandler(async (req, res) => {
  let message = "";
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
  if (role === "trainer") {
    message = "Traner account created succesfully";
  } else {
    message = "User account created succesfully";
  }
  const saved = await registeredUser.save();
  if (saved) {
    return res.status(201).json({ message: message, user: registeredUser });
  } else {
    return res.status(500).json({ message: "Failed to save" });
  }
});
