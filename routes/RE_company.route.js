import express from "express";
import { isSupportAdmin } from "../controller/middlewares/AdminAuth.js";
import { registerCompany, getVerifiedCompanies, getUnverifiedCompanies, getCompanyStatus } from "../controller/RE_company.control.js";
import { updateCompanyStatus, verifyCompany } from "../controller/admin.control.js";
const router = express.Router();

///////////////////////////////////// Start Route //////////////////////////////////////////////////

router.post("/companies/register", registerCompany); // Create company profile
router.get("/companies/v", isSupportAdmin, getVerifiedCompanies); // Fetch verified companies
router.get("/companies/uv", isSupportAdmin, getUnverifiedCompanies); // Fetch unverified companies
router.get("/companies/:id", getCompanyStatus); // Fetch company status by ID
router.patch("/companies/:id/s", isSupportAdmin, updateCompanyStatus); // Update company status
router.patch("/companies/:id/v", isSupportAdmin, verifyCompany); // Verify Company

//////////////////////////////////// End Route ////////////////////////////////////////////////////

export default router;