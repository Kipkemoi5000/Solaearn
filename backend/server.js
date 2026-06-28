const express = require("express");
const cors = require("cors");

const { db } = require("./firebase");

const referralRoute = require("./routes/referral");
const rewardRoute = require("./routes/reward");
const withdrawRoute = require("./routes/withdraw");

// Admin route temporarily disabled until adminAuth middleware is created
// const adminRoute = require("./routes/admin");

const app = express();

app.use(cors());
app.use(express.json());

console.log("🚀 Starting SolaEarn Backend v1.6.0");

// --------------------
// Home
// --------------------

app.get("/", (req, res) => {

    console.log("GET /");

    res.json({
        success: true,
        name: "SolaEarn Backend",
        version: "1.6.0",
        status: "Running"
    });

});

// --------------------
// Firestore Test
// --------------------

app.get("/test-firestore", async (req, res) => {

    console.log("GET /test-firestore");

    try {

        const collections = await db.listCollections();

        res.json({
            success: true,
            collections: collections.map(c => c.id)
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
// API Routes
// --------------------

app.use("/referral", referralRoute);

app.use("/reward", rewardRoute);

app.use("/withdraw", withdrawRoute);

// Enable after creating middleware/adminAuth.js
// app.use("/admin", adminRoute);

// --------------------
// 404
// --------------------

app.use((req, res) => {

    console.log("404", req.method, req.originalUrl);

    res.status(404).json({
        success: false,
        message: "Endpoint not found"
    });

});

// --------------------
// Error Handler
// --------------------

app.use((err, req, res, next) => {

    console.error("Unhandled Error:", err);

    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`✅ Server running on port ${PORT}`);

});