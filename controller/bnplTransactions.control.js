import bnplTransaction from "../models/bnplTransaction.model.js"; // Import BNPLTransaction model
import User from "../models/user.model.js";
import "dotenv/config";

/////////////////// Start Logic ////////////////////////////////////////////////////

// Make a monthly payment
const monthlyTransaction = async (req, res) => {
    try {
        const { userId } = req.body;
        const transactionId = req.params.id;

        // Validate inputs
        if (!userId || !transactionId) {
            return res.status(400).json({ message: "No userId or transactionId!" });
        }

        const transaction = await bnplTransaction.findById(transactionId);
        const user = await User.findById(userId);

        if (!transaction || !user) {
            return res.status(404).json({ message: "Transaction or user not found!" });
        }

        // Validate the length of due dates
        if (!transaction.dueDates || transaction.dueDates.length !== transaction.paidMonths.length) {
            return res.status(400).json({ message: "Invalid transaction data!" });
        }

        // Find next unpaid month
        const nextUnpaidIndex = transaction.paidMonths.findIndex(paid => !paid);
        if (nextUnpaidIndex === -1) {
            transaction.status = "completed";
            await transaction.save();
            return res.json({ message: "Transaction completed!", transaction });
        }

        // Calculate payment amount
        const today = new Date();
        const isLate = today > transaction.dueDates[nextUnpaidIndex];

        if (transaction.missedPaymentCount >= 3) {
            transaction.status = "repossessed";
            transaction.repossessionDate = new Date();
            await transaction.save();
            return res.status(400).json({ message: "Transaction repossessed!", transaction });
        }

        if (isLate && transaction.missedPaymentCount < 3) {
            transaction.status = "defaulted";
            await transaction.save();
        }

        const paymentAmount = isLate
            ? transaction.monthlyInstallments * 1.05 // +5% late fee
            : transaction.monthlyInstallments;

        if (user.wallet < paymentAmount) {
            return res.status(400).json({ message: "Insufficient funds!", user });
        }

        // Deduct payment from user's wallet
        user.wallet -= paymentAmount;
        await user.save();

        // Update transaction details
        transaction.missedPaymentCount = isLate
            ? transaction.missedPaymentCount + 1
            : 0;

        transaction.paidMonths[nextUnpaidIndex] = true;
        transaction.remainingAmount = Math.max(
            0,
            transaction.remainingAmount - transaction.monthlyInstallments
        );

        if (isLate) {
            transaction.lateFees += paymentAmount - transaction.monthlyInstallments;
        }

        await transaction.save();
        res.json({ details: transaction });
    } catch (error) {
        res.status(500).json({ message: "Payment failed!", error: error.message });
    }
};

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

export { getActiveTransactions, getActiveTransaction, viewPaymentSchedule, monthlyTransaction };