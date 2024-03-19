const express=require('express')
const router=express.Router()
const https=require("https");
const mysql=require("mysql");
const path=require("path");
const dotenv= require('dotenv');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');

dotenv.config()
const app=express()
const bodyParser=require("body-parser");
const encoder=bodyParser.urlencoded();
app.use(express.urlencoded({extended:false}))



router.get('/',(req,res)=>{
    res.render('search')
})

const pool  = mysql.createPool({
    connectionLimit : 10,
    host            : process.env.MY_SQL_HOST,
    user            : process.env.MY_SQL_USER,
    password        : process.env.MY_SQL_PASSWORD,
    database        : process.env.MY_SQL_DATABASE
  });

router.post('/',encoder,async(req,res)=>{
    console.log(req.body.flightID);
    const flightID=req.body.flightID;
    console.log("flightID:",flightID)
    pool.query('SELECT flightID from flights where flightID=?',[flightID],(error,result,fields)=>{
        if(error){
            console.log(error);
        }
        else if(result.length===0){
            res.send("Invalid Flight ID");
        }
        else{
            res.send("valid FlightID");
        }
    })
})

// router.post('/'(req,res)={

// })

module.exports=router