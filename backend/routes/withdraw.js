const express = require("express");
const router = express.Router();

const { db, admin } = require("../firebase");

const MIN_WITHDRAW = 50;

router.post("/", async (req, res) => {

    console.log(" Withdrawal request");

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
    const err = new Error("Insufficient balance");
    err.statusCode = 400;
    throw err;
}

            

            const now = Date.now();

            transaction.update(userRef, {

                balance: admin.firestore.FieldValue.increment(-value)

            });

            // Pending withdrawal request
            const withdrawalRef =
                db.collection("withdrawals").doc();

            transaction.set(withdrawalRef, {

                uid,

                email: user.email,

                phone,

                amount: value,

                status: "pending",

                createdAt: now

            });

            // User transaction history
            const transactionRef =
                userRef
                    .collection("transactions")
                    .doc();

            transaction.set(transactionRef, {

                type: "withdrawal",

                title: "Withdrawal Request",

                amount: -value,

                status: "pending",

                phone,

                createdAt: now

            });

        });

        res.json({

            success: true,

            message: "Withdrawal request submitted"

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