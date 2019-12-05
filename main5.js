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
app.use('/static', express.static('public'));
app.use('/guides', require('./guides.js'));
app.use('/locations', require('./locations.js'));
app.use('/assignments', require('./assignments.js'));


function searchCustomer(res, mysql, context, complete) {
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
}
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
function getCustomerUpdate(res, mysql, context, id, complete){
  var sql_query = "SELECT customer_ID as customer_ID,first_name as first_name, last_name as last_name, street_no as street_no, city as city, state as state, country as country, phone_number as phone_number, email_id as email_id FROM customers WHERE customer_ID = ?";
  var inserts = [id];
  mysql.pool.query(sql_query, inserts, function(err, result, fields){
      if(err){
          console.log(err);
          res.write(JSON.stringify(err));
          res.end();
      }
      context.customer = result[0];
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
function getBookingUpdate(res, mysql, context, booking_ID, complete){
  var sql_query = "SELECT travelLocation_ID as location_id, departure_date, arrival_date, number_adults, number_children FROM bookings WHERE bookings.booking_ID = ?";
  var inserts = [booking_ID];
  mysql.pool.query(sql_query, inserts, function(err, result, fields){
      if(err){
          console.log(err);
          res.write(JSON.stringify(err));
          res.end();
      }
      context.bookings = result[0];
      console.log(context.bookings);
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
  var sql_query = "SELECT ratings.rating_ID, ratings.travelLocation_ID, travel_location.city, ratings.customer_ID, CONCAT(customers.first_name, ' ', customers.last_name) AS customer_name, ratings.rating, ratings.review FROM ratings LEFT JOIN travel_location ON ratings.travelLocation_ID = travel_location.travelLocation_ID LEFT JOIN customers ON ratings.customer_ID = customers.customer_ID GROUP BY ratings.rating_ID ORDER BY ratings.rating_ID;";
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

//homepage routes
app.get('/', function (req, res, next) {
    // Render the homepage.
    res.render('home');
});
app.get('/home', function (req, res, next) {
    // Render the homepage.
    res.render('home.handlebars');
});

//routes for customer pages
app.get('/customer', function (req, res, next) {
    var callbackCount = 0;
    var context = {};
    var mysql = req.app.get('mysql');
    getCustomer(res, mysql, context, complete);
    function complete() {
        callbackCount++;
        if (callbackCount >= 1) {
            res.render('customer', context);
        }
    }
});
app.get('/customer/:id', function(req, res) {
  var callbackCount = 0;
  var context = {};
  context.jsscripts = ["updatecustomer.js"];
  var mysql = req.app.get('mysql');
  getCustomerUpdate(res, mysql, context, req.params.id, complete);
  function complete() {
      callbackCount++;
      if (callbackCount >= 1) {
          res.render('update-customer', context);
      }
  }
});
app.put('/customer/:id', function(req, res) {
  var mysql = req.app.get('mysql');
  var sql = "UPDATE customers SET first_name = ?, last_name = ?, street_no = ?, city = ?, state = ?, country = ?, phone_number = ?, email_id = ? WHERE customer_ID = ?";
  var inserts = [req.body.first_name, req.body.last_name, req.body.street_no, req.body.city, req.body.state, req.body.country, req.body.phone_number, req.body.email_id, req.params.id];
  sql = mysql.pool.query(sql,inserts,function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }else{
          res.status(200);
          res.end();
      }
  });
});
app.get('/add-customer', function (req, res) {
    res.render('add-customer.handlebars')
});
app.post('/add-customer', function (req, res, next) {
    console.log(req.body)
    var mysql = req.app.get('mysql');
    var sql = "INSERT INTO customers (first_name, last_name, middle_name, street_no, city, state, country, postal_code, phone_number, email_id, passport_number, passport_countryofissue, passport_expirydate) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
    var inserts = [req.body.first_name, req.body.last_name, req.body.middle_name, req.body.street_no, req.body.city, req.body.state, req.body.country, req.body.postal_code, req.body.phone_number, req.body.email_id, req.body.passport_number, req.body.passport_countryofissue, req.body.passport_expirydate];
    sql = mysql.pool.query(sql, inserts, function (err, result, fields) {
        if (err) {
            console.log(JSON.stringify(err))
            res.write(JSON.stringify(err));
            res.end();
        } else {
            res.redirect('/customer');
        }
    });
});

//routes for booking pages
app.get('/booking', function (req, res, next) {
    var callbackCount = 0;
    var context = {};
    context.jsscripts = ["deleteBooking.js"];
    var mysql = req.app.get('mysql');
    getBooking(res, mysql, context, complete);
    function complete() {
        callbackCount++;
        if (callbackCount >= 1) {
            res.render('booking', context);
        }
    }
});
app.get('/booking/:id', function(req, res) {
  var callbackCount = 0;
  var context = {};
  context.jsscripts = ["selectors.js", "updatebooking.js", "deleteBooking.js"];
  var mysql = req.app.get('mysql');
  getBookingUpdate(res, mysql, context, req.params.id, complete);
  getLocationDisplay(res, mysql, context, complete);
  function complete() {
      callbackCount++;
      if (callbackCount >= 2) {
          res.render('update-booking', context);
      }
  }
});
app.put('/booking/:id', function(req, res) {
  var mysql = req.app.get('mysql');
  var sql = "UPDATE bookings " +
            "SET travelLocation_ID = ?, " +
            "departure_date = ?, " +
            "arrival_date = ?, " +
            "number_adults = ?, " +
            "number_children = ? " +
            "WHERE booking_ID = ?";
  var inserts = [req.body.location_id, req.body.departure_date, req.body.arrival_date, req.body.number_adults, req.body.number_children, req.params.id];
  sql = mysql.pool.query(sql,inserts,function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }else{
          res.status(200);
          res.end();
      }
  });
});
app.delete('/booking/:id', function (req, res) {
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
app.get('/add-booking', function (req, res) {
    res.render('add-booking.handlebars');
});
app.post('/add-booking', function (req, res, next) {
    console.log(req.body)
    var mysql = req.app.get('mysql');
    var sql = "INSERT INTO bookings(customer_ID, travelLocation_ID, departure_date, arrival_date, number_adults, number_children) VALUES(?, (SELECT travelLocation_ID FROM travel_location WHERE city = ?),?, ?, ?, ?);";
    var inserts = [req.body.customer_ID, req.body.travelLocation, req.body.departure_date, req.body.arrival_date, req.body.number_adults, req.body.number_children];
    sql = mysql.pool.query(sql, inserts, function (err, result, fields) {
        if (err) {
            console.log(JSON.stringify(err))
            res.write(JSON.stringify(err));
            res.end();
        } else {
            res.redirect('/booking');
        }
    });
});

//routes for payment pages
app.get('/payment', function(req, res, next){
  var callbackCount = 0;
  var context = {};
  context.jsscripts = ["deletePayment.js"];
  var mysql = req.app.get('mysql');
  getPayment(res, mysql, context, complete);
  function complete(){
    callbackCount++;
    if(callbackCount >= 1){
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
    getBookingID(res, mysql, context, complete);
    function complete() {
        callbackCount++;
        if (callbackCount >= 1) {
            res.render('add-payment', context);
        }
    }
});
app.post('/add-payment', function (req, res, next) {
    console.log(req.body)
    console.log(req.body.booking)
    var mysql = req.app.get('mysql');
    var sql = "INSERT INTO payment(booking_ID, payment_amount, payment_date, payment_description) VALUES(?, (SELECT ((t.amount_perAdult*b.number_adults) + (t.amount_perChild*b.number_children) * (DATEDIFF(b.arrival_date, b.departure_date))) AS payment_amount FROM bookings b INNER JOIN travel_location t ON b.travelLocation_ID = t.travelLocation_ID WHERE booking_ID = ?),?,?);";
    var inserts = [req.body.booking, req.body.booking, req.body.payment_date, req.body.payment_description];
    sql = mysql.pool.query(sql, inserts, function (err, result, fields) {
        if (err) {
            console.log(JSON.stringify(err))
            res.write(JSON.stringify(err));
            res.end();
        } else {
            res.redirect('/payment');
        }
    });
});

//routes for rating pages
app.get('/rating', function (req, res, next) {
    var callbackCount = 0;
    var context = {};
    var mysql = req.app.get('mysql');
    getRating(res, mysql, context, complete);
    function complete() {
        callbackCount++;
        if (callbackCount >= 1) {
            res.render('rating', context);
        }
    }
});
app.get('/add-rating', function (req, res) {
    res.render('add-rating.handlebars');
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
app.post('/add-rating', function(req, res, next){
  console.log(req.body)
  var mysql = req.app.get('mysql');
  var sql = "INSERT INTO ratings(customer_ID, travelLocation_ID, rating, review) VALUES(?, (SELECT travelLocation_ID FROM travel_location WHERE city = ?),?,?);";
  var inserts = [req.body.customer_ID, req.body.select-location, req.body.select-rating, req.body.review];
  sql = mysql.pool.query(sql,inserts,function(err, result, fields){
      if(err){
          console.log(JSON.stringify(err))
          res.write(JSON.stringify(err));
          res.end();
      }else{
          res.redirect('/rating');
      }
  });
});

app.listen(app.get('port'), function(){
  console.log('The site is live at http://localhost:' + app.get('port') + '. Stop Node with Ctrl-C.');
});
