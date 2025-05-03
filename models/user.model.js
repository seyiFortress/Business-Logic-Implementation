import mongoose from "mongoose";

const { Schema } = mongoose;

// User Schema (users collection)
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      min: 3,
      max: 35,
    }, // Name of the user. e.g. 'John Doe'
    email: {
      type: String,
      unique: [true, "Email already exists"],
      lowercase: true,
    }, // Email address of the user. e.g. 'jdoe@mail.com'
    password: {
      type: String,
      min: 8,
      max: 50
    }, // Password for user authentication. e.g. 'password123'
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: [true, "Phone number already exists"],
    }, // Phone number of the user. e.g. '+234 123 456 7890'
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      min: 10,
      max: 500,
    }, // Address of the user. e.g. '123 dummy street, takwa, Nigeria'
    isVerified: {
      type: Boolean,
      default: false,
    }, // Indicates the verification status of the user
    verificationReason: { type: String }, // e.g., "good credit score with supporting documents"
    verificationDocs: {
      type: [String]
    }, // Array of uploaded document URLs (e.g. ID, proof of income)
    creditScore: {
      type: Number
    }, // Credit score of the user for BNPL eligibility review. e.g. 700
    status: { type: String, default: 'Pending' }
  },

  {
    Timestamp: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  } //Automatically create and update fields
);


// Export User model
const User = mongoose.model("User", userSchema); // create model from schema
export default User; // Export user model