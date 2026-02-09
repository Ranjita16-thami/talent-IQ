import express from "express"
import path from "path"
import cors from "cors"
import { serve } from "inngest/express"
import {ENV} from "./lib/env.js"
import { connectDB } from "./lib/db.js"
import { inngest, functions } from "./lib/inngest.js"

// Add this import at the top
import { chatClient, upsertStreamUser } from "./lib/stream.js";




const app = express()
const _dirname = path.resolve()

//middleware
app.use(express.json())

//credentials:true meaning?? => server allows a browser to include cookies on rqst
app.use(cors({origin:ENV.CLIENT_URL,credentials:true}))

app.use("/api/inngest",serve({client:inngest, functions }))

// Add this endpoint
app.get("/test-stream-direct", async (req, res) => {
  try {
    console.log("=== TESTING GETSTREAM DIRECTLY ===");
    
    // Test with the actual Clerk user ID format
    const testUser = {
      id: "user_test_" + Date.now(),
      name: "Ranjita Thami Test",
      image: "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zOVFHakVuZEJwOGp1ejJyaDBGcFo4SVBacXMifQ"
    };
    
    console.log("Creating test user:", testUser);
    
    const result = await chatClient.upsertUser(testUser);
    
    console.log("✅ Success! Result:", result);
    
    res.json({ 
      success: true, 
      message: "User created! Check GetStream Explorer NOW!",
      testUser,
      result 
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ 
      error: error.message,
      details: error.toString(),
      stack: error.stack
    });
  }
});


// Clerk webhook endpoint
app.post("/api/webhooks/clerk", async (req, res) => {
  try {
    const webhookPayload = req.body;
    
    console.log("Received Clerk webhook:", webhookPayload.name);

    // Extract event name and data from Clerk webhook payload
    const eventName = webhookPayload.name; // e.g., "clerk/user.created"
    const userData = webhookPayload.data; // User data object

    if (!eventName || !userData) {
      return res.status(400).json({ error: "Invalid webhook payload" });
    }

    // Send event to Inngest with user data
    // Inngest will wrap this, so event.data will contain the userData
    await inngest.send({
      name: eventName,
      data: userData
    });

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error processing Clerk webhook:", error);
    res.status(500).json({ error: "Failed to process webhook" });
  }
});

app.get("/health",(req,res)=>{
    res.status(200).json({msg:"sutyo ki nai"})
})

app.get("/books",(req,res)=>{
    res.status(200).json({msg:"this is book endpoint "})
})
//make our app rdy for development
if (ENV.NODE_ENV === "production"){
    app.use(express.static(path.join(_dirname, "../frontend/dist")))

    app.get("/{*any}",(req,res)=>{
        res.sendFile(path.join(_dirname, "../frontend", "dist","index.html"))
    })
}



    const startServer = async  () =>{
        try{
            await connectDB();
            app.listen (ENV.PORT, () => {
                console.log("Server is running on port:",ENV.PORT)
              

            });

        } catch (error) {
            console.error("Error starting the server",error)
        }
    }
    startServer();