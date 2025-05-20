import User from "../models/user.model.js";
import Property from "../models/property.model.js";
import Company from "../models/RE_company.model.js";
import Admin from "../models/admin.model.js";

///////////////////////////////////// Control Start //////////////////////////////////////////////////

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (!user.isVerified) {
      return res
        .status(404)
        .json({ message: "User not verified!", details: user });
    }

    // Validate input
    if (!req.body.status) {
      return res.status(400).json({ message: "Status is required!" });
    }
    user.status = req.body.status;
    await user.save();
    res.status(200).json({ message: "Status updated!", details: user });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update status!", details: error.message });
  }
};

// Update property status
const updatePropertyStatus = async (req, res) => {
  const { status } = req.body;
  const id = req.params.propertyId; // Extract property ID from request parameters
  // Validate input
  if (!status) {
    return res.status(400).json({ message: "Status is required!" });
  }
  try {
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ message: "Property not found!" });
    }
    if (property.isBNPLEligible === false) {
      return res.status(404).json({ message: "Property not BNPL eligible!" });
    } else {
      property.set({ status });
    }
    await property.save();
    res.status(200).json({ message: "Status updated!", details: property });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update status", details: error.message });
  }
};

// Update company status
const updateCompanyStatus = async (req, res) => {
  const { status } = req.body;
  // Validate input
  if (!status) {
    return res.status(400).json({ message: "Status is required!" });
  }
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ message: "Company not found!" });
    } else {
      if (company.isVerified) company.set({ status });
      await company.save();
      res.status(200).json({ message: "Status updated!", details: company });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update status", details: error.message });
  }
};

// Update BNPL Eligibility
const updatePropertyEligibility = async (req, res) => {
  try {
    const { isBNPLEligible, eligibilityReason } = req.body;

    // Update the eligibility of the property if eligibility reason is provided
    const updateData =
      eligibilityReason && typeof isBNPLEligible === "boolean"
        ? { isBNPLEligible, eligibilityReason }
        : { eligibilityReason };

    const property = await Property.findByIdAndUpdate(
      req.params.propertyId,
      updateData,
      { new: true }
    );
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    } else {
      res
        .status(200)
        .json({ message: "Successfully updated eligibility", property });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to update eligibility",
      details: error.message,
    });
  }
};

// Verify Company
const verifyCompany = async (req, res) => {
  try {
    const { verificationReason, isVerified } = req.body;
    const id = req.params.id;

    // validate input
    if (!verificationReason) {
      return res
        .status(400)
        .json({ message: "Verification reason is required!" });
    }
    // Find the company
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ message: "Company does not exist!" });
    }
    // Update and save the company
    company.set({ isVerified, verificationReason });
    await company.save();
    res
      .status(200)
      .json({ message: "Company successfully verified!", details: company });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to verify company", details: error.message });
  }
};

// Verify User
const verifyUser = async (req, res) => {
  try {
    const { verificationReason } = req.body;

    // Update isVerified if verificationReason is provided
    if (!verificationReason) {
      return res
        .status(400)
        .json({ message: "Verification reason is required!" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    user.set({ isVerified: true, verificationReason });
    await user.save();
    res
      .status(200)
      .json({ message: "Successfully verified user!", details: user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to verify user!", details: error.message });
  }
};

// Asign role to Admin
const assignRoleToAdmin = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ message: "role is required!" });
    }
    const id = req.params.id;
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(400).json({ message: "admin doesn't exist!" });
    }
    if (admin.role === role) {
      return res
        .status(409)
        .json({ message: "Role already assigned!", details: admin });
    }

    //   Update and save the admin
    admin.role = role;
    await admin.save();
    // Send response
    res.status(200).json({
      message: "Admin role successfully allocated!",
      details: admin,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server failed to allocate role!",
      error: error.message,
    });
  }
};

///////////////////////////////////// Control Ends ///////////////////////////////////////////////////

export {
  updateUserStatus,
  assignRoleToAdmin,
  updateCompanyStatus,
  updatePropertyStatus,
  updatePropertyEligibility,
  verifyUser,
  verifyCompany,
};
