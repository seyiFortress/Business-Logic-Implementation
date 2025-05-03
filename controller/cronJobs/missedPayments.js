import bnplTransaction from "../../models/bnplTransaction.model.js"; // Import the BNPLTransaction model
import User from "../../models/user.model.js"; // Import the User model
import Property from "../../models/property.model.js"; // Import the Property model
import cron from "node-cron"; // Import cron for scheduling tasks



/////////////////// Start Logic ////////////////////////////////////////////////////

// Handle Missed Payments (Runs every day at 00:00)
const checkMissedPayments = async () => {
    const today = new Date(); // Get today's date
    console.log("Checking for missed payments..."); // Log start of process

    // Query to find overdue transactions
    const overdueTransactions = await bnplTransaction.find({
        dueDates: { $lte: today}, // Due dates less than or equal to today
        status: "active", // Only active transactions
        "paidMonths.0": !true // First month not paid
    });

    // Calculate missed payments
    for (const transaction of overdueTransactions) {
        const missedMonths = transaction.paidMonths.filter((paid) => paid === false).length; // Count missed payments

        // Add 5% penalty to First or second missed payment
        if (missedMonths === 1 || missedMonths === 2) {
            transaction.lateFees += transaction.monthlyInstallments * 0.05; // Add 5% penalty
            await transaction.save(); // Save the updated transaction            
        }

        // Repossess property after 3 consecutive missed payment
        if (missedMonths >= 3) {
            const totalPaid = transaction.upfrontPayment + (transaction.monthlyInstallments * transaction.paidMonths.filter(Boolean).length); // Calcualte total paid
            const penalty = totalPaid * 0.1; // 10% penalty on total paid

            // update user balance and refund after penalty
            const user = await User.findById(transaction.userId); // Find user by ID
            user.balance += (totalPaid = penalty); // Update user balance
            await user.save(); // Save the updated user

            // Mark property as available again for sale
            await Property.findByIdAndUpdate(transaction.propertyId, {status: "available", isBNPLEligible: true}); // Update property status to available

            // Update transaction status to "repossessed"
            transaction.status = "defaulted"; // Updated status to defaulted
            await transaction.save(); // Save the updated transaction

            await sendEmail(transaction.userId, "Property Repossessed", `You missed 3 payments. Penalty: ${penalty}. Property repossessed.`);
        }
    }
}

////////////////////////////////////// End Logic ////////////////////////////////////////////////



export default cron.schedule('0 0 * * *', checkMissedPayments, {
    scheduled: false, // Do not start immediately (auto-start)
    timezone: "Africa/Lagos" // Set the timezone to Africa/Lagos
})
; // Export the initialized cron job