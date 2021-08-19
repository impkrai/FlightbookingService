let Validator = {};

Validator.validateFlightId = function (flightId) {
    var regEx = /^IND-+[1-9]+\d{2}$/; 
    if(flightId.match(regEx) && flightId.length==7){

    }
    else{
        let err = new Error("Error in flight Id");
        err.status = 400
        throw err;
    }
}

Validator.validateBookingId = function (bookingId) {
    // this method should validate the bookingId as mentioned in the QP
    // if failed it should throw appropriate error message
    if(bookingId.length!=7){
        let err = new Error("Error in booking Id");
        err.status = 400
        throw err;
    }

}

module.exports = Validator;