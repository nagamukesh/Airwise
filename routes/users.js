const express=require('express')
const https=require("https");
const mysql=require("mysql");
const path=require("path");
const dotenv= require('dotenv');
const bcrypt=require('bcrypt');
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

router.post('/',encoder,(req,res)=>{
    const username=req.body.name 
    const password=req.body.password
    console.log("username:",username);
    console.log(password);
    pool.query('SELECT l.username from login as l where l.username=? ', [username] ,(error, results)=>{
        if (error) console.log(error);
        
    });
})

router.get('/new',(req,res)=>{
    res.render('users/new')
})

// router.post('/'(req,res)={

// })

module.exports=router