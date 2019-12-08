module.exports = function () {
    var express = require('express');
    var app = express.Router();

    /************** functions for booking entity ******************/
   //function to get customer name in the dropdown 
   function getCustomerName(res, mysql, context, complete) {
        mysql.pool.query("SELECT customer_ID, CONCAT(first_name, ' ', last_name) " +
                        "AS customer_name FROM customers ORDER BY customer_ID",
            function (error, results, fields) {
                if (error) {
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.customer_display = results;
                complete();
            });
    }
    //function to display bookings in the table
    function getBooking(res, mysql, context, complete){
        var sql_query = "SELECT bookings.booking_ID as booking_ID, " +
                        "DATE_FORMAT(bookings.booking_date, '%m/%d/%Y') as booking_date, " +
                        "DATE_FORMAT(bookings.departure_date, '%m/%d/%Y') as departure_date, " +
                        "DATE_FORMAT(bookings.arrival_date, '%m/%d/%Y') as arrival_date, " +
                        "bookings.number_adults as number_adults, " +
                        "bookings.number_children as number_children, " +
                        "bookings.travelLocation_ID as travelLocation_ID, " +
                        "bookings.customer_ID as customer_ID FROM bookings " +
                        "LEFT JOIN travel_location ON bookings.travelLocation_ID = travel_location.travelLocation_ID " +
                        "LEFT JOIN customers ON bookings.customer_ID = customers.customer_ID " +
                        "GROUP BY bookings.booking_ID " +
                        "ORDER BY bookings.booking_ID;";
        mysql.pool.query(sql_query, function(err, result, fields){
            if(err){
                console.log(err);
                res.write(JSON.stringify(err));
                res.end();
            }
            context.booking = result;
            console.log(context.booking);
            complete();
        });
    }
    //function to display the bookings in the table filtered based on the customer name
    function getBookingByCustomer(res, mysql, context, id, complete){
        var query = "SELECT bookings.booking_ID as booking_ID, " +
                    "DATE_FORMAT(bookings.booking_date, '%m/%d/%Y') as booking_date, " +
                    "DATE_FORMAT(bookings.departure_date, '%m/%d/%Y') as departure_date, " +
                    "DATE_FORMAT(bookings.arrival_date, '%m/%d/%Y') as arrival_date, " +
                    "bookings.number_adults as number_adults, bookings.number_children " +
                    "as number_children, bookings.travelLocation_ID as travelLocation_ID, " +
                    "bookings.customer_ID as customer_ID FROM bookings " +
                    "LEFT JOIN travel_location ON bookings.travelLocation_ID = travel_location.travelLocation_ID " +
                    "LEFT JOIN customers ON bookings.customer_ID = customers.customer_ID " +
                    "WHERE customers.customer_ID = ? " +
                    "GROUP BY bookings.booking_ID " +
                    "ORDER BY bookings.booking_ID";
        console.log(id)
        var inserts = [id]
        mysql.pool.query(query, inserts, function(error, results, fields){
              if(error){
                  res.write(JSON.stringify(error));
                  res.end();
              }
              context.booking = results;
              complete();
          });
    }
    //function to get the city names in the dropdown
    function getCity(res, mysql, context, complete) {
        mysql.pool.query("SELECT travelLocation_ID, city FROM travel_location " +
                        "ORDER BY travelLocation_ID",
            function (error, results, fields) {
                if (error) {
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.city_display = results;
                complete();
            });
    }

    /************** routes for booking entity **********************/

    //renders booking page
    app.get('/', function (req, res, next) {
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteBooking.js", "filters.js"];
        var mysql = req.app.get('mysql');
        getCustomerName(res, mysql, context, complete);
        getBooking(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 2) {
                res.render('booking', context);
            }
        }
    });

    //delete the specific booking using :id
    app.delete('/:id', function (req, res) {
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM bookings WHERE booking_ID = ?";
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
        });
    });
    
    //filter the bookings using customer name
    app.get('/filter/:id', function(req, res){
            var callbackCount = 0;
            var context = {};
            var mysql = req.app.get('mysql');
            getCustomerName(res, mysql, context, complete);
            getBookingByCustomer(res, mysql, context, req.params.id, complete);
            function complete(){
                callbackCount++;
                if(callbackCount >= 2){
                    res.render('booking', context);
                }
    
            }
    });
    
    //renders add-booking page
    app.get('/add-booking', function (req, res) {
       var callbackCount = 0;
        var context = {};
	context.jsscripts = ["checkForm.js"];
        var mysql = req.app.get('mysql');
        getCustomerName(res, mysql, context, complete); 
        getCity(res, mysql, context, complete);  
        function complete() {
            callbackCount++;
            if (callbackCount >= 2) {
                res.render('add-booking', context);
            }
        }
    });
    //adds the booking to the database and redirects to booking page
    app.post('/add-booking', function(req, res, next){
    console.log(req.body)
      var mysql = req.app.get('mysql');
      var today = new Date();
      var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      var sql = "INSERT INTO bookings(customer_ID, travelLocation_ID, booking_date, " +
                "departure_date, arrival_date, number_adults, number_children) " +
                "VALUES(?, ?, ?, ?, ?, ?, ?);";
      var inserts = [req.body.customer_name, req.body.city_name, date, req.body.departure_date, req.body.arrival_date, req.body.number_adults, req.body.number_children];
      sql = mysql.pool.query(sql,inserts,function(err, result, fields){
          if(err){
              console.log(JSON.stringify(err))
              res.write(JSON.stringify(err));
              res.end();
          }else{
              res.redirect('/booking');
          }
      });
    });
	return app;
}();
