const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

console.log("Starting backend...");

app.get("/", (req, res) => {

console.log("Health check");

res.json({
status:"OK",
message:"SolaEarn Backend Running"
});

});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{

console.log("Server running on port",PORT);

});
