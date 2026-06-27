const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();

app.use(cors());
app.use(express.json());

console.log("Starting backend...");

console.log("PROJECT:", process.env.FIREBASE_PROJECT_ID);
console.log("EMAIL:", process.env.FIREBASE_CLIENT_EMAIL);
console.log("KEY EXISTS:", !!process.env.FIREBASE_PRIVATE_KEY);
// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  })
});

const db = admin.firestore();


console.log("✅ Firebase Admin initialized");

// Health check
app.get("/", (req, res) => {
  console.log("Health check");
  res.json({
    status: "OK",
    message: "SolaEarn Backend Running"
  });
});

// Firestore test
app.get("/test-firestore", async (req, res) => {
  try {
    const collections = await db.listCollections();

    console.log("Firestore connected");

    res.json({
      success: true,
      collections: collections.map(c => c.id)
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});