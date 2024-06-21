const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const path = require("path");
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// Set up views directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.MY_SQL_HOST,
    user: process.env.MY_SQL_USER,
    password: process.env.MY_SQL_PASSWORD,
    database: process.env.MY_SQL_DATABASE
});

// Render payment page
router.post('/', (req, res) => {
    const { flightID, selectedSeats } = req.body;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        connection.query('SELECT * FROM seats WHERE flightID = ?', [flightID], (err, seatResults) => {
            if (err) {
                connection.release();
                console.error('Error retrieving seat availability:', err);
                res.status(500).send('Failed to retrieve seat availability');
                return;
            }

            console.log('Seats:', seatResults);

            const seatsAvailability = seatResults.reduce((availability, seat) => {
                availability[seat.seat_class] = availability[seat.seat_class] || {};
                availability[seat.seat_class][seat.seat_id] = seat.availability;
                return availability;
            }, {});

            connection.query('SELECT * FROM Pricing WHERE flightID = ?', [flightID], (err, pricingResults) => {
                if (err) {
                    connection.release();
                    console.error('Error retrieving pricing:', err);
                    res.status(500).send('Failed to retrieve pricing');
                    return;
                }

                console.log('Pricing:', pricingResults);

                const pricing = pricingResults.reduce((priceMap, row) => {
                    priceMap[row.seat_class] = row.price;
                    return priceMap;
                }, {});

                console.log('Pricing Map:', pricing);

                // Calculate total price for selected seats
                let totalPrice = 0;
                selectedSeats.forEach(seatId => {
                    const seat = seatResults.find(row => row.seat_id === parseInt(seatId));
                    console.log('Selected Seat:', seat);
                    if (seat) {
                        const seatClass = seat.seat_class;
                        totalPrice += pricing[seatClass];
                    }
                });

                console.log('Total Price:', totalPrice);

                connection.release();
                res.render('payment', { details: req.body, seatsAvailability, pricing, totalPrice });
            });
        });
    });
});



let user;

// Process payment
router.post('/paymentdone', (req, res) => {
    console.log(req.body);
    const { flightID, selectedSeats } = req.body;

    pool.query('select * from active',[],(err,result)=>{
        if(err){
            throw err;
        }
        else{
            console.log
            user=result[0].username;
        }
    })

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        connection.beginTransaction((err) => {
            if (err) {
                connection.release();
                console.error('Error starting transaction:', err);
                res.status(500).send('Failed to start transaction');
                return;
            }

            // Find the maximum booking ID
            let cur_bid;
            connection.query('SELECT MAX(booking_id) AS max_bid FROM booking', (err, results) => {
                if (err) {
                    handleError(connection, err, 'Error retrieving maximum booking ID', res);
                    return;
                }

                // Set the initial value to 0 if the result is NULL
                cur_bid = results[0].max_bid !== null ? parseInt(results[0].max_bid) + 1 : 1;

                // Insert new booking details into the booking table
                const today = new Date().toISOString().slice(0, 10); // Assuming you have the username available

                const sqlInsertBooking = `INSERT INTO booking (booking_id, booking_date, user_name) VALUES (?, ?, ?)`;
                connection.query(sqlInsertBooking, [cur_bid, today, user], (err, results) => {
                    if (err) {
                        handleError(connection, err, 'Error inserting booking details', res);
                        return;
                    }

                    console.log(`New booking inserted with booking ID: ${cur_bid}`);
                    processPassengersAndTickets(connection, flightID, selectedSeats, req.body, cur_bid, res);
                });
            });
        });
    });
});

function processPassengersAndTickets(connection, flightID, selectedSeats, requestBody, cur_bid, res) {
    // Loop through selected seats
    const promises = selectedSeats.map((seatId, i) => {
        return new Promise((resolve, reject) => {
            const name = requestBody[`passengerName_${seatId}`];
            const email = requestBody[`passengerEmail_${seatId}`];
            const phone = requestBody[`passengerPhone_${seatId}`];

            // Log passenger details
            console.log("Seat ID:", seatId);
            console.log("Passenger Name:", name);
            console.log("Passenger Email:", email);
            console.log("Passenger Phone:", phone);

            // Find the maximum passenger ID
            let cur_pid;
            connection.query('SELECT MAX(passenger_id) AS max_pid FROM passenger', (err, results) => {
                if (err) {
                    handleError(connection, err, 'Error retrieving maximum passenger ID', res);
                    reject(err);
                    return;
                }

                cur_pid = results[0].max_pid !== null ? parseInt(results[0].max_pid) + 1 + i : 1 + i;

                // Find the maximum ticket ID
                let cur_tid;
                connection.query('SELECT MAX(ticket_id) AS max_tid FROM ticket', (err, results) => {
                    if (err) {
                        handleError(connection, err, 'Error retrieving maximum ticket ID', res);
                        reject(err);
                        return;
                    }

                    cur_tid = results[0].max_tid !== null ? parseInt(results[0].max_tid) + 1 + i : 1 + i;

                    // Find necessary details using seat id
                    let flight_no, ticket_type, ticket_price;
                    connection.query('SELECT flightID, seat_class FROM seats where seat_id = ?', [seatId], (err, results) => {
                        if (err) {
                            handleError(connection, err, 'Error retrieving flightID and seat class', res);
                            reject(err);
                            return;
                        }

                        flight_no = results[0].flightID;
                        ticket_type = results[0].seat_class;

                        connection.query('SELECT price FROM Pricing where flightID=? and seat_class=?', [flight_no, ticket_type], (err, results) => {
                            if (err) {
                                handleError(connection, err, 'Error retrieving price', res);
                                reject(err);
                                return;
                            }

                            ticket_price = results[0].price;

                            // Insert passenger details into the passenger table
                            const sqlInsertPassenger = `INSERT INTO passenger VALUES (?, ?, ?, ?)`;
                            connection.query(sqlInsertPassenger, [cur_pid, name, email, phone], (err, results) => {
                                if (err) {
                                    handleError(connection, err, 'Error inserting passenger details', res);
                                    reject(err);
                                    return;
                                }

                                // Insert ticket details
                                const sqlInsertTicket = `INSERT INTO ticket VALUES (?, ?, ?, ?,?,?)`;
                                connection.query(sqlInsertTicket, [cur_tid, ticket_price, ticket_type, cur_bid, cur_pid, flight_no], (err, results) => {
                                    if (err) {
                                        handleError(connection, err, 'Error inserting ticket details', res);
                                        reject(err);
                                        return;
                                    }

                                    // Insert book seats details
                                    const sqlInsertBookSeats = `INSERT INTO book_seats VALUES (?, ?)`;
                                    connection.query(sqlInsertBookSeats, [seatId, cur_pid], (err, results) => {
                                        if (err) {
                                            handleError(connection, err, 'Error inserting book_seat details', res);
                                            reject(err);
                                            return;
                                        }

                                        console.log('Passenger, ticket, and book seats details inserted successfully');
                                        resolve();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    Promise.all(promises)
        .then(() => {
            // Update seat availability in the database
            const sql = `UPDATE seats SET availability = 0 WHERE flightID = ? AND seat_id IN (?)`;
            connection.query(sql, [flightID, selectedSeats], (err, results) => {
                if (err) {
                    handleError(connection, err, 'Error updating seat availability', res);
                    return;
                }

                console.log(`Updated availability for ${results.affectedRows} seats`);
                connection.commit((err) => {
                    if (err) {
                        handleError(connection, err, 'Error committing transaction', res);
                        return;
                    }
                    connection.release();
                    res.send("Payment successful");
                });
            });
        })
        .catch((err) => {
            handleError(connection, err, 'Error processing passengers and tickets', res);
        });
}

function handleError(connection, err, message, res) {
    connection.rollback(() => {
        connection.release();
        console.error(message + ':', err);
        res.status(500).send(message);
    });
}

module.exports = router;