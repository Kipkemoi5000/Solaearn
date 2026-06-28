const express = require("express");
const router = express.Router();

const { db } = require("../firebase");

console.log("Task Route Loaded");

// ------------------------
// Get Active Tasks
// ------------------------

router.get("/", async (req,res)=>{

    console.log("Loading Tasks");

    try{

        const snapshot =
        await db.collection("tasks")
        .where("active","==",true)
        .orderBy("createdAt","desc")
        .get();

        const tasks=[];

        snapshot.forEach(doc=>{

            tasks.push({

                id:doc.id,

                ...doc.data()

            });

        });

        res.json({

            success:true,

            count:tasks.length,

            tasks

        });

    }catch(error){

        console.error(error);

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

});

// ------------------------
// Create Task (Admin)
// ------------------------

router.post("/create",async(req,res)=>{

    console.log("Creating Task");

    try{

        const{

            title,

            description,

            reward,

            link

        }=req.body;

        if(

            !title ||

            !description ||

            !reward ||

            !link

        ){

            return res.status(400).json({

                success:false,

                message:"Missing fields"

            });

        }

        const docRef=

        await db.collection("tasks")

        .add({

            title,

            description,

            reward:Number(reward),

            link,

            active:true,

            createdAt:Date.now()

        });

        res.json({

            success:true,

            id:docRef.id,

            message:"Task created"

        });

    }catch(error){

        console.error(error);

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

});

module.exports=router;