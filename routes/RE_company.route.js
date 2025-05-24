import express from "express";
import { supportAdminVerifyToken, superAdminVerifyToken } from "../controller/middlewares/AdminAuth.js";
import { registerCompany, getVerifiedCompanies, getUnverifiedCompanies, getCompanyStatus } from "../controller/RE_company.control.js";
import { updateCompanyStatus, verifyCompany } from "../controller/admin.control.js";
const router = express.Router();

///////////////////////////////////// Start Route //////////////////////////////////////////////////

router.post("/companies", registerCompany); // Create company profile
router.get("/verify/companies", supportAdminVerifyToken, getVerifiedCompanies); // Admin read verified companies
router.get("/companies", supportAdminVerifyToken, getUnverifiedCompanies); // Admin read unverified companies
router.get("/status/companies/:companyId", supportAdminVerifyToken, getCompanyStatus); // Admin read company status by ID
router.patch("/status/companies/:companyId", supportAdminVerifyToken, updateCompanyStatus); // Admin update company status
router.patch("/verify/companies/:companyId", superAdminVerifyToken, verifyCompany); // Admin update company verification

//////////////////////////////////// End Route ////////////////////////////////////////////////////

export default router;