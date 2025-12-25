
const express=require("express");
import notesRoutes from './routes/notesRoutes.js';

const app=express();
app.use("/api/notes",notesRoutes);


app.listen(7000,()=>{



    console.log("Server is running on port 7000");
});