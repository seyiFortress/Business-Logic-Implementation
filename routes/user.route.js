import express from "express";
import {
  registerUser,
  registerAdmin,
  getAdmin,
  getVerifiedUsers,
  getUnverifiedUsers,
  getUser,
  getAllAdmin,
} from "../controller/user.control.js";
import {
  isSuperAdmin,
  isSupportAdmin,
} from "../controller/middlewares/AdminAuth.js";
import {
  updateUserStatus,
  verifyUser,
  assignRoleToAdmin,
} from "../controller/admin.control.js";
const router = express.Router();

//////////////////////// DEFINE ROUTES /////////////////////////

router.post("/users", registerUser); // Create user
router.post("/admins", registerAdmin); // Create admin
router.get("/users/:id", getUser); // Read user by ID
router.get("/admins/:id", getAdmin); // Read admin by ID
router.get("/verify/users", getVerifiedUsers); // Read verified users
router.get("/users", getUnverifiedUsers); // Read unverified users
router.get("/admins", getAllAdmin); // Read all administrators
router.patch("/role/admins/:id", assignRoleToAdmin); // Update admin role
router.patch("/status/users/:id", updateUserStatus); // Update user status
router.patch("/verify/users/:id", verifyUser); // Update user verification

//////////////////////// END ROUTES /////////////////////////

export default router;
