const express = require("express");
const router = express.Router();

const { db, admin } = require("../firebase");
const adminAuth = require("../middleware/adminAuth");

console.log("Admin Route Loaded");

// ------------------------------------
// Protect ALL admin routes
// ------------------------------------

router.use(adminAuth);

// ------------------------------------
// Get Pending Withdrawals
// ------------------------------------

router.get("/withdrawals", async (req, res) => {

    console.log("Loading pending withdrawals");

    try {

        const snapshot = await db
        .collection("withdrawals")
        .where("status","==","pending")
        .orderBy("createdAt","desc")
        .get();

        const withdrawals = [];

        snapshot.forEach(doc => {

            withdrawals.push({

                id: doc.id,

                ...doc.data()

            });

        });

        res.json({

            success:true,

            count:withdrawals.length,

            withdrawals

        });

    } catch(error) {

        console.error(error);

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

});

// ------------------------------------
// Approve Withdrawal
// ------------------------------------

router.post("/approve", async (req,res)=>{

    console.log("Approve Request");

    try{

        const { id } = req.body;

        if(!id){

            return res.status(400).json({

                success:false,

                message:"Missing withdrawal id"

            });

        }

        const withdrawRef =
        db.collection("withdrawals").doc(id);

        const snap =
        await withdrawRef.get();

        if(!snap.exists){

            return res.status(404).json({

                success:false,

                message:"Withdrawal not found"

            });

        }

        const withdrawal = snap.data();

        if(withdrawal.status !== "pending"){

            return res.json({

                success:false,

                message:"Withdrawal already processed"

            });

        }

        await withdrawRef.update({

            status:"approved",

            approvedAt:Date.now(),

            approvedBy:req.admin.email

        });

        console.log("Withdrawal Approved");

        res.json({

            success:true,

            message:"Withdrawal approved"

        });

    }catch(error){

        console.error(error);

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

});

// ------------------------------------
// Reject Withdrawal
// ------------------------------------

router.post("/reject", async (req,res)=>{

    console.log("Reject Request");

    try{

        const { id } = req.body;

        if(!id){

            return res.status(400).json({

                success:false,

                message:"Missing withdrawal id"

            });

        }

        const withdrawRef =
        db.collection("withdrawals").doc(id);

        const snap =
        await withdrawRef.get();

        if(!snap.exists){

            return res.status(404).json({

                success:false,

                message:"Withdrawal not found"

            });

        }

        const withdrawal =
        snap.data();

        if(withdrawal.status !== "pending"){

            return res.json({

                success:false,

                message:"Withdrawal already processed"

            });

        }

        await db.collection("users")
        .doc(withdrawal.uid)
        .update({

            balance:
            admin.firestore.FieldValue.increment(

                withdrawal.amount

            )

        });

        await withdrawRef.update({

            status:"rejected",

            rejectedAt:Date.now(),

            rejectedBy:req.admin.email

        });

        console.log("Withdrawal Rejected");

        res.json({

            success:true,

            message:"Withdrawal rejected and balance refunded"

        });

    }catch(error){

        console.error(error);

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

});

module.exports = router;