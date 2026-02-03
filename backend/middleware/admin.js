const verifyAdmin = (req, res, next) => {
    // Check if user exists and has admin role
    if (req.user && (req.user.role === 'admin' || req.user.role === 'Admin')) {
        console.log(`✅ Admin access granted for user: ${req.user.username || req.user.email} (${req.user._id})`);
        next();
    } else {
        console.log(`⛔ Admin access DENIED for user: ${req.user ? req.user.username : 'Unknown'} (${req.user ? req.user._id : 'No ID'})`);
        console.log(`Role found: '${req.user ? req.user.role : 'N/A'}'`);

        return res.status(403).json({
            success: false,
            message: "Access denied. Admin privileges required.",
            debug: {
                role: req.user ? req.user.role : 'none',
                user: req.user ? req.user.username : 'none'
            }
        });
    }
};

module.exports = verifyAdmin;
