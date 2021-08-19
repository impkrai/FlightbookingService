const collection = require('../utilities/connection');


const customerDb = [
    {
        customerId: "P1001",
        customerName: "Tom",
        walletAmount: 0,
        customerType: "Platinum"
    },
    {
        customerId: "G1001",
        customerName: "John",
        walletAmount: 2000,
        customerType: "Gold"
    },
    {
        customerId: "S1001",
        customerName: "Steve",
        walletAmount: 4500,
        customerType: "Silver"
    }
]

const flightDb = [
    {
        flightId: "IND-101",
        AircraftName: "Delta Airlines",
        fare: 600,
        availableSeats: 5,
        status: "Running",
        bookings: [
            {
                customerId: "P1001",
                bookingId: 2001,
                noOfTickets: 3,
                bookingCost: 1800
            },
            {
                customerId: "S1001",
                bookingId: 2003,
                noOfTickets: 2,
                bookingCost: 1200
            }
        ]
    },
    {
        flightId: "IND-102",
        AircraftName: "JetBlue",
        fare: 750,
        availableSeats: 20,
        status: "Cancelled",
        bookings: [
            {
                customerId: "P1001",
                bookingId: 2002,
                noOfTickets: 3,
                bookingCost: 2250
            },
            {
                customerId: "G1001",
                bookingId: 2004,
                noOfTickets: 2,
                bookingCost: 1500
            }
        ]
    },
    {
        flightId: "IND-103",
        AircraftName: "United Airlines",
        fare: 800,
        availableSeats: 10,
        status: "Running",
        bookings: [
            {
                customerId: "S1001",
                bookingId: 2005,
                noOfTickets: 1,
                bookingCost: 800
            },
            {
                customerId: "G1001",
                bookingId: 2006,
                noOfTickets: 4,
                bookingCost: 3200
            }
        ]
    }
]


exports.setupDb = () => {
    return collection.getCustomerCollection().then((customer) => {
        return customer.deleteMany().then(() => {
            return customer.insertMany(customerDb).then(() => {
                return collection.getFlightCollection().then((booking) => {
                    return booking.deleteMany().then(() => {
                        return booking.insertMany(flightDb).then((data) => {
                            if (data) return "DB Connected, Insertion Successfull"
                            else {
                                let err = new Error("Insertion failed");
                                err.status = 400;
                                throw err;
                            }
                        })
                    })
                })
            })
        })
    })
}