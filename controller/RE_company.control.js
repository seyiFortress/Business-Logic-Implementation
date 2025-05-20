import Company from "../models/RE_company.model.js";
import bcrypt from "bcrypt";

///////////////////////////////////////////////// Control Start ////////////////////////////////////////////////////

// Create company profile
const registerCompany = async (req, res) => {
  try {
    const { name, email, password, phone, address, licenseNumber } = req.body;
    const existingCompany = await Company.findOne({ name });
    if (existingCompany) {
      return res.status(400).json({ message: "Company already exist!" });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const company = await Company.create({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        licenseNumber,
      });
      res.status(201).json({ message: "Company profile created!", company });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Registration failed!", error: error.message });
  }
};

// Fetch verified companies
const getVerifiedCompanies = async (req, res) => {
  try {
    const companies = await Company.find(
      { isVerified: true },
      "name email phone address licenseNumber status"
    );
    if (!companies) {
      res.status(404).json({ message: "Companies not found!" });
    } else {
      res.status(200).json({ message: "Companies found!", details: companies });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Verified search failed!", error: error.message });
  }
};

// Fetch unverified companies
const getUnverifiedCompanies = async (req, res) => {
  try {
    const companies = await Company.find(
      { isVerified: false },
      "name email phone address licenseNumber status"
    );
    if (!companies) {
      res.status(404).json({ message: "Companies not found!" });
    } else {
      res.status(200).json({ message: "Companies found!", details: companies });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Unverified search failed!", error: error.message });
  }
};

// Fetch company status by ID
const getCompanyStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const company = await Company.findById(
      id,
      "name email phone address isVerified licenseNumber status"
    );
    if (!company) {
      return res.status(404).json({ message: "Company not found!" });
    } else {
      return res
        .status(200)
        .json({ message: "Company profile found!", details: company });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error!", error: error.message });
  }
};

////////////////////////////////////// Control End //////////////////////////////////////////

export {
  registerCompany,
  getVerifiedCompanies,
  getUnverifiedCompanies,
  getCompanyStatus,
};
