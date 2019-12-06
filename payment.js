module.exports = function () {
    var express = require('express');
    var app = express.Router();

    /************** functions for payment entity******************/

    function getPayment(res, mysql, context, complete){
        var sql_query = "SELECT payment.payment_ID, payment.booking_ID, payment.payment_amount, " +
                        "DATE_FORMAT(payment.payment_date, '%m/%d/%Y') as payment_date, " + 
                        "payment.payment_description FROM payment LEFT JOIN bookings ON " +
                        "payment.booking_ID = bookings.booking_ID GROUP BY payment.payment_ID " +
                        "ORDER BY payment.payment_ID;";
        mysql.pool.query(sql_query, function(err, result, fields){
            if(err){
                console.log(err);
                res.write(JSON.stringify(err));
                res.end();
            }
            context.payment = result;
            console.log(context.payment);
            complete();
        });
    }

    function getPaymentBookingID(res, mysql, context, complete) {
        mysql.pool.query("SELECT payment.booking_ID AS booking_ID FROM payment " +
                        "ORDER BY payment.booking_ID",
            function (error, results, fields) {
                if (error) {
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.booking_display = results;
                complete();
            });
    }

    function getPaymentByBookings(res, mysql, context, id, complete){
        var query = "SELECT payment.payment_ID, payment.booking_ID, payment.payment_amount, " +
                    "DATE_FORMAT(payment.payment_date, '%m/%d/%Y') as payment_date, " +
                    "payment.payment_description FROM payment LEFT JOIN bookings ON " +
                    "payment.booking_ID = bookings.booking_ID WHERE payment.booking_ID = ? " +
                    "GROUP BY payment.payment_ID ORDER BY payment.payment_ID;";
        console.log(id)
        var inserts = [id]
        mysql.pool.query(query, inserts, function(error, results, fields){
              if(error){
                  res.write(JSON.stringify(error));
                  res.end();
              }
              context.payment = results;
              complete();
          });
    }

    function getUnpaidBookingID(res, mysql, context, complete) {
        mysql.pool.query("SELECT bookings.booking_ID FROM bookings WHERE bookings.booking_ID " +
                         "NOT IN (SELECT payment.booking_ID FROM payment) " +
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
    
    /************** routes for payment entity******************/
    
    app.get('/payment', function(req, res, next){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletePayment.js", "filters.js"];
        var mysql = req.app.get('mysql');
        getPayment(res, mysql, context, complete);
        getPaymentBookingID(res, mysql, context, complete);
        function complete(){
          callbackCount++;
          if(callbackCount >= 2){
            res.render('payment', context);
          }
        }
      });
      app.get('/payment/filter/:id', function(req, res){
              var callbackCount = 0;
              var context = {};
              var mysql = req.app.get('mysql');
              getPaymentBookingID(res, mysql, context, complete);
              getPaymentByBookings(res, mysql, context, req.params.id, complete);
              function complete(){
                  callbackCount++;
                  if(callbackCount >= 2){
                      res.render('payment', context);
                  }
      
              }
      });
      app.delete('/payment/:id', function (req, res) {
          var mysql = req.app.get('mysql');
          var sql = "DELETE FROM payment WHERE payment_ID = ?";
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
      
      app.get('/add-payment', function (req, res) {
         var callbackCount = 0;
          var context = {};
          var mysql = req.app.get('mysql');
          getUnpaidBookingID(res, mysql, context, complete);   
          function complete() {
              callbackCount++;
              if (callbackCount >= 1) {
                  res.render('add-payment', context);
              }
          }
      });
      
      app.post('/add-payment', function(req, res, next){
        console.log(req.body)
        console.log(req.body.booking)
        var mysql = req.app.get('mysql');
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate(); 
        var sql = "INSERT INTO payment(booking_ID, payment_amount, payment_date, " +
                "payment_description) VALUES(?, (SELECT ((t.amount_perAdult*b.number_adults) " +
                "+ (t.amount_perChild*b.number_children) * (DATEDIFF(b.arrival_date, b.departure_date))) " +
                "AS payment_amount FROM bookings b INNER JOIN travel_location t ON b.travelLocation_ID " +
                "= t.travelLocation_ID WHERE booking_ID = ?),?,?);";
        var inserts = [req.body.booking, req.body.booking, date, req.body.payment_description];
        sql = mysql.pool.query(sql,inserts,function(err, result, fields){
            if(err){
                console.log(JSON.stringify(err))
                res.write(JSON.stringify(err));
                res.end();
            }else{
                res.redirect('/payment');
            }
        });
      });
	return app;
}();