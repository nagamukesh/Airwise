const express=require('express')
const https=require("https");
const mysql=require("mysql");
const path=require("path");
const dotenv= require('dotenv');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');

dotenv.config()
const router=express.Router()
const app=express()
const bodyParser=require("body-parser");
const encoder=bodyParser.urlencoded();
app.use(express.urlencoded({extended:false}))

router.get('/',(req,res)=>{
    res.render('users')
})

const pool  = mysql.createPool({
    connectionLimit : 10,
    host            : process.env.MY_SQL_HOST,
    user            : process.env.MY_SQL_USER,
    password        : process.env.MY_SQL_PASSWORD,
    database        : process.env.MY_SQL_DATABASE
  });

router.post('/',encoder,async(req,res)=>{
    const username=req.body.name 
    const password=req.body.password
    const role=0;
    console.log("username:",username);
    console.log(password);
    pool.query('SELECT * from login  where username=? ',[username] ,(error,result,fields)=>{
        if (error) console.log(error);
        if(result[0]){
            if(result[0].password===password){
                const token=jwt.sign({username:username},process.env.JWT_SECRET)
                res.send("login successful")
            }
            else{
                res.send('Login failed! incorrect password')
            }
        }
        else{
            res.send("user not found!")
        }
    });//authentification is not working!
})

router.get('/new',(req,res)=>{
    res.render('users/new')
})

// router.post('/'(req,res)={

// })

module.exports=router