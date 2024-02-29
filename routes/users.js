const express=require('express')
const router=express.Router()



router.get('/',(req,res)=>{
    res.render('users')
})

router.get('/new',(req,res)=>{
    res.render('users/new')
})

// router.post('/'(req,res)={

// })

module.exports=router