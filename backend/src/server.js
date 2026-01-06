import express from "express"
import path from "path"
import {ENV} from "./lib/env.js"

const app = express()
const _dirname = path.resolve()
app.get("/health",(req,res)=>{
    res.status(200).json({msg:"api i sup and running"})
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


app.listen(ENV.PORT,()=> console.log("server is running port:",ENV.PORT))



