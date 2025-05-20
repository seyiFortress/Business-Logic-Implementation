import express from "express";
import { isSupportAdmin } from "../controller/middlewares/AdminAuth.js";
import { registerCompany, getVerifiedCompanies, getUnverifiedCompanies, getCompanyStatus } from "../controller/RE_company.control.js";
import { updateCompanyStatus, verifyCompany } from "../controller/admin.control.js";
const router = express.Router();

///////////////////////////////////// Start Route //////////////////////////////////////////////////

router.post("/companies", registerCompany); // Create company profile
router.get("/verify/companies", getVerifiedCompanies); // Admin read verified companies
router.get("/companies", getUnverifiedCompanies); // Admin read unverified companies
router.get("/status/companies/:id", getCompanyStatus); // read company status by ID
router.patch("/status/companies/:id", updateCompanyStatus); // Admin update company status
router.patch("/verify/companies/:id", verifyCompany); // Admin verify Company

//////////////////////////////////// End Route ////////////////////////////////////////////////////

export default router;