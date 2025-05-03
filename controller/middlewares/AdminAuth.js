// Middleware to check Super admin permissions (add to routes)
const isSuperAdmin = (req, res, next) => {
    if (req.admin.role === 'super-admin' && res.admin) {
        next();
    } else {
        res.status(401).json({ error: "Access denied!" });
    }
}

// Middleware to check Support admin permissions
const isSupportAdmin = async (req, res, next) => {
    if ((req.admin.role === 'support' || req.admin.role === 'super-admin') && req.admin) {
        next();
    } else {
        res.status(401).json({ error: "Access denied"});
    }
}

export {isSuperAdmin, isSupportAdmin};