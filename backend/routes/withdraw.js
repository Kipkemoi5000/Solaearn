const express = require("express");
const router = express.Router();

const { db, admin } = require("../firebase");

const MIN_WITHDRAW = 50;

router.post("/", async (req, res) => {

    console.log("💰 Withdrawal request");

    try {

        const { uid, amount, phone } = req.body;

        if (!uid || !amount || !phone) {

            return res.status(400).json({

                success: false,

                message: "Missing required fields"

            });

        }

        const value = Number(amount);

        if (isNaN(value) || value < MIN_WITHDRAW) {

            return res.status(400).json({

                success: false,

                message: "Minimum withdrawal is KES " + MIN_WITHDRAW

            });

        }

        if (!/^2547\d{8}$/.test(phone)) {

            return res.status(400).json({

                success: false,

                message: "Phone must be in 2547XXXXXXXX format"

            });

        }

        const userRef = db.collection("users").doc(uid);

        await db.runTransaction(async (transaction) => {

            const userSnap = await transaction.get(userRef);

            if (!userSnap.exists) {

                throw new Error("User not found");

            }

            const user = userSnap.data();

            if ((user.balance || 0) < value) {

                throw new Error("Insufficient balance");

            }

            transaction.update(userRef, {

                balance: admin.firestore.FieldValue.increment(-value)

            });

            const withdrawalRef =
                db.collection("withdrawals").doc();

            transaction.set(withdrawalRef, {

                uid,

                email: user.email,

                phone,

                amount: value,

                status: "pending",

                createdAt: Date.now()

            });

        });

       