module.exports = function () {
    var express = require('express');
    var app = express.Router();

    //gets locations for dropdown display
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
    //gets location information for main table display
    function getLocation(res, mysql, context, complete) {
        var sql_query = "SELECT travel_location.travelLocation_ID AS location_ID, travel_location.city AS city, travel_location.country as country, " +
                        "FORMAT(travel_location.amount_perAdult, 2) AS price_adult, FORMAT(travel_location.amount_perChild,2) AS price_child, " +
                        "COUNT(bookings.booking_ID) AS count_bookings, COUNT(tour_guide.tourGuide_ID) AS count_guides, " +
                        "SUM(number_adults) + SUM(number_children) AS adults_kids, " +
                        "ROUND(AVG(ratings.rating),2) AS ave_review " +
                        "FROM travel_location " +
                        "LEFT JOIN bookings ON travel_location.travelLocation_ID = bookings.travelLocation_ID " +
                        "LEFT JOIN assignment ON bookings.booking_ID = assignment.booking_ID " +
                        "LEFT JOIN tour_guide ON assignment.tourGuide_ID = tour_guide.tourGuide_ID " +
                        "LEFT JOIN customers ON bookings.customer_ID = customers.customer_ID " +
                        "LEFT JOIN ratings ON customers.customer_ID = ratings.customer_ID " +
                        "GROUP BY travel_location.travelLocation_ID " +
                        "ORDER BY travel_location.travelLocation_ID";
        mysql.pool.query(sql_query, function (err, result, fields) {
            if (err) {
                console.log(err);
                res.write(JSON.stringify(err));
                res.end();
            }
            context.location = result;
            console.log(context.locations);
            complete();
        });
    }
    //gets information on specific location to dispaly for update
    function getLocationUpdate(res, mysql, context, id, complete) {
        var sql = "SELECT travel_location.travelLocation_ID AS location_ID, travel_location.city AS city, travel_location.country as country, " +
                    "travel_location.amount_perAdult AS price_adult, travel_location.amount_perChild AS price_child " +
                    "FROM travel_location WHERE travelLocation_ID = ?"
        var inserts = [id];
        mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            context.location = results[0];
            complete();
        });
    }
    //searches database for location based on user input by country
    function getLocationsByCountry(req, res, mysql, context, complete) {
        var query = "SELECT travel_location.travelLocation_ID AS location_ID, travel_location.city AS city, travel_location.country as country, " +
                "FORMAT(travel_location.amount_perAdult, 2) AS price_adult, FORMAT(travel_location.amount_perChild,2) AS price_child, " +
                "COUNT(bookings.booking_ID) AS count_bookings, COUNT(tour_guide.tourGuide_ID) AS count_guides, " +
                "SUM(number_adults) + SUM(number_children) AS adults_kids, " +
                "ROUND(AVG(ratings.rating),2) AS ave_review " +
                "FROM travel_location " +
                "LEFT JOIN bookings ON travel_location.travelLocation_ID = bookings.travelLocation_ID " +
                "LEFT JOIN assignment ON bookings.booking_ID = assignment.booking_ID " +
                "LEFT JOIN tour_guide ON assignment.tourGuide_ID = tour_guide.tourGuide_ID " +
                "LEFT JOIN customers ON bookings.customer_ID = customers.customer_ID " +
                "LEFT JOIN ratings ON customers.customer_ID = ratings.customer_ID " +
                "WHERE travel_location.country LIKE " + mysql.pool.escape(req.params.s + '%') +
                "GROUP BY travel_location.travelLocation_ID " +
                "ORDER BY travel_location.travelLocation_ID";
        console.log(query);
        mysql.pool.query(query, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            context.location = results;
            console.log(results);
            complete();
        });
    }
    //main location page
    app.get('/', function (req, res) {
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["update.js", "filters.js", "selectors.js"];
        var mysql = req.app.get('mysql');
        getLocationDisplay(res, mysql, context, complete);
        getLocation(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 2) {
                res.render('locations', context);
            }
        }
    });
    app.post('/', function (req, res) {
        res.render('locations');
    });
    //adds new location into database
    app.post('/add-location', function (req, res, next) {
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO travel_location (city, country) VALUES(?,?);";
        var inserts = [req.body.city, req.body.country];
        sql = mysql.pool.query(sql, inserts, function (err, result, fields) {
            if (err) {
                console.log(JSON.stringify(err))
                res.write(JSON.stringify(err));
                res.end();
            } else {
                res.redirect('/locations');
            }
        });
    });
    app.get('/add-location', function (req, res) {
        res.render('add-location');
    });
    app.get('/:id', function (req, res) {
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["update.js", "filters.js", "selectors.js"];
        var mysql = req.app.get('mysql');
        getLocationUpdate(res, mysql, context, req.params.id, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                res.render('update-location', context);
            }
        }
    });
    app.put('/:id', function (req, res) {
        var mysql = req.app.get('mysql');
        var sql = "UPDATE travel_location SET amount_perAdult=?, amount_perChild=? WHERE travelLocation_ID=?";
        var inserts = [req.body.price_adult, req.body.price_child, req.params.id];
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
    //TO DO
    app.get('/search/:s', function (req, res) {
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["update.js", "filters.js", "selectors.js"];
        var mysql = req.app.get('mysql');
        getLocationsByCountry(req, res, mysql, context, complete);
        console.log(context);
        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                res.render('locations', context);
            }
        }
    });

    return app;
}();
