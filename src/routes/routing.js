const express = require('express');
const create = require('../model/dbsetup');
// DO NOT REMOVE THIS IMPORT STATEMENT
// const tester = require('../../parserModule/parser').reportGenerator
const routing = express.Router();
/* Import the neccesary files here */
const flightBookingService = require('../service/users');
const flightBooking = require('../model/flightbooking');

/* DO NOT CHANGE THIS ROUTE METHOD... THIS IS TO SETUP YOUR DATABASE */
routing.get('/setupDb', (req, res, next) => {
    create.setupDb()
        .then((data) => { res.send(data) })
        .catch((err) => { next(err) })
})

routing.post('/bookFlight', (req, res, next) => {
    /* Implement the routing here to book the required seats in a flight */
    const flightBookingObj = new flightBooking(req.body);
    return flightBookingService.bookFlight(flightBookingObj).then(bookingId=>{
        res.json({ "message": "Flight booking is successful with booking Id :" + bookingId });
    }).catch((err) => next(err))

})

routing.get('/getAllBookings', (req, res, next) => {
    /* Implement the routing here to display all the bookings of all the flights */
    return flightBookingService.getAllBookings().then(bookingArr=>{
        res.json(bookingArr)
    }).catch((err) => next(err));
})

routing.get('/customerBookings/:customerId/:flightId', (req, res, next) => {
    /*  Implement the routing here to display the 
        bookings of a particular customer in aparticular flight 
    */
   let customerId=req.params.customerId;
   let flightId=req.params.flightId;
   return flightBookingService.customerBookingsByFlight(customerId, flightId).then(booking=>{
       res.json(booking)
   }).catch((err) => next(err));
})

routing.get('/bookingsByFlight/:flightId', (req, res, next) => {
    /*
        Implement the routing here to display all the bookings of a particular flight
    */
   let flightId=req.params.flightId;
   return flightBookingService.getbookingsByFlightId(flightId).then(bookingsArr=>{
       res.json(bookingsArr);
   }).catch((err) => next(err));
})

routing.put('/updateBooking/:bookingId', (req, res, next) => {
    /*
        Implement the routing here to update the booking for already booked flight ticket
    */
   let bookingId=req.params.bookingId;
   noOfTickets=req.body.noOfTickets;
   return flightBookingService.updateBooking(bookingId,noOfTickets).then(flightDet=>{
       res.json({ "message": "Booking successfully updated!! updated flight details " + flight });
   }).catch((err) => next(err));
})

// DO NOT ALTER ANYTHING IN THIS ROUTE
// routing.get('/test', (req, res, next) => {
//     tester()
//         .then((data) => {
//             console.log("--- Verification Completed ---")
//             res.send(data);
//         }).catch((err) => {
//             next(err)
//         })
// })

// do not remove this export statement
module.exports = routing;