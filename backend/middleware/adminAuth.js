const { db } = require("../firebase");

module.exports = async (req, res, next) => {

    try {

        const { uid } = req.body;

        if (!uid) {

            return res.status(401).json({
                success: false,
                message: "Missing user ID"
            });

        }

        const userDoc = await db.collection("users").doc(uid).get();

        if (!userDoc.exists) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        const user = userDoc.data();

        if (user.role !== "admin") {

            return res.status(403).json({
                success: false,
                message: "Access denied"
            });

        }

        req.user = user;

        next();

    } catch (error) {

        console.error("Admin Auth Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};
