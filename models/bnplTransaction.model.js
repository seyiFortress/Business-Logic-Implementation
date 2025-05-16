import mongoose from "mongoose";

const { Schema } = mongoose;

// BNPL Transaction Schema (agreements collection)
const bnplTransactionSchema = new Schema(

  {
    // Payment Terms
    totalAmount: {
      type: Number,
      required: true
    }, // Property price + 5% interest

    // Payment Tracking
    missedPaymentCount: {
      type: Number,
      default: 0
    }, // Track consecutive misses
    paidMonths: {
      type: [Boolean],
      default: Array(12).fill(false)
    }, // Tracks paid installments (12 months)

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