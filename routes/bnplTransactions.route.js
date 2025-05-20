import { getActiveTransactions, getActiveTransaction, viewPaymentSchedule, monthlyTransaction } from "../controller/bnplTransactions.control.js";
import express from "express";
const routes = express.Router();

////////////////////// ROUTES //////////////////////
routes.get("/:companyId/bnpl/active/properties", getActiveTransactions); // active transactions
routes.get("/:companyId/bnpl/active/properties/:transactionId", getActiveTransaction); // active transaction by ID
routes.get("/bnpl/schedule/:id", viewPaymentSchedule); // payment schedule for a user

////////////////////// UPDATE ROUTES //////////////////////
routes.patch("/:companyId/properties/bnplproperties/:transactionId", monthlyTransaction); // Make a monthly payment

export default routes;