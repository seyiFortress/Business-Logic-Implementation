import  jwt  from "jsonwebtoken";
import  dotenv  from "dotenv";

dotenv.config();


// super admin JWT verification middleware (add to routes)
const superAdminVerifyToken = async (req, res, next) => {
    const token = req.header("auth-token");
    if (!token) return res.status(401).json({ message: "Access denied: No token provided!" });
    try {
        // Verify the token using the super admin secret
        const verified = jwt.verify(token, process.env.JWT_SUPER_SECRET);
        req.admin = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid or expired token!" });
    }
}

// support admin JWT verification middleware (add to routes)
const supportAdminVerifyToken = async (req, res, next) => {
    const token = req.header("auth-token");
    if (!token) return res.status(401).json({ message: "Access denied: No token provided!" });
    try {
        // Verify the token using the support admin secret
        const verified = jwt.verify(token, process.env.JWT_SUPPORT_SECRET);
        req.admin = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid or expired token!" });
    }
}

export {superAdminVerifyToken, supportAdminVerifyToken};