import express from 'express';
const router = express.Router();



router.get("/", (req, res) => {
        res.status(200).send("you just fetched the notes ");
});

router.post("/", (req, res) => {
        res.status(201).json({message:"you just created a note "});


});
router.put("/:id",(req,res)=>{
        res.status(200).json({message:`Note with id ${req.params.id} has been updated`});
}); 


router.get("/",(req,res)=>{
    res.send("API is running....");
});


router.get("/api/about",(req,res)=>{
    res.send("This is about page");
});



router.post("/api/notes",(req,res)=>{    
    res.status(201).json({message:"Note has been added successfully"});
     });
   
    router.delete("/api/notes/:id",(req,res)=>{
        res.status(200).json({message:`Note with id ${req.params.id} has been deleted`});
    });
export default router;