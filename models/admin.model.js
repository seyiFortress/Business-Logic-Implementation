import mongoose from "mongoose";

const { Schema } = mongoose;

// Admin Schema (Administrative collection)
const adminSchema = new Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true},
        role: { type: String, enum: ['super-admin', 'support'], default: "support" },
    },
    {
        Timestamp: true,
        versionKey: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Export Admin Schema
const Admin = mongoose.model("Admin", adminSchema); // create model from shema
export default Admin; // Export admin model