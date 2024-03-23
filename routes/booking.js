const express=require('express')
const router=express.Router()

router.get('/',(req,res)=>{
    res.render('booking/main')
})

router.get('/flight_bookings',(req,res)=>{
    res.render('booking/flight_bookings')
})

router.get('/flight_status',(req,res)=>{
    res.render('booking/flight_status')
})

router.get('/pnr_enquiry',(req,res)=>{
    res.render('booking/pnr_enquiry')
})

router.get('/flight_insurance',(req,res)=>{
    res.render('booking/flight_insurance')
})

router.get('/airline_info_schedules',(req,res)=>{
    res.render('booking/airline_info_schedules')
})

router.get('/offer_details',(req,res)=>{
    res.render('booking/offer_details')
})

module.exports=router