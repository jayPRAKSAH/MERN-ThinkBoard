
const express=require("express");
const app=express();
app.get("/api/notes",(req,res)=>{
    res.send("you got 5 notes ");
});
app.get("/api/home",(req,res)=>{
    res.send("Hello World");
});
app.listen(7000,()=>{



    console.log("Server is running on port 7000");
});