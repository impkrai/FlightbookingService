const { Schema } = require("mongoose");
const Mongoose = require("mongoose")
Mongoose.Promise = global.Promise;
Mongoose.set('useCreateIndex', true)
//const url = "mongodb://localhost:27017/FlightBooking_DB";
const url ="mongodb+srv://impkrai:G1aIDmUb7VnKBJAL@flightbooking.qvgz8.mongodb.net/FlightBooking?retryWrites=true&w=majority";


const customerSchema = Schema({
    customerId: String,
    customerName: String,
    walletAmount: Number,
    customerType: { type: String, enum: ['Platinum', 'Gold', 'Silver'] }
}, { collection: "Customer" });

const flightBookingSchema = Schema({
    customerId: String,
    bookingId: { type: Number, unique: true },
    noOfTickets: { type: Number, min: [1, "minimum number of tickets should be 1"], max: [5, "maximum 5 tickets can be booked by a customer"] },
    bookingCost: { type: Number, min: [0, "Booking cost can't be negative"] }
})

const flightSchema = Schema({
    flightId: String,
    AircraftName: String,
    fare: Number,
    availableSeats: Number,
    status: { type: String, enum: ['Running', 'Cancelled'] },
    bookings: { type: [flightBookingSchema], default: [] }
}, { collection: "Flight" })

let collection = {};

collection.getCustomerCollection = () => {
    return Mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology:true }).then((database) => {
        return database.model('Customer', customerSchema)
    }).catch((error) => {
        let err = new Error("Could not connect to Database");
        err.status = 500;
        throw err;
    })
}

collection.getFlightCollection = () => {
    return Mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology:true }).then((database) => {
        return database.model('Flight', flightSchema)
    }).catch((error) => {
        let err = new Error("Could not connect to Database");
        err.status = 500;
        throw err;
    })
}

module.exports = collection;