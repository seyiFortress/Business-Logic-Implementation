import mongoose from "mongoose";

const { Schema } = mongoose;

// BNPL Transaction Schema (agreements collection)
const bnplTransactionSchema = new Schema(

  {
    // User and Property References
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }, // User ID of the customer
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true
    }, // Property Id of the property being purchased

    // Payment Terms
    upfrontPayment: {
      type: Number,
      required: true
    }, // 10% of property cost
    totalAmount: {
      type: Number,
      required: true
    }, // Property price + 5% interest
    remainingAmount: {
      type: Number,
      required: true
    }, // Decreases with each installment paid
    monthlyInstallments: {
      type: Number,
      required: true
    }, // Fixed monthly amount

    // Payment Tracking
    missedPaymentCount: {
      type: Number,
      default: 0
    }, // Track consecutive misses
    dueDates: [{
      type: Date,
      required: true
    }], // 12 monthly due dates
    paidMonths: {
      type: [Boolean],
      default: Array(12).fill(false)
    }, // Tracks paid installments (12 months)
    lateFees: {
      type: Number,
      default: 0,
    }, // Penalties for missed payments

    // Paystack Integration Fields
    paystackReference: {
      type: String,
      unique: true,
    }, // From Paystack's charge.success event
    paystackAuthorization: {
      type: String
    }, // For recurring charges (if using subscription)

    // Status and Timestamps
    status: {
      type: String,
      enum: ["active", "completed", "defaulted", "repossessed"],
      default: "active"
    }, // Status of transaction
    repossessionDate: {
      type: Date,
    } // Timestamp when repossessed
  },
  
  {
    Timestamp: true,
  } //Adds createdAt and updatedAt fields

);

const BNPLTransaction = mongoose.model('BNPLTransaction', bnplTransactionSchema); // Ready to use model in the application

export default BNPLTransaction; // Export model for use