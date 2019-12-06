module.exports = function () {
    var express = require('express');
    var app = express.Router();

    /************** functions for rating entity******************/

    function getRating(res, mysql, context, complete){
        var sql_query = "SELECT ratings.rating_ID, ratings.travelLocation_ID, " +
                        "travel_location.city, ratings.customer_ID, " +
                        "CONCAT(customers.first_name, ' ', customers.last_name) " +
                        "AS customer_name, ratings.rating, ratings.review FROM " +
                        "ratings LEFT JOIN travel_location ON ratings.travelLocation_ID = " +
                        "travel_location.travelLocation_ID LEFT JOIN customers ON " +
                        "ratings.customer_ID = customers.customer_ID GROUP BY ratings.rating_ID " +
                        "ORDER BY ratings.rating_ID;";
        mysql.pool.query(sql_query, function(err, result, fields){
            if(err){
                console.log(err);
                res.write(JSON.stringify(err));
                res.end();
            }
            context.rating = result;
            console.log(context.rating);
            complete();
        });
    }

    function getRatingByRating(res, mysql, context, id, complete){
        var query = "SELECT ratings.rating_ID, ratings.travelLocation_ID, travel_location.city, " +
                    "ratings.customer_ID, CONCAT(customers.first_name, ' ', customers.last_name) " +
                    "AS customer_name, ratings.rating, ratings.review FROM ratings " +
                    "LEFT JOIN travel_location ON ratings.travelLocation_ID = travel_location.travelLocation_ID " +
                    "LEFT JOIN customers ON ratings.customer_ID = customers.customer_ID " +
                    "WHERE ratings.rating = ? GROUP BY ratings.rating_ID ORDER BY ratings.rating_ID;";
        console.log(id)
        var inserts = [id]
        mysql.pool.query(query, inserts, function(error, results, fields){
              if(error){
                  res.write(JSON.stringify(error));
                  res.end();
              }
              context.rating = results;
              complete();
          });
    }

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

    /************** routes for rating entity ********************/

    app.get('/rating', function (req, res, next) {
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["filters.js"];
        var mysql = req.app.get('mysql');
        getRating(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                res.render('rating', context);
            }
        }
    });
    app.get('/rating/filterRating/:id', function(req, res){
            var callbackCount = 0;
            var context = {};
            var mysql = req.app.get('mysql');
            getRatingByRating(res, mysql, context, req.params.id, complete);
            function complete(){
                callbackCount++;
                if(callbackCount >= 1){
                    res.render('rating', context);
                }
    
            }
    });
    app.get('/add-rating', function(req, res, next){
      var callbackCount = 0;
      var context = {};
      var mysql = req.app.get('mysql');
      getCity(res, mysql, context, complete);
      getCustomerName(res, mysql, context, complete);
      function complete(){
        callbackCount++;
        if(callbackCount >= 2){
          res.render('add-rating', context);
        }
      }
    });
    
    app.post('/add-rating', function(req, res, next){
      console.log(req.body)
      var mysql = req.app.get('mysql');
      var sql = "INSERT INTO ratings(customer_ID, travelLocation_ID, rating, review) " +
                "VALUES(?,?,?,?)";
      console.log(req.body.customer_name)
      console.log(req.body.city_name)
      console.log(req.body.select_rating)
      
      var inserts = [req.body.customer_name, req.body.city_name, req.body.select_rating, req.body.review];
      sql = mysql.pool.query(sql, inserts, function(err, result, fields){
          if(err){
              console.log(JSON.stringify(err))
              res.write(JSON.stringify(err));
              res.end();
          }else{
              console.log("redirecting")
              res.redirect('/rating');
          }
      });
    });
	return app;
}();