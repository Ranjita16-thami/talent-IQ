import express from "express"
import path from "path"
import cors from "cors"
import { serve } from "inngest/express"
import {ENV} from "./lib/env.js"
import { connectDB } from "./lib/db.js"
import { inngest, functions } from "./lib/inngest.js"

const app = express()
const _dirname = path.resolve()

//middleware
app.use(express.json())

//credentials:true meaning?? => server allows a browser to include cookies on rqst
app.use(cors({origin:ENV.CLIENT_URL,credentials:true}))

app.use("/api/inngest",serve({client:inngest, functions }))

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