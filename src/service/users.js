const db = require('../model/users')
const validator = require('../utilities/validator');


const fBookingService = {}

fBookingService.bookFlight = (flightBooking) => {
    //console.log(flightBooking);
    validator.validateFlightId(flightBooking.flightId);
    return db.checkCustomer(flightBooking.customerId).then(customerDet=>{
        if(customerDet==null){
            let err = new Error("Customer not registered. Register to proceed");
            err.status = 404;
            throw err;
        }
        else{
            return db.checkAvailability(flightBooking.flightId).then(flightDet=>{
            if(flightDet.status=="Cancelled"){ 
                let err = new Error("Sorry for the Inconvinience... "+flightBooking.flightId+" is cancelled!!");
                err.status = 400;
                throw err;
            }
            else if(flightDet.availableSeats<=0){
                let err = new Error("Flight "+flightBooking.flightId+" is already full!!");
                err.status = 406;
                throw err;
            }
            else if(flightDet.availableSeats<flightBooking.nOOfTickets){
                let err = new Error("Flight almost Full... Only "+flightDet.availableSeats+" left");
                err.status = 406;
                throw err; }
                else{
                    let totFare=flightDet.fare*flightBooking.nOOfTickets;
                    if(customerDet.walletAmount < totFare){
                        let err = new Error("Insufficient Wallet Amount. Add more Rs. "+totFare-customerDet.walletAmount +" to continue booking");
                        err.status = 400;
                        throw err;
                    }
                    else{
                        return db.bookFlight(flightBooking);
                    }
                }
            })
        }
    })

}

fBookingService.getAllBookings = () => {
    /*
        This method should invoke the appropriate method of flightBookingDb to fetch
        all the booking details of all the flights
    */
   return db.getAllBookings().then(bookingArr=>{
       if(bookingArr===null){
        let err = new Error("No Bookings is found in any flight");
        err.status = 404;
        throw err;
       } else {
            return bookingArr;
       }
   })
}

fBookingService.customerBookingsByFlight = (customerId, flightId) => {
    /*
        This method should invoke the appropriate method of flightBookingDb to fetch
        all the booking details of for a mentioned customer in a flight
    */
   return db.checkCustomer(customerId).then(cust=>{
       if(cust===null){
        let err = new Error("Invalid CustomerId!! Enter a valid customerId to view Details");
        err.status = 404;
        throw err;
       }
       else{
           return db.checkAvailability(flightId).then(flightDet=>{
            if(flightDet===null){
                let err = new Error("Invalid FlightId!! Enter a valid FlightId to view Details");
                err.status = 404;
                throw err;
            }
            else{
                return db.customerBookingsByFlight(customerId, flightId).then(booking=>{
                    if(booking===null){
                        let err = new Error("No Bookings found for "+customerId+" in "+flightId);
                        err.status = 404;
                        throw err;
                    }
                    else return booking;
                })
            }
           })
       }
   })
}



fBookingService.updateBooking = (bookingId, noOfTickets) => {
    /*
        This method should invoke the appropriate method of flightBookingDb
        to update the required booking details for the mentioned bookingId
        Also the necessary changes should be made to required columns of 
        Customer and Flight collections
    */
   return db.checkBooking(bookingId).then(flightObj=>{
       if(flightObj==null){
        let err = new Error("No Bookings with bookingId "+bookingId);
        err.status = 406;
        throw err;
       }
       else if(flightObj.status=="Cancelled"){
        let err = new Error("Sorry for the Inconvenience... "+flightObj.flightId+" has been cancelled!!");
        err.status = 406;
        throw err;
       }
       else if(flightObj.availableSeats==0){
        let err = new Error("Flight is already Full. Can't Book more tickets");
        err.status = 406;
        throw err;
       }
       else if(flightObj.availableSeats<noOfTickets){
        let err = new Error("Flight almost Full. Only "+flightObj.availableSeats+" seat left");
        err.status = 406;
        throw err;
       }
       else{
        for (let i of flightObj.bookings) {
            if (i.bookingId == bookingId) 
            { custId = i.customerId; break; }
            else continue;
        }
        return db.checkCustomer(custId).then(custObj=>{
            totFare=noOfTickets*flightObj.fare;
            if(custObj.walletAmount<totFare){
                let err = new Error("Insufficient Wallet Amount. Add more Rs." + totFare + " to continue booking");
                err.status = 406;
                throw err;
            }
            else{
                return db.updateBooking(bookingId, noOfTickets).then(flight=>{
                    if(flight==null){
                        let err = new Error("update failed");
                        err.status = 500;
                        throw err;
                    }
                    else{
                        return flight
                    }
                })
            }
        })
       }

   })
}
fBookingService.getbookingsByFlightId = (flightId) => {
    /*
        This method should invoke the appropriate method of flightBookingDb to fetch
        all the booking details of a particular flight
    */
   return db.getbookingsByFlightId(flightId).then(bookings=>{
       if(bookings===null){
            let err = new Error("No Bookings found for in "+flightId);
            err.status = 404;
            throw err;
       }
       else return bookings;
   })
}

module.exports = fBookingService;