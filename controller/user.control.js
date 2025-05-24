import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import Admin from "../models/admin.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/////////////////// Start CONTROL ////////////////////////////////////////////////////

// CREATE user profile
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address, wallet } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password!" });
    } // Validate email and password

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" });
    } // Check if user already exists (business rule: no duplicates)

    const hashedPassword = await bcrypt.hash(password, 10); // Hash password (security rule: password hashing)

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      wallet,
    });
    await user.save(); // Save to DB (business logic: new user creation)

    res.status(201).json({
      message: "User profile created!",
      details: user,
    }); // Send response (business descision: omit password in response)
  } catch (error) {
    res
      .status(500)
      .json({ message: "Registration failed!", error: error.message }); // Handle errors
  }
};

// Login Admin
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Provide email and password!" });
  }
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Admin not found!" });

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword)
      return res.status(400).json({ message: "Invalid password!" });

    const payload = { id: admin._id, email: admin.email, role: admin.role };

    if (payload.role === "super-admin") {
      // Create JWT token for super admin(security rule: JWT for authentication)
      const token = jwt.sign(payload, process.env.JWT_SUPER_SECRET, {
        expiresIn: "1h",
      });
      return res
        .header("auth-token", token)
        .status(200)
        .json({ token, message: "Login successful!", details: admin });
    } else if (payload.role === "support") {
      // Create JWT token for support admin(security rule: JWT for authentication)
      const token = jwt.sign(payload, process.env.JWT_SUPPORT_SECRET, {
        expiresIn: "1h",
      });
      return res
        .header("auth-token", token)
        .status(200)
        .json({ token, message: "Login successful!", details: admin });
    } else {
      return res.status(403).json({ message: "Access denied!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Login failed!" });
  }
};

// Create Admin profile
const registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Provide email and password!" });
    } else {
      const existingAdmin = await Admin.findOne({ email }); // Check if admin already exists (business rule: no duplicates)
      if (existingAdmin) {
        return res.status(400).json({ message: "Admin already exist!" });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({ email, password: hashedPassword }); // Save to DB (Business logic: new Admin creation)
        await newAdmin.save(); // Save the new admin to the database
        res
          .status(201)
          .json({
            message: "Admin registered successfully!",
            details: newAdmin,
          }); // Send response (Business descision: omit password in response)
      }
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering admin!", error: error.message }); // Handle errors
  }
};

// Fetch Admin by ID
const getAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const admin = await Admin.findById(id, "email role");
    if (!admin) {
      res.status(404).json({ message: "No administrator found!" });
    } else {
      res
        .status(200)
        .json({ message: "Administrator successfully found!", details: admin });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Fetch administrator failed!", error: error.message });
  }
};

// Fetch all administrators
const getAllAdmin = async (req, res) => {
  try {
    const admins = await Admin.find(
      { role: { $in: ["super-admin", "support"] } },
      "email role"
    );
    if (!admins) {
      res.status(404).json({ message: "No administrators found!" });
    } else {
      res.status(200).json({
        message: "Administrators successfully found!",
        details: admins,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Fetch administrators failed!", error: error.message });
  }
};

// Fetch verified users
const getVerifiedUsers = async (req, res) => {
  try {
    const users = await User.find(
      { isVerified: true },
      "name email phone address verificationDocs creditScore status"
    );
    if (!users) {
      return res.status(404).json({ message: "No verified users found!" });
    } else {
      return res.status(200).json({ massage: "Verified users found!", users });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Verified search failed!", error: error.message });
  }
};

// Fetch unverified users
const getUnverifiedUsers = async (req, res) => {
  try {
    const users = await User.find(
      { isVerified: false },
      "name email phone address verificationDocs creditScore status"
    );
    if (!users) {
      return res.status(404).json({ message: "No unverified users found!" });
    } else {
      return res
        .status(200)
        .json({ message: "Unverified users found!", users });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Unverified search failed!", error: error.message });
  }
};

// Fetch user by ID
const getUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id, "name phone address status email"); // Find user in DB by ID
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    } else {
      return res.status(200).json({ message: "User found!", user });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error!", error: error.message });
  }
};

////////////////////////////////////// END CONTROL /////////////////////////

export {
  registerUser,
  loginAdmin,
  registerAdmin,
  getAdmin,
  getVerifiedUsers,
  getUnverifiedUsers,
  getUser,
  getAllAdmin,
};
