/*Based on CS340 Sample App Code from https://github.com/knightsamar/cs340_sample_nodejs_app*/

module.exports = function () {
    var express = require('express');
    var mysql = require('./dbcon.js');
    var bodyParser = require('body-parser');
    var router = express.Router();
    var app = express();
    var handlebars = require('express-handlebars').create({ defaultLayout: 'main' });

    /*Search & return all location*/
    function getLocationsDetails(req, res, mysql, context, complete) {
        var sql = ("SELECT travel_location.travelLocation_ID AS 'location_ID', travel_location.city AS 'city', travel_location.country as 'country'," +
                    "COUNT(bookings.booking_ID) AS 'count_bookings', COUNT(tour_guide.tourGuide_ID) AS 'count_guides'," +
                    "SUM(number_adults) + SUM(number_children) AS 'adults_kids'," +
                    "ROUND(AVG(ratings.rating),2) AS 'ave_review'" +
                    "FROM travel_location " +
                    "LEFT JOIN bookings ON travel_location.travelLocation_ID = bookings.travelLocation_ID" +
                    "LEFT JOIN assignment ON bookings.booking_ID = assignment.booking_ID" +
                    "LEFT JOIN tour_guide ON assignment.tourGuide_ID = tour_guide.tourGuide_ID" +
                    "LEFT JOIN customers ON bookings.customer_ID = customers.customer_ID" +
                    "LEFT JOIN ratings ON customers.customer_ID = ratings.customer_ID" +
                    "WHERE travel_location.travelLocation_ID = ISNULL(?,travel_location.travelLocation_ID)" +
                    "GROUP BY travel_location.travelLocation_ID" +
                    "ORDER BY travel_location.travelLocation_ID")
        console.log(req.params)
        var inserts = [req.params.location];
        console.log(query);
        mysql.pool.query(query, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            context.location = results;
            complete();
        });
    }

    /*display all locations*/
    app.get('/locations', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["scripts.js"];
        var mysql = req.app.get('mysql');
        getLocations(res, mysql, context, complete);
        getLocationsDetails(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('locations', context);
            }
        }
    });

    /* Adds a new location*/
    app.post('/', function(req, res){
        console.log(req.body.location)
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO travel_location (city, country) VALUES (?,?)";
        var inserts = [req.body.city, req.body.country];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/locations', context);
            }
        });
    });

    return app;
}();
