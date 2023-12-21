const express = require("express");
const mongoose = require("mongoose");

const User = require("./schema/user");
const app = express();
const port = 5000;

app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb url");

const registeredUsers = [];

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}
function generateUserId() {
  const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
  const id = `${Date.now()}${randomNumber}`;
  return id;
}

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  try {
   
    if (registeredUsers.some((user) => user.email === email)) {
      return res.status(400).json({ error: "Email is already registered" });
    }

  
    const otp = generateOTP();

    registeredUsers.push({
      id: generateUserId(),
      email,
      otp,
      password,
    });
    console.log(registeredUsers);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

app.post("/verify", async (req, res) => {
  const { email, otp } = req.body;
  console.log("all user", registeredUsers);
 
  const userIndex = registeredUsers.findIndex(
    (user) => user.email === email && user.otp === otp
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

    res.status(200).json({ message: "User registered successfully" });

    console.log("all user", registeredUsers);
  } else {
    res.status(400).json({ error: "Invalid OTP" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    res.status(400).json({ error: "Email is required" });
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400).json({ error: "user not found" });
  }
  const isPasswordValid = password === user.password;

 
  if (!isPasswordValid) {
    res.status(400).json({ error: "invalid password" });
  }

  if (user.isVerified === true) {
    res.status(200).json(user);
  } else {
    res.status(400).json({ error: "user not verified" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
