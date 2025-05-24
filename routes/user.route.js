import express from "express";
import {
  registerUser,
  registerAdmin,
  getAdmin,
  getVerifiedUsers,
  getUnverifiedUsers,
  getUser,
  loginAdmin,
  getAllAdmin,
} from "../controller/user.control.js";
import {
  superAdminVerifyToken,
  supportAdminVerifyToken,
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
router.post("/admins/login", loginAdmin); // Admin login for token
router.get("/users/:id", getUser); // Read user by ID
router.get("/admins/:id", superAdminVerifyToken, getAdmin); // Admin read admin by ID
router.get("/verify/users", supportAdminVerifyToken, getVerifiedUsers); // Admin read verified users
router.get("/users", supportAdminVerifyToken, getUnverifiedUsers); // Admin read unverified users
router.get("/admins", superAdminVerifyToken, getAllAdmin); // Admin read all administrators
router.patch("/role/admins/:id", superAdminVerifyToken, assignRoleToAdmin); // Admin update admin role
router.patch("/status/users/:id", supportAdminVerifyToken, updateUserStatus); // Admin update user status
router.patch("/verify/users/:userId", superAdminVerifyToken, verifyUser); // Admin update user verification

//////////////////////// END ROUTES /////////////////////////

export default router;
