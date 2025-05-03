import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import Admin from "../models/admin.model.js";

/////////////////// Start CONTROL ////////////////////////////////////////////////////

// CREATE user profile
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address, isVerified, verificationDocs, creditScore, status } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password!" });
    } // Validate email and password

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" });
    } // Check if user already exists (business rule: no duplicates)

    const hashedPassword = await bcrypt.hash(password, 15); // Hash password (security rule: password hashing)

    const user = await User.create({ name, email, password: hashedPassword, phone, isVerified, address, verificationDocs, creditScore, status }); // Save to DB (business logic: new user creation)

    res
      .status(201)
      .json({
        message: "User profile created!",
        details: user
      }); // Send response (business descision: omit password in response)
  } catch (error) {
    res
      .status(500)
      .json({ message: "Registration failed!", error: error.message }); // Handle errors
  }
};

// Create Admin profile
const registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email && !password) {
      res.status(400).json({ message: "Provide email and password!" });
    } else {
      const existingUser = Admin.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: "User already exist!" });
      } else {
        const hashedPassword = await bcrypt.hash(password, 15);
        const admin = await Admin.create({ email, password: hashedPassword }); // Save to DB (Business logic: new Admin creation)
        res.status(201).json({ message: "Admin profile created!", details: admin })
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Registration failed!", error: error.message }); // Handle errors
  }
}

// Fetch Admin by ID
const getAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const admin = await Admin.findById({ id }, "email role");
    if (!admin) {
      res.status(404).json({ message: "No administrator found!" });
    } else {
      res.status(200).json({ message: "Administrator successfully found!", details: admin });
    }
  } catch (error) {
    res.status(500).json({ message: "Fetch administrator failed!", error: error.message });
  }
}

// Fetch all administrators
const getAllAdmin = async (req, res) => {
  try {
    const admins = await Admin.find({ role: { $in: ["super-admin", "support"] } }, "email role");
    if (!admins) {
      res.status(404).json({ message: "No administrators found!" });
    } else {
      res.status(200).json({ message: "Administrators successfully found!", details: admins });
    }
  } catch (error) {
    res.status(500).json({ message: "Fetch administrators failed!", error: error.message });
  }
}

// Fetch verified users
const getVerifiedUsers = async (req, res) => {
  try {
    const users = await User.find({ isVerified: true }, "name email phone address verificationDocs creditScore status");
    if (!users) {
      return res.status(404).json({ message: "No verified users found!" });
    } else {
      return res.status(200).json({ massage: "Verified users found!", users });
    }
  } catch (error) {
    res.status(500).json({ message: "Verified search failed!", error: error.message });
  }
}

// Fetch unverified users
const getUnverifiedUsers = async (req, res) => {
  try {
    const users = await User.find({ isVerified: false }, "name email phone address verificationDocs creditScore status");
    if (!users) {
      return res.status(404).json({ message: "No unverified users found!" });
    } else {
      return res.status(200).json({ message: "Unverified users found!", users });
    }
  } catch (error) {
    res.status(500).json({ message: "Unverified search failed!", error: error.message });
  }
}

// Fetch user by ID
const getUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById({ id }, "name phone address status email creditScore"); // Find user in DB by ID
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    } else {
      return res.status(200).json({ message: "User found!", user });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error!", error: error.massage });
  }
}

////////////////////////////////////// END CONTROL /////////////////////////

export { registerUser, registerAdmin, getAdmin, getVerifiedUsers, getUnverifiedUsers, getUser, getAllAdmin };
