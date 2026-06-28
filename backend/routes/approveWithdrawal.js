const express = require("express");
const router = express.Router();

const { db } = require("../firebase");
const adminAuth = require("../middleware/adminAuth");

router.post("/", adminAuth, async (req, res) => {

    try {

        const { withdrawalId, action } = req.body;

        if (!withdrawalId || !action) {

            return res.status(400).json({
                success: false,
                message: "Missing withdrawalId or action"
            });

        }

        if (!["approve", "reject"].includes(action)) {

            return res.status(400).json({
                success: false,
                message: "Invalid action"
            });

        }

        const withdrawalRef =
            db.collection("withdrawals").doc(withdrawalId);

        const withdrawalSnap =
            await withdrawalRef.get();

        if (!withdrawalSnap.exists) {

            return res.status(404).json({
                success: false,
                message: "Withdrawal not found"
            });

        }

        const withdrawal = withdrawalSnap.data();

        if (withdrawal.status !== "pending") {

            return res.status(400).json({
                success: false,
                message: "Withdrawal already processed"
            });

        }

        await withdrawalRef.update({

            status:
                action === "approve"
                    ? "approved"
                    : "rejected",

            processedAt: Date.now()

        });

        res.json({

            success: true,

            message:
                action === "approve"
                    ? "Withdrawal approved"
                    : "Withdrawal rejected"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

});

module.exports = router;