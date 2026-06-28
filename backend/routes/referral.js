const express = require("express");
const router = express.Router();

const { db, admin } = require("../firebase");

const REFERRER_REWARD = 10;
const WELCOME_BONUS = 5;

router.post("/", async (req, res) => {

    console.log(" Referral request received");

    try {

        const { uid } = req.body;

        if (!uid) {

            return res.status(400).json({

                success: false,

                message: "User ID is required"

            });

        }

        const userRef = db.collection("users").doc(uid);

        await db.runTransaction(async (transaction) => {

            const userSnap = await transaction.get(userRef);

            if (!userSnap.exists) {

                throw new Error("User not found");

            }

            const user = userSnap.data();

            console.log("Processing:", user.email);

            // Already processed
            if (user.rewarded === true) {

                console.log("Already rewarded");

                return;

            }

            // No referral used
            if (!user.referredBy) {

                transaction.update(userRef, {

                    rewarded: true

                });

                console.log("No referral");

                return;

            }

            // Prevent self referral
            if (user.referredBy === uid) {

                transaction.update(userRef, {

                    rewarded: true

                });

                console.log("Self referral blocked");

                return;

            }

            const referrerRef =
                db.collection("users").doc(user.referredBy);

            const referrerSnap =
                await transaction.get(referrerRef);

            // Invalid referral code
            if (!referrerSnap.exists) {

                transaction.update(userRef, {

                    rewarded: true

                });

                console.log("Invalid referral");

                return;

            }

            console.log("Rewarding users");

            // Reward referrer
            transaction.update(referrerRef, {

                balance:
                    admin.firestore.FieldValue.increment(REFERRER_REWARD),

                referrals:
                    admin.firestore.FieldValue.increment(1),

                referralReward:
                    admin.firestore.FieldValue.increment(REFERRER_REWARD)

            });

            // Reward new user
            transaction.update(userRef, {

                balance:
                    admin.firestore.FieldValue.increment(WELCOME_BONUS),

                rewarded: true

            });

            // Transaction history for referrer
            const referrerTransactionRef =
                referrerRef
                    .collection("transactions")
                    .doc();

            transaction.set(referrerTransactionRef, {

                type: "referral_bonus",

                title: "Referral Bonus",

                amount: REFERRER_REWARD,

                createdAt: Date.now()

            });

            // Transaction history for new user
            const welcomeTransactionRef =
                userRef
                    .collection("transactions")
                    .doc();

            transaction.set(welcomeTransactionRef, {

                type: "welcome_bonus",

                title: "Welcome Bonus",

                amount: WELCOME_BONUS,

                createdAt: Date.now()

            });

        });

        console.log(" Referral completed");

        res.json({

            success: true,

            message: "Referral processed"

        });

    } catch (error) {

        console.error("Referral Error:", error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

});

module.exports = router;