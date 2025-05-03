import { verifyTransaction, getActiveTransactions, getActiveTransaction, viewPaymentSchedule, monthlyTransaction } from "../controller/bnplTransactions.control.js";
import { isSupportAdmin } from "../controller/middlewares/AdminAuth.js";
import express from "express";
const routes = express.Router();

////////////////////// GET ROUTES //////////////////////
routes.get("/bnpl/activeTransactions", isSupportAdmin, getActiveTransactions); // active transactions
routes.get("/bnpl/activeTransactions/:id", getActiveTransaction); // active transaction by ID
routes.get("/bnpl/:id/schedule", viewPaymentSchedule); // payment schedule for a user

////////////////////// POST ROUTES //////////////////////
routes.post("/paystack/webhook", verifyTransaction); // Verify BNPL payments
routes.post("/bnpl/:id/pay", monthlyTransaction); // Make a monthly payment

export default routes;