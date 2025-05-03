import express from "express";
import { registerUser, registerAdmin, getAdmin, getVerifiedUsers, getUnverifiedUsers, getUser, getAllAdmin } from "../controller/user.control.js";
import { isSuperAdmin, isSupportAdmin } from "../controller/middlewares/AdminAuth.js";
import { updateUserStatus, verifyUser, assignSuperToAdmin } from "../controller/admin.control.js";
const router = express.Router();

//////////////////////// DEFINE ROUTES /////////////////////////

router.post("/register/user", registerUser); // Register a new user
router.post("/register/admin", registerAdmin); // Register a new admin
router.get("/users/:id", getUser); // Get a user by ID
router.get("/admins/:id", isSupportAdmin, getAdmin); // Fetch an admin by ID
router.get("/users/v", isSupportAdmin, getVerifiedUsers); // Fetch verified users from DB
router.get("/users/uv", isSupportAdmin, getUnverifiedUsers); // Fetch unverified users from DB
router.get("/admins", isSuperAdmin, getAllAdmin); // Fetch all admin from DB
router.patch("/admins/:id/role", isSuperAdmin, assignSuperToAdmin);// allocate super role to Admin
router.patch("/users/:id/s", isSupportAdmin, updateUserStatus); // Update user status
router.patch("/users/:id/v", isSupportAdmin, verifyUser); // Verify User

//////////////////////// ROUTES /////////////////////////

export default router;