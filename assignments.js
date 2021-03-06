module.exports = function () {
    var express = require('express');
    var app = express.Router();

    //gets locations & display in dropdown
    function getLocationDisplay(res, mysql, context, complete) {
        mysql.pool.query("SELECT travel_location.travelLocation_ID as location_ID, " +
                        "CONCAT(travel_location.city, ', ', travel_location.country) AS location_name " +
                        "FROM travel_location",
            function (error, results, fields) {
                if (error) {
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.location_display = results;
                complete();
            });
    }
    //gets guide names & display in dropdown
    function getGuideDisplay(res, mysql, context, complete) {
        mysql.pool.query("SELECT tour_guide.tourGuide_ID as guide_ID, CONCAT(tour_guide.first_name, ' ', tour_guide.last_name) as guide_full_name FROM tour_guide ORDER BY guide_full_name",
            function (error, results, fields) {
                if (error) {
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.guide_display = results;
                complete();
            });
    }
    //gets assigment information to display in table on main assignment page
    function getAssignments(res, mysql, context, complete) {
        var sql_query = "SELECT assignment.tourGuide_travelLocation AS assignment_ID, assignment.booking_ID AS booking_ID, " +
                        "CONCAT(tour_guide.first_name, ' ', tour_guide.last_name) AS guide, " +
                        "CONCAT(travel_location.city, ', ', travel_location.country) AS destination, " +
                        "CONCAT(customers.first_name, ' ', customers.last_name) AS customer, " +
                        "DATE_FORMAT(bookings.departure_date, '%m/%d/%Y') AS departure_date, " +
                        "DATE_FORMAT(bookings.arrival_date, '%m/%d/%Y') AS arrival_date, " +
                        "SUM(bookings.number_adults) AS count_adults, " +
                        "SUM(bookings.number_children) AS count_kids " +
                        "FROM assignment " +
                        "LEFT JOIN tour_guide ON assignment.tourGuide_ID = tour_guide.tourGuide_ID " +
                        "LEFT JOIN travel_location ON assignment.travelLocation_ID = travel_location.travelLocation_ID " +
                        "LEFT JOIN bookings ON assignment.booking_ID = bookings.booking_ID " +
                        "LEFT JOIN customers ON bookings.customer_ID = customers.customer_ID " +
                        "GROUP BY assignment.tourGuide_travelLocation " +
                        "ORDER BY assignment.tourGuide_travelLocation";
        mysql.pool.query(sql_query, function (err, result, fields) {
            if (err) {
                console.log(err);
                res.write(JSON.stringify(err));
                res.end();
            }
            context.assignments = result;
            console.log(context.assignments);
            complete();
        });
    }  
    //gets the assignment information for update
    function getAssignmentUpdate(res, mysql, context, id, complete){
        var sql_query = "SELECT assignment.tourGuide_travelLocation AS assignment_ID, assignment.booking_ID as booking_ID, " +
                        "assignment.tourGuide_ID as guide_ID FROM assignment WHERE tourGuide_travelLocation = ?";
        var inserts = [id];
        mysql.pool.query(sql_query, inserts, function(err, result, fields){
            if(err){
                console.log(err);
                res.write(JSON.stringify(err));
                res.end();
            }
            context.assignment = result[0];
            console.log(context.assignment);
            complete();
        });
      } 
    //gets booking ID numbers for dropdown 
    function getBookingID(res, mysql, context, complete) {
        mysql.pool.query("SELECT bookings.booking_ID AS booking_ID FROM bookings " +
                        "ORDER BY bookings.booking_ID",
            function (error, results, fields) {
                if (error) {
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.booking_display = results;
                complete();
            });
    }
    //gets bookingID that has not been assigned yet
    function getUnassignedBookingID(res, mysql, context, complete) {
        mysql.pool.query("SELECT bookings.booking_ID FROM bookings WHERE bookings.booking_ID " +
                         "NOT IN (SELECT assignment.booking_ID FROM assignment) " +
                         "ORDER BY bookings.booking_ID",
                function (error, results, fields) {
                if (error) {
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.booking_display = results;
                complete();
            });
    }

    //main assignment page
    app.get('/', function (req, res) {
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteAssignment.js", "filters.js", "update.js"]
        var mysql = req.app.get('mysql');
        getBookingID(res, mysql, context, complete);
        getGuideDisplay(res, mysql, context, complete);
        getLocationDisplay(res, mysql, context, complete);
        getAssignments(res, mysql, context, complete)
        function complete() {
            callbackCount++;
            if (callbackCount >= 4) {
                res.render('assignments', context);
            }
        }
    });
    app.post('/', function (req, res) {
        res.render('assignments');
    });
    //adds assignment to database
    app.post('/add-assignment', function (req, res, next) {
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO assignment (booking_ID, travelLocation_ID, tourGuide_ID) " +
                    "VALUES(?, (SELECT bookings.travelLocation_ID FROM bookings WHERE booking_ID=?),?);";
        var inserts = [req.body.booking, req.body.booking, req.body.tour_guide];
        sql = mysql.pool.query(sql, inserts, function (err, result, fields) {
            if (err) {
                console.log(JSON.stringify(err))
                res.write(JSON.stringify(err));
                res.end();
            } else {
                res.redirect('/assignments');
            }
        });
    });
    //displays add assignment page
    app.get('/add-assignment', function (req, res) {
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getUnassignedBookingID(res, mysql, context, complete);
        getGuideDisplay(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 2) {
                res.render('add-assignment', context);
            }
        }
    });
    //deletes assignment of specified ID
    app.delete('/:id', function (req, res) {
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM assignment WHERE tourGuide_travelLocation = ?";
        var inserts = [req.params.id];
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {
                console.log(error)
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            } else {
                res.status(202).end();
            }
        })
    })

    //UPDATE ASSIGNMENT
    app.get('/:id', function (req, res) {
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["update.js", "selectors.js", "filters.js"]
        var mysql = req.app.get('mysql');
        getAssignmentUpdate(res, mysql, context, req.params.id, complete);
        getBookingID(res, mysql, context, complete);
        getGuideDisplay(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 3) {
                res.render('update-assignment', context);
            }
        }
    });
    //updates assignemnt in database
    app.put('/:id', function (req, res) {
        var mysql = req.app.get('mysql');
	var sql = "UPDATE assignment SET booking_ID=?, tourGuide_ID=IF(?='NULL', NULL,?), " +
            "travelLocation_ID=(SELECT bookings.travelLocation_ID FROM bookings WHERE booking_ID=?) WHERE tourGuide_travelLocation=?";
       var inserts = [req.body.hidden_display, req.body.guide_display, req.body.guide_display, req.body.hidden_display, req.params.id];
	console.log(inserts);
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.status(200);
                res.end();
            }
        });
    });
    
    return app;
}();
