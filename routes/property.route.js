import express from "express";
import {
  registerProperty,
  bnplEligibleProperties,
  availableProperties,
  getProperty,
  purchaseBNPLProperty,
} from "../controller/property.control.js";
import {
  updatePropertyStatus,
  updatePropertyEligibility,
} from "../controller/admin.control.js";
import { supportAdminVerifyToken, superAdminVerifyToken } from "../controller/middlewares/AdminAuth.js";
const router = express.Router();

//////////////////////// DEFINE ROUTE /////////////////////////

router.post("/:companyId/properties/:propertyId", purchaseBNPLProperty); // Create BNPL property
router.post("/:companyId/properties", registerProperty); // Create property
router.patch(
  "/:companyId/bnpl/eligible/properties/:propertyId", supportAdminVerifyToken,
  updatePropertyStatus
); // Admin update property status
router.patch("/:companyId/properties/:propertyId", superAdminVerifyToken, updatePropertyEligibility); // Admin update property eligibility
router.get("/:companyId/bnpl/eligible/properties", bnplEligibleProperties); // Read eligible BNPL properties
router.get("/:companyId/properties/:propertyId", getProperty); // Read property by ID
router.get("/:companyId/bnpl/status/properties", availableProperties); // Read available properties

/////////////////////////// ROUTE ///////////////////////////

export default router;
