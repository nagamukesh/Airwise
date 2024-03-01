const express=require('express')
const router=express.Router()
const app=express()
const bodyParser=require("body-parser");
const encoder=bodyParser.urlencoded();
app.use(express.urlencoded({extended:false}))

router.get('/',(req,res)=>{
    res.render('users')
})

router.post('/',encoder,(req,res)=>{
    const username=req.body.name 
    const password=req.body.password
    console.log("username:",username);
    console.log(password);
    res.send("login successful");
})

router.get('/new',(req,res)=>{
    res.render('users/new')
})

// router.post('/'(req,res)={

// })

module.exports=router