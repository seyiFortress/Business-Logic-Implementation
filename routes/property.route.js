import express from "express";
import { registerProperty, bnplEligibleProperties, availableProperties,  getProperty, purchaseProperty } from "../controller/property.control.js";
const router = express.Router();



//////////////////////// DEFINE ROUTE /////////////////////////

router.post("/properties/bnpl/:id/buy", purchaseProperty); // purchase BNPL property
router.post("/properties/register", registerProperty); // register property
router.get("/properties/bnpl", bnplEligibleProperties); // Fetch all BNPL eligible properties
router.get("/properties/:id", getProperty); // Fetch property by ID
router.get("/properties/available", availableProperties); // Fetch all available properties

//////////////////////// ROUTE /////////////////////////

export default router;