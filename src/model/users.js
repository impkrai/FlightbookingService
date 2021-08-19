const dbModel = require('../utilities/connection');

const flightBookingDb = {}

flightBookingDb.generateId = () => {
    return dbModel.getFlightCollection().then((model) => {
        return model.distinct("bookings.bookingId").then((ids) => {
            let bId = Math.max(...ids);
            return bId + 1;
        })
    })
}

flightBookingDb.checkCustomer = (custId) => {
    /*
        This method should take customerId as a parameter and check if any customer 
        with that customerId exists in the db or not
    */
   return dbModel.getCustomerCollection().then((custModel)=>{
       return custModel.findOne({customerId:custId}).then((cust)=>{
           if(cust){
               return cust;
           }
           else{
               console.log(custId);
               return null;
           }
       })
   })
}

flightBookingDb.checkBooking = (bookingId) => {

    /*
        This method should take bookingId as a parameter and check if 
        any booking with the mentioned booking Id exists in the db or not
    { "bookings.bookingId": 2001 }*/
    return dbModel.getFlightCollection().then((flightModel)=>{
        return flightModel.findOne({ "bookings.bookingId": bookingId }).then(flightObj=>{
            if(flightObj){
                return flightObj
            }
            else{
                console.log(bookingId);
                return null;
            }
        })
    })
}

flightBookingDb.checkAvailability = (flightId) => {
    /*
        This method should take flightId as a parameter and check 
        if any flight with that id exists in the db or not
    */
   return dbModel.getFlightCollection().then(flightModel=>{
       return flightModel.findOne({flightId:flightId}).then((flightDet)=>{
           if(flightDet){
               return flightDet;
           }
           else{
               return null;
           }
       })
   })
}

flightBookingDb.updateCustomerWallet = (customerId, bookingCost) => {
    /*
        This method should update the wallet amount for a given customer 
        by subtracting the provided bookingCost
    */
    return dbModel.getCustomerCollection().then(customerModel=>{
       customerModel.updateOne({ customerId: customerId }, { $inc: { walletAmount: -bookingCost } }).then(result=>{
           if(result.nModified == 1){
            console.log(true);
            return true;
           }
           else return false;
       })
   })
}

flightBookingDb.bookFlight = (flightBooking) => {
    /*  
     { customerId: "P1001", bookingId: 2001,    noOfTickets: 3, bookingCost: 1800},
    */

   return dbModel.getFlightCollection().then(flightModel=>{
       return flightBookingDb.generateId().then(bId=>{
        flightBooking.bookingId=bId;
        return flightModel.updateOne({flightId: flightBooking.flightId},{$push: { bookings: flightBooking }}).then(res=>{
            if(res.nModified==1){
                return flightModel.updateOne({ flightId: flightBooking.flightId }, { $inc: { availableSeats: -flightBooking.noOfTickets } }).then(data=>{
                    if (data.nModified == 1) {
                        return flightBookingDb.updateCustomerWallet(flightBooking.customerId, flightBooking.bookingCost)
                            .then((bookingStatus) => {
                            if (bookingStatus) return flightBooking.bookingId;
                            else {
                                let err = new Error("wallet not updated");
                                err.status = 502;
                                throw err;
                                }
                            })
                    }
                    else{
                        let err = new Error("seats not updated");
                        err.status = 502;
                        throw err;
                    }
                })
            }
            else{
                let err = new Error("Booking failed");
                err.status = 500;
                throw err;
            }
        })
       })
   })
}

flightBookingDb.getAllBookings = () => {
    /*
        This method should fetch all the bookings for all the flights from the database
    */
   return dbModel.getFlightCollection().then((flightModel)=>{
        return flightModel.find({},{_id:0,bookings:1}).then((bookingArr)=>{
            if(bookingArr){
                return bookingArr;
            }
            else return null;
        })
   })
}

flightBookingDb.customerBookingsByFlight = (customerId, flightId) => {
    /*
        This method should fetch all the bookings 
        done by a customer in a given flight from the database
    */
   return dbModel.getFlightCollection().then(flightModel=>{
       return flightModel.findOne( { $and: [ {"bookings.customerId":customerId},{flightId:flightId} ]}).then(bookings=>{
           if(bookings){
               return bookings
           }
           return null;
       })
   })
}

flightBookingDb.getbookingsByFlightId = (flightId) => {
    /*
        This method should fetch all the bookings for a given flight from the database
    *///flightModel.findOne({flightId:flightId})
   return dbModel.getFlightCollection().then(flightModel=>{
        return flightModel.findOne({flightId:flightId},{bookings:1}).then(bookings=>{
        if(bookings) {
            return bookings;
           }
           else {
               return null;
            }
       })
   }
    )
}

flightBookingDb.updateBooking = (bookingId, noOfTickets) => {
    /*
        This method should update the required number of seats , 
        the booking cost for the given booking Id 
        Furthermore, it should update the availableSeats column of the 
        Flight collection and wallet amount for the corresponding customer
    */
        return dbModel.getFlightCollection().then((model) => {
            return model.updateOne({ "bookings.bookingId": bookingId }, { $inc: { "bookings.$.noOfTickets": noOfTickets, availableSeats: -noOfTickets } }).then((updated) => {
                if (updated.nModified == 1) {
                    return model.findOne({ "bookings.bookingId": bookingId }).then((flight) => {
                        if (flight) {
                            return model.updateOne({ "bookings.bookingId": bookingId }, { $inc: { "bookings.$.bookingCost": noOfTickets * flight.fare } }).then((saved) => {
                                if (saved.nModified == 1) {
                                    for (let booking of flight.bookings) {
                                        if (booking.bookingId == bookingId) { custId = booking.customerId; break; }
                                        else continue;
                                    }
                                    return dbModel.getCustomerCollection().then((model1) => {
                                        return model1.updateOne({ customerId: custId }, { $inc: { walletAmount: -(noOfTickets * flight.fare) } }).then((wupdated) => {
                                            if (wupdated.nModified == 1) {
                                                return flightBookingDb.checkAvailability(flight.flightId).then((flight) => {
                                                    return flight;
                                                })
                                            }
                                            else return null;
                                        })
                                    })
                                }
                            })
                        }
                    })
                }
            })
        })   
}

module.exports = flightBookingDb;
