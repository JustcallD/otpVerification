const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./schema/user");
const app = express();
const port = 5000;
app.use(cors());

app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb+srv://pass:pass@cluster0.6ilfb7p.mongodb.net/otp");

const registeredUsers = [];

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}
// function generateUserId() {
//   const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
//   const id = `${Date.now()}${randomNumber}`;
//   return id;
// }

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  try {
    if (registeredUsers.some((user) => user.email === email)) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const otp = generateOTP();

    registeredUsers.push({
      // id: generateUserId(),
      email,
      otp,
      password,
    });
    console.log(registeredUsers);
    res.status(200).json({ message: "OTP sent successfully", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send OTP", success: false });
  }
});

app.post("/verify", async (req, res) => {
  const { email, otp } = req.body;
  console.log("all user", registeredUsers);

  const userIndex = registeredUsers.findIndex(
    (user) => user.email === String(email) && user.otp === Number(otp)
  );

  if (userIndex !== -1) {
    const user = registeredUsers[userIndex];
    console.log("single user", user);
    if (user) {
      const createdUser = await User.create({
        email: user.email,
        password: user.password,
        isVerified: true,
      });
      await createdUser.save();
      registeredUsers.splice(userIndex, 1);
    }

    res
      .status(200)
      .json({ message: "User registered successfully", success: true });

    console.log("all user", registeredUsers);
  } else {
    res.status(400).json({ error: "Invalid OTP", success: false });
  }
});

// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   if (!email) {
//     res.status(400).json({ error: "Email is required", success: false });
//   }
//   const user = await User.findOne({ email });
//   if (!user) {
//     res.status(400).json({ error: "user not found", success: false });
//   }
//   const isPasswordValid = password === user.password;

//   if (!isPasswordValid) {
//     res.status(400).json({ error: "invalid password", success: false });
//   }

//   if (user.isVerified === true) {
//     res.status(200).json({ user, success: true });
//   } else {
//     res.status(400).json({ error: "user not verified", success: false });
//   }
// });

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found", success: false });
    }

    const isPasswordValid = password === user.password;

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ error: "Invalid password", success: false });
    }

    if (!user.isVerified) {
      return res
        .status(400)
        .json({ error: "User not verified", success: false });
    }

    console.log("User logged in:", user);
    res.status(200).json({ user, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to log in", success: false });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
