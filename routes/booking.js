const express=require('express')
const router=express.Router()

router.get('/',(req,res)=>{
    res.render('booking/main')
})

router.get('/flight_bookings',(req,res)=>{
    res.render('booking/flight_bookings')
})

module.exports=router