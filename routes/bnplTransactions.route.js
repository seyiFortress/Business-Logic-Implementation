import { getActiveTransactions, getActiveTransaction, viewPaymentSchedule, monthlyTransaction } from "../controller/bnplTransactions.control.js";
import { supportAdminVerifyToken } from "../controller/middlewares/AdminAuth.js";
import express from "express";
const routes = express.Router();

////////////////////// ROUTES //////////////////////
routes.get("/:companyId/bnpl/active/properties", supportAdminVerifyToken, getActiveTransactions); // Admin read active transactions
routes.get("/:companyId/bnpl/active/properties/:transactionId", getActiveTransaction); // Read active transaction by ID
routes.get("/bnpl/schedule/:id", viewPaymentSchedule); // Read user payment schedule

////////////////////// UPDATE ROUTES //////////////////////
routes.patch("/:companyId/properties/bnplproperties/:transactionId", monthlyTransaction); // Make a monthly payment

export default routes;