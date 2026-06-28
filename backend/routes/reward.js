const express = require("express");
const router = express.Router();

const { db, admin } = require("../firebase");

const DAILY_REWARD = 2;
const DAY = 24 * 60 * 60 * 1000;

router.post("/", async (req, res) => {

    console.log("🎁 Daily reward request");

    try {

        const { uid } = req.body;
        console.log("UID:", uid);

        if (!uid) {

            return res.status(400).json({

                success: false,

                message: "User ID is required"

            });

        }

        const userRef = db.collection("users").doc(uid);

        await db.runTransaction(async (transaction) => {

            const snap = await transaction.get(userRef);

            if (!snap.exists) {

                throw new Error("User not found");

            }

            const user = snap.data();

            const now = Date.now();

            const lastClaim = user.lastClaim || 0;

            if (now - lastClaim < DAY) {

                const remaining = DAY - (now - lastClaim);

                throw new Error("NEXT:" + remaining);

            }

            transaction.update(userRef, {

                balance: admin.firestore.FieldValue.increment(DAILY_REWARD),

                lastClaim: now

            });

            // Save transaction history
            const transactionRef = userRef
                .collection("transactions")
                .doc();

            transaction.set(transactionRef, {

                type: "daily_reward",

                title: "Daily Reward",

                amount: DAILY_REWARD,

                createdAt: now

            });
console.log("Transaction history document queued.");
        });

        console.log("✅ Daily reward added");
console.log("Daily reward transaction completed.");
        res.json({

            success: true,

            reward: DAILY_REWARD,

            message: "Daily reward claimed successfully."

        });

    } catch (error) {

        if (error.message.startsWith("NEXT:")) {

            return res.json({

                success: false,

                remaining: Number(
                    error.message.replace("NEXT:", "")
                )

            });

        }

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

});

module.exports = router;