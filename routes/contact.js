const express=require('express')
const router=express.Router()

router.get('/',(req,res)=>{
    res.render('contact')
})

router.post('/submit_contact_form',(req,res)=>{
    console.log(res);
})

module.exports=router