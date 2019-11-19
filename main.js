/*
    Uses express, dbcon for database connection, body parser to parse form data
    handlebars for HTML templates
*/

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

var mysql = require('./dbcon.js');
app.set('mysql', mysql);

app.set('port', process.argv[2]);

app.use(express.static('public'));

/*function searchCustomer(res, mysql, context, complete) {
  var sql = 'SELECT customers.customer_ID as customer_ID, customers.first_name as first_name, customers.middle_name as middle_name, customers.last_name as last_name,customers.street_no as street_no, customers.city as city, customers.state as state, customers.country as country,customers.phone_number as phone_number, customers.email_id as email_id, COUNT(bookings.booking_ID) AS numberofbookings,COUNT(ratings.rating_ID) AS numberofreviews FROM customers LEFT JOIN bookings ON customers.customer_ID = bookings.customer_ID LEFT JOIN ratings ON customers.customer_ID = ratings.rating_ID WHERE customer.email_id = ?';
  var parameters = [context.email_id];
  mysql.pool.query(sql, parameters, function(error, results, fields){
  if(error){
    res.write(JSON.stringify(error));
    res.end();
  }
  context.customers = results[0];
  complete();
  });
}*/

function getCustomer(res, mysql, context, complete){
  var sql_query = "SELECT customers.customer_ID as customer_ID, customers.first_name as first_name, customers.middle_name as middle_name, customers.last_name as last_name,customers.street_no as street_no, customers.city as city, customers.state as state, customers.country as country,customers.phone_number as phone_number, customers.email_id as email_id, COUNT(bookings.booking_ID) AS numberofbookings,COUNT(ratings.rating_ID) AS numberofreviews FROM customers LEFT JOIN bookings ON customers.customer_ID = bookings.customer_ID LEFT JOIN ratings ON customers.customer_ID = ratings.rating_ID GROUP BY customers.customer_ID ORDER BY customers.customer_ID;";
  mysql.pool.query(sql_query, function(err, result, fields){
      if(err){
          console.log(err);
          res.write(JSON.stringify(err));
          res.end();
      }
      context.customer = result;
      console.log(context.customer);
      complete();
  });
}

function getBooking(res, mysql, context, complete){
  var sql_query = "SELECT bookings.booking_ID as booking_ID, bookings.booking_date as booking_date, bookings.departure_date as departure_date, bookings.arrival_date as arrival_date, bookings.number_adults as number_adults, bookings.number_children as number_children, bookings.travelLocation_ID as travelLocation_ID, bookings.customer_ID as customer_ID FROM bookings LEFT JOIN travel_location ON bookings.travelLocation_ID = travel_location.travelLocation_ID LEFT JOIN customers ON bookings.customer_ID = customers.customer_ID GROUP BY bookings.booking_ID ORDER BY bookings.booking_ID;";
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
function getGuideDetails(req, res, mysql, context, complete) {
        var sql = ("SELECT tour_guide.tourGuide_ID AS 'guide_ID," +
                    "tour_guide.first_name AS 'first_name', tour_guide.last_name AS 'last_name'," +
                    "COUNT(assignment.tourGuide_travelLocation) AS 'count_assignment'," +
                    "COUNT(travel_location.travelLocation_ID) AS 'count_locations'" +
                    "FROM tour_guide" +
                    "WHERE tour_guide.tourGuide_ID = ISNULL(?, tour_guide.tourGuide_ID)" +
                    "LEFT JOIN assignment ON tour_guide.tourGuide_ID = assignment.tourGuide_ID" +
                    "LEFT JOIN travel_location ON assignment.travelLocation_ID = travel_location.travelLocation_ID" +
                    "GROUP BY tour_guide.tourGuide_ID" +
                    "ORDER BY tour_guide.tourGuide_ID")
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

function getPayment(res, mysql, context, complete){
  var sql_query = "SELECT payment.payment_ID, payment.booking_ID, payment.payment_amount, payment.payment_date, payment.payment_description FROM payment LEFT JOIN bookings ON payment.booking_ID = bookings.booking_ID GROUP BY payment.payment_ID ORDER BY payment.payment_ID;";
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

function getRating(res, mysql, context, complete){
  var sql_query = "SELECT ratings.rating_ID, ratings.travelLocation_ID, travel_location.city AS 'Travel Location', ratings.customer_ID, CONCAT(customers.first_name, ' ', customers.last_name) AS 'Customer Name', ratings.rating, ratings.review FROM ratings LEFT JOIN travel_location ON ratings.travelLocation_ID = travel_location.travelLocation_ID LEFT JOIN customers ON ratings.customer_ID = customers.customer_ID GROUP BY ratings.rating_ID ORDER BY ratings.rating_ID;";
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

function selectLocation(res, mysql, context, complete) {
  mysql.pool.query("SELECT city as location FROM travel_location", function(err, result, fields){
      if(err){
          res.write(JSON.stringify(err));
          res.end();
      }
      context.locations  = result;
      complete();
  });
}
function getLocations(res, mysql, context, complete) {
    mysql.pool.query("SELECT travel_location.travelLocation_ID as location_ID," + 
                    "CONCAT(travel_location.city, ', ', travel_location.country) AS location_name" +
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

function selectLocation(id) {
    $("#location-selector").val(id);
}
function filterLocations() {
    //get the id of the selected location from the filter dropdown
        var location_ID = document.getElementById('location_filter').value
    //        //construct the URL and redirect to it
                window.location = '/locations/filter/' + parseInt(location_ID)
}
function getGuides(res, mysql, context, complete) {
    mysql.pool.query("SELECT tour_guide.tourGuide_ID AS tour_guide_ID," +
                    "CONCAT(tour_guide.first_name, ' ', tour_guide.last_name) as guide_full_name" +
                    "FROM tour_guide",
        function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            context.location_display = results;
            complete();
        });
}

function selectGuide(id) {
    $("#guide-selector").val(id);
}
function filterGuide() {
    //get the id of the selected location from the filter dropdown
        var guide_ID = document.getElementById('guide_filter').value
    //        //construct the URL and redirect to it
                window.location = '/guide/filter/' + parseInt(guide_ID)
}
app.get('/', function(req, res, next){
  // Render the homepage.
  res.render('home');
});

app.get('/home', function(req, res, next) {
  res.render('home.handlebars');
});
 
app.get('/customer', function(req, res, next){
  var callbackCount = 0;
  var context = {};
  var mysql = req.app.get('mysql');
  getCustomer(res, mysql, context, complete);
  function complete(){
    callbackCount++;
    if(callbackCount >= 1){
      res.render('customer', context);
    }
  }
});

app.get('/booking', function(req, res, next){
  var callbackCount = 0;
  var context = {};
  var mysql = req.app.get('mysql');
  getBooking(res, mysql, context, complete);
  function complete(){
    callbackCount++;
    if(callbackCount >= 1){
      res.render('booking', context);
    }
  }
});
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

app.get('/tour_guides', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["scripts.js"];
        var mysql = req.app.get('mysql');
        getGuides(res, mysql, context, complete);
        getGuideDetails(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('guides', context);
            }
        }
    });

app.get('/payment', function(req, res, next){
  var callbackCount = 0;
  var context = {};
  var mysql = req.app.get('mysql');
  getPayment(res, mysql, context, complete);
  function complete(){
    callbackCount++;
    if(callbackCount >= 1){
      res.render('payment', context);
    }
  }
});

app.get('/rating', function(req, res, next){
  var callbackCount = 0;
  var context = {};
  var mysql = req.app.get('mysql');
  getRating(res, mysql, context, complete);
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
  selectLocation(res, mysql, context, complete);
  function complete(){
    callbackCount++;
    if(callbackCount >= 1){
      res.render('rating', context);
    }
  }
});
app.get('/add-customer', function(req, res) {
  res.render('add-customer.handlebars')
});
app.get('/add-booking', function(req, res) {
  res.render('add-booking.handlebars');
});
app.get('/add-payment', function(req, res) {
  res.render('add-payment.handlebars');
});
app.get('/add-rating', function(req,res) {
  res.render('add-rating.handlebars');
});	

app.post('/add-customer', function(req, res, next) {
  console.log(req.body)
  var mysql = req.app.get('mysql');
  var sql = "INSERT INTO customer (first_name, last_name, middle_name, street_no, city, state, country, postal_code, phone_number, email_id, passport_number, passport_countryofissue, passport_expirydate) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
  var inserts = [req.body.first_name, req.body.last_name, req.body.middle_name, req.body.street_no, req.body.city, req.body.state, req.body.country, req.body.postal_code, req.body.phone_number, req.body.email_id, req.body.passport_number, req.body.passport_countryofissue, req.body.passport_expirydate];
  sql = mysql.pool.query(sql,inserts,function(err, result, fields){
      if(err){
          console.log(JSON.stringify(err))
          res.write(JSON.stringify(err));
          res.end();
      }else{
          res.redirect('/customer');
      }
  });
});

app.post('/add-booking', function(req, res, next){
console.log(req.body)
  var mysql = req.app.get('mysql');
  var sql = "INSERT INTO bookings(customer_ID, travelLocation_ID, departure_date, arrival_date, number_adults, number_children) VALUES(?, (SELECT travelLocation_ID FROM travel_location WHERE city = ?),?, ?, ?, ?);";
  var inserts = [req.body.customer_ID, req.body.travelLocation, req.body.departure_date, req.body.arrival_date, req.body.number_adults, req.body.number_children];
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

app.post('/add-payment', function(req, res, next){
  console.log(req.body)
  var mysql = req.app.get('mysql');
  var sql = "INSERT INTO payment(booking_ID, payment_amount, payment_date, payment_description) VALUES(?, SELECT ((t.amount_perAdult*b.number_adults) + (t.amount_perChild*b.number_children) * (DATEDIFF(b.arrival_date, b.departure_date)) AS payment_amount FROM bookings b INNER JOIN travel_location t ON b.travelLocation_ID = t.travelLocation_ID WHERE booking_ID = ?;),?,?);";
  var inserts = [req.body.booking_ID, req.body.booking_ID, req.body.payment_date, req.body.payment_description];
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

app.post('/', function(req, res){
        console.log(req.body.location)
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO tour_guide (first_name, last_name) VALUES (?,?)";
        var inserts = [req.body.first_name, req.body.last_name];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/guides', context);
            }
        });
    });

app.post('/add-rating', function(req, res, next){
  console.log(req.body)
  var mysql = req.app.get('mysql');

  var sql = "INSERT INTO ratings(customer_ID, travelLocation_ID, rating, review) VALUES(?, (SELECT travelLocation_ID FROM travel_location WHERE city = ?),?,?);";
  var inserts = [req.body.customer_ID, req.body.select-location, req.body.select-rating, req.body.review];
  sql = mysql.pool.query(sql,inserts,function(error, results, fields){
      if(error){
          console.log(JSON.stringify(error))
          res.write(JSON.stringify(error));
          res.end();
      }else{
          res.redirect('/rating');
      }
  });
});

app.listen(app.get('port'), function(){
  console.log('The site is live at http://localhost:' + app.get('port') + '. Stop Node with Ctrl-C.');
});
