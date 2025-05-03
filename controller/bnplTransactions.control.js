import bnplTransaction from "../models/bnplTransaction.model.js"; // Import BNPLTransaction model
import User from "../models/user.model.js";
import "dotenv/config";

/////////////////// Start Logic ////////////////////////////////////////////////////

// Verify BNPL payments
const verifyTransaction = async (req, res) => {
    const event = req.body; // Get the event from the request body
    if (event.event === "charge.success") {
        const { reference } = event.data; // Get the reference from the event data

        // Update the transaction status in the DB
        const transaction = await bnplTransaction.findOneAndUpdate({paystackReference: reference},
            {status: "active"}, // Update status to active
            {new: true}, // Return the updated document
            {$set: {
                "paidMonths.0": true, // Mark the first month as paid
                remainingAmount: totalAmount - upfrontPayment - monthlyInstallments // Update remaining amount
            }}
        );
        if (!transaction) {
            return res.status(404).json({message: "Transaction not found!"});
        } else {
            return res.status(200).json({message: "Transaction verified!", transaction});
        }
    }
}

// Make a monthly payment
const monthlyTransaction = async (req, res) => {
    try {
        const { userId } = req.body;
        const transactionId = req.params.id;

        // Validate inputs
        if (!userId || !transactionId) {
            res.status(400).json({ message: "Invalid userId or transactionId!" });
        } else {
            const transaction = await bnplTransaction.findById(transactionId);
            if (!transaction) {
                return res.status(404).json({ message: "Transaction not found!" });
            } else {
                // Validate the length of due dates
                if (!transaction.dueDates || transaction.dueDates.length !== transaction.paidMonths.length) {
                    return res.status(400).json({ messaage: "Invalid transaction data!" });
                } else {
                    // Find next unpaid month
                    const nextUnpaidIndex = transaction.paidMonths.findIndex(paid => !paid);
                    if (nextUnpaidIndex === -1) {
                        return res.status(400).json({ message: "All payments completed!" });
                    } else {
                        // Calculate payment amount
                        const today = new Date();
                        const isLate = today > transaction.dueDates[nextUnpaidIndex];
                        const paymentAmount = isLate
                            ? transaction.monthlyInstallments * 1.05 // +5% late fee
                            : transaction.monthlyInstallments;

                        // Fetch user and process payment
                        const user = await User.findById(userId);
                        if (!user) {
                            return res.status(404).json({ message: "User not found!" });
                        } else {
                            let paymentResponse;
                            try {
                                paymentResponse = await paystack.transaction.initialize({
                                    authorization_code: process.env.PAYSTACK_AUTH, // Use environment variables
                                    amount: paymentAmount * 100, // Amount in kobo (1 Naira = 100 Kobo)
                                    email: user.email
                                });
                            } catch (paymentError) {
                                return res.status(500).json({ message: "Payment processing failed!", error: paymentError.message });
                            }
                            // Update transaction
                            transaction.paidMonths[nextUnpaidIndex] = true;
                            transaction.remainingAmount -= transaction.monthlyInstallments;
    
                            if (isLate) {
                                transaction.lateFees += paymentAmount - transaction.monthlyInstallments;
                            }

                            // Check if all payments are done
                            if (transaction.paidMonths.every(paid => paid)) {
                            transaction.status = "completed";
                            }

                            await transaction.save();
                            res.json({ details: transaction });
                        }
                    }
                }
            }
        }
    } catch (error) {
        res.status(500).json({ message: "Payment failed!", error: error.message });
    }
}

// Fetch all active Transactions
const getActiveTransactions = async (req, res) => {
    try {
        const transactions = await bnplTransaction.findOne({ status: "active" });
        res.status(200).json({message: "Active transactions found!", transactions});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// Fetch active transaction by ID
const getActiveTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await bnplTransaction.findById(id);
        if (!transaction) {
            res.status(404).json({message: "Transaction not found!"});
        } else {
            res.status(200).json({message: "Transaction found!", transaction});
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    };
};

// View Payment Schedule
const viewPaymentSchedule = async (req, res) => {
    try {
        const transactions = await bnplTransaction.find({userId: req.params.id, status: "active"}).populate("propertyId", "price"); // Get all active transactions for the user and populate propertyId with price
        res.status(200).json({message: "Payment schedule found!", transactions});
    } catch (error) {
        res.status(500).json({message: "Failed to view payment schedule", error: error.messaage});
    }
}

////////////////////////////////////// End Logic /////////////////////////

export { verifyTransaction, getActiveTransactions, getActiveTransaction, viewPaymentSchedule, monthlyTransaction };