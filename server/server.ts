import "dotenv/config";
import express from "express"
let app = express()
let port = process.env.PORT || 8080;

app.get("/",(req,res)=>{
    res.status(200).json({
        message :"hi"
    })
})



app.listen(port,()=>{
    console.log(`Vessel started from port no. ${port} http://localhost:${port}`);
    
})
