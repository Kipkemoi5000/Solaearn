const express = require("express");
const router = express.Router();

const { db } = require("../firebase");
const adminAuth = require("../middleware/adminAuth");

// --------------------
// Dashboard Statistics
// --------------------

router.post("/stats", adminAuth, async (req, res) => {

    try {

        const users = await db.collection("users").get();
        const withdrawals = await db.collection("withdrawals").get();

        let totalUsers = users.size;
        let totalBalance = 0;
        let totalReferralRewards = 0;
        let pendingWithdrawals = 0;

        users.forEach(doc => {

            const data = doc.data();

            totalBalance += data.balance || 0;
            totalReferralRewards += data.referralReward || 0;

        });

        withdrawals.forEach(doc => {

            const data = doc.data();

            if (data.status === "pending") {

                pendingWithdrawals++;

            }

        });

        res.json({

            success: true,

            stats: {

                totalUsers,

                totalBalance,

                totalReferralRewards,

                pendingWithdrawals

            }

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

});

// --------------------
// Pending Withdrawals
// --------------------

router.post("/withdrawals", adminAuth, async (req, res) => {

    try {

        const snapshot = await db.collection("withdrawals")
            .where("status", "==", "pending")
            .get();

        const withdrawals = [];

        snapshot.forEach(doc => {

            withdrawals.push({

                id: doc.id,

                ...doc.data()

            });

        });

        res.json({

            success: true,

            withdrawals

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