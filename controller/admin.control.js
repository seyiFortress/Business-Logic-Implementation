import User from "../models/user.model.js";
import Property from "../models/property.model.js";
import Company from "../models/RE_company.model.js";
import Admin from "../models/admin.model.js";

///////////////////////////////////// Control Start //////////////////////////////////////////////////

// Update user status
const updateUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.Id);

        if (!user) {
            return res.status(404).json({message: "User not found!"});
        } else {
            if (user.isVerified) {
                user.set({ status: "Approved" });
                await user.save();
                res.status(200).json({ message: "Status updated!", details: user });
            }
        }

    } catch (error) {
        res.status(500).json({message: "Failed to update status!", details: error.message});
    }
}

// Update company status
const updateCompanyStatus = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ message: "Company not found!", });
        } else {
            if (company.isVerified) company.set({ status: "Approved" });
            await company.save();
            res.status(200).json({ message: "Status updated!", details: company });
        }

    } catch (error) {
        res.status(500).json({message: "Failed to update status", details: error.message});
    }
}

// Update BNPL Eligibility
const updatePropertyEligibility = async (req, res) => {
    try {
        const { isBNPLEligible, eligibilityReason } = req.body;

        // Update the eligibility of the property if eligibility reason is provided
        const updateData = eligibilityReason && typeof isBNPLEligible === 'boolean'
            ? { isBNPLEligible, eligibilityReason }
            : { eligibilityReason };

        const property = await Property.findByIdAndUpdate(req.params.id,
            updateData,
            { new: true }
        );    
        if (!property) {
            return res.status(404).json({message: "Property not found"});
        } else {
            res.status(200).json({message: "Successfully updated eligibility", property});
        }
        
    } catch (error) {
        res.status(500).json({message: "Failed to update eligibility", details: error.message});
    }
}

// Verify Company
const verifyCompany = async (req, res) => {
    try {
        const { verificationReason } = req.body;
        const id = req.params.id;

        // Update isVerified if verificationReason is provided
        if (verificationReason !== undefined && verificationReason !== null) {
            const company = await Company.findById(id);
            if (!company) {
                res.status(404).json({ message: "Company not found!" });
            } else {
                company.set({ isVerified: true });
                await company.save();
                res.status(200).json({ message: "Successfully verified company", details: company })
            }
        }

    } catch (error) {
        res.status(500).json({message: "Failed to verify company", details: error.messaage});
    }
}

// Verify User
const verifyUser = async (req, res) => {
    try {
        const { verificationReason } = req.body;

        // Update isVerified if verificationReason is provided
        if (verificationReason !== undefined || verificationReason !== null) {
            const user = await User.findById(req.params.id);
            if (!user) {
                res.status(404).json({ message: "User not found!" });
            } else {
                user.set({ isVerified: true });
                await user.save();
                res.status(200).json({message: "Successfully verified user!", details: user});
            }
        }

    } catch (error) {
        res.status(500).json({message: "Failed to verify user!", details: error.messaage});
    }
}

// allocate super role to Admin
const assignSuperToAdmin = async (req, res) => {
    try {
        const { email, role } = req.body;
        const id = req.params.id;
        if (!email || !id) {
            res.status(404).json({ message: "Email and User ID missing!" });
        } else if (role === 'super-admin') {
            res.status(404).json({ messaage: "Role already assigned!" })
        } else {
            const admin = await Admin.findByIdAndUpdate({ id },
                { role: "super-admin" },
                { new: true }
            );
            res.status(200).json({ messaage: "Admin role successfully allocated!", details: admin });
        }
    } catch (error) {
        res.status(500).json({ messaage: "Server failed to allocate role!", error: error.messaage });
    }
} 

///////////////////////////////////// Control Ends ///////////////////////////////////////////////////

export { updateUserStatus, assignSuperToAdmin, updateCompanyStatus, updatePropertyEligibility, verifyUser, verifyCompany };