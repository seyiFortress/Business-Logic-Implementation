import mongoose from "mongoose";

const { Schema } = mongoose;

// Real Estate Company Schema (Company collection)
const companySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      min: 3,
      max: 35,
    }, // Name of the company. e.g. 'ABC Real Estate'
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already exists"],
      lowercase: true,
    }, // Email of the company. e.g. 'abc@mail.org'
    password: {
      type: String,
      required: [true, "Password is required"],
      min: 8,
      max: 1000,
    }, // Password of the company. e.g. 'password123'
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: [true, "Phone number already exists"],
    }, // Phone number of the comapny. e.g. '+234 123 456 7890'
    address: {
      type: String,
      required: [true, "Company address is required"],
      trim: true,
      min: 10,
      max: 500,
    }, // Address of the comapny. e.g. '123 sample street, kano, Nigeria'
    licenseNumber: {
      type: String,
      unique: [true, "License already exists"],
    }, // Government-issued license
    isVerified: {
      type: Boolean,
      default: false,
    }, // Verification status of the company. e.g. false
    verificationReason: { type: String }, // e.g., "Active license Number"
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Approved", "Rejected"],
    },
  },

  {
    Timestamp: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  } //Automatically create and update fields
);

const Company = mongoose.model("Company", companySchema); // Create model from schema
export default Company; // Export company model
