module.exports.getClientUserId = (req, res, next) => {

        req.body.userId = req.headers['user'];
        req.body.userRole = req.headers['role'];
        if (req.body.userId != null || req.body.userRole != null) {
            next()
            return;
        } else {
            res.status(403).json({ message: 'Unauthorized access' });
            return;
        }

    } //End of getClientUserId