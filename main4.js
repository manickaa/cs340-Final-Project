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
function getLocation(res, mysql, context, complete) {
    var sql_query = "SELECT travel_location.travelLocation_ID AS location_ID, travel_location.city AS city, travel_location.country as country, " +
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
/*TO DO LINK select box to query*/
function getGuides(res, mysql, context, complete) {
    var sql_query = "SELECT tour_guide.tourGuide_ID as guide_ID, tour_guide.first_Name as first_name, tour_guide.last_Name as last_name, " + 
                    "COUNT(assignment.tourGuide_travelLocation) AS count_assignments, " + 
                    "COUNT(travel_location.travelLocation_ID) AS count_locations " + 
                    "FROM tour_guide " + 
                    "LEFT JOIN assignment ON tour_guide.tourGuide_ID = assignment.tourGuide_ID " + 
                    "LEFT JOIN travel_location ON assignment.travelLocation_ID = travel_location.travelLocation_ID " + 
                    //WHERE tour_guide.tourGuide_ID = ?" + 
                    "GROUP BY tour_guide.tourGuide_ID " + 
                    "ORDER BY tour_guide.tourGuide_ID";
    mysql.pool.query(sql_query, function (err, result, fields) {
        if (err) {
            console.log(err);
            res.write(JSON.stringify(err));
            res.end();
        }
        context.tour_guide = result;
        complete();
    });
}
/*TO DO LINK select box to query*/
function getAssignments(res, mysql, context, complete) {
    var sql_query = "SELECT assignment.tourGuide_travelLocation AS assignment_ID, assignment.booking_ID AS booking_ID, " +
                    "CONCAT(tour_guide.first_name, ' ', tour_guide.last_name) AS guide, " +
                    "CONCAT(travel_location.city, ', ', travel_location.country) AS destination, " +
                    "CONCAT(customers.first_name, ' ', customers.last_name) AS customer, " +
                    "bookings.departure_date AS departure_date, " +
                    "bookings.arrival_date AS arrival_date, " +
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
function getGuideUpdate(res, mysql, context, id, complete) {
    var sql = "SELECT tourGUide_ID AS guide_ID, first_Name AS first_name, last_Name AS last_name FROM tour_guide WHERE tourGuide_ID = ?";
    var inserts = [id];
    mysql.pool.query(sql, inserts, function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        context.guide = results[0];
        complete();
    });
}
function getAssignmentUpdate(res, mysql, context, id, complete) {
    var sql = "SELECT tourGuide_travelLocation AS assignment_ID, booking_ID, travelLocation_ID AS location_ID, tourGuide_ID as guide_ID " +
                "FROM assignment WHERE tourGuide_travelLocation = ?";
    var inserts = [id];
    mysql.pool.query(sql, inserts, function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        context.assignment = results[0];
        complete();
    });
}

app.get('/guides/:id', function (req, res) {
    callbackCount = 0;
    var context = {};
    context.jsscripts = ["updateGuide.js"]
    var mysql = req.app.get('mysql');
    getGuideUpdate(res, mysql, context, req.params.id, complete);
    function complete() {
        callbackCount++;
        if (callbackCount >= 1) {
            res.render('update-guide', context);
        }
    }
});
app.get('/assignments/:id', function (req, res) {
    callbackCount = 0;
    var context = {};
    context.jsscripts = ["updateAssignment.js", "selectors.js"]
    var mysql = req.app.get('mysql');
    getBookingID(res, mysql, context, complete);
    getGuideDisplay(res, mysql, context, complete);
    getAssignmentUpdate(res, mysql, context, req.params.id, complete);
    function complete() {
        callbackCount++;
        if (callbackCount >= 3) {
            res.render('update-assignment', context);
        }
    }
});

app.put('/guides/:id', function (req, res) {
    var mysql = req.app.get('mysql');
    var sql = "UPDATE tour_guide SET first_Name=?, last_Name=? WHERE tourGuide_ID=?";
    var inserts = [req.body.first_name, req.body.last_name, req.params.id];
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
app.put('/assigments/:id', function (req, res) {
    var mysql = req.app.get('mysql');
    var sql = "UPDATE tourGuide_travelLocation SET booking_ID=?, tourGuide_ID=? WHERE tourGuide_travelLocation=?;";
    var inserts = [req.body.booking_ID, req.body.guide_ID, req.params.id];
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

app.get('/', function(req, res, next){
  // Render the homepage.
  res.render('home');
});
app.get('/home', function(req, res, next){
  // Render the homepage.
  res.render('home.handlebars');
});
app.get('/guides', function (req, res) {
    var callbackCount = 0;
    var context = {};
    context.jsscripts = ["updateGuide.js"]
    var mysql = req.app.get('mysql');
    getGuideDisplay(res, mysql, context, complete);
    getGuides(res, mysql, context, complete);
    function complete() {
        callbackCount++;
        if (callbackCount >= 2) {
            res.render('guides', context);
        }
    }
});
app.get('/assignments', function (req, res) {
    var callbackCount = 0;
    var context = {};
    context.jsscripts = ["deleteAssignment.js", "updateAssignment.js"]
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
app.get('/locations', function (req, res) {
    var callbackCount = 0;
    var context = {};
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

app.delete('/assignments/:id', function (req, res) {
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

app.post('/guides', function (req, res) {
    res.render('guides');
});
app.post('/assignments', function (req, res) {
    res.render('assignments');
});

app.get('/add-customer', function (req, res) {
    res.render('add-customer.handlebars')
});
app.get('/add-booking', function (req, res) {
    res.render('add-booking.handlebars');
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
app.get('/add-rating', function (req, res) {
    res.render('add-rating.handlebars');
});
app.get('/add-guide', function (req, res) {
    res.render('add-guide');
});
app.get('/add-location', function (req, res) {
    res.render('add-location');
});
app.get('/add-assignment', function (req, res) {
    var callbackCount = 0;
    var context = {};
    var mysql = req.app.get('mysql');
    getBookingID(res, mysql, context, complete);
    getGuideDisplay(res, mysql, context, complete);
    function complete() {
        callbackCount++;
        if (callbackCount >= 2) {
            res.render('add-assignment', context);
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

app.post('/add-customer', function(req, res, next) {
  console.log(req.body)
  var mysql = req.app.get('mysql');
  var sql = "INSERT INTO customers (first_name, last_name, middle_name, street_no, city, state, country, postal_code, phone_number, email_id, passport_number, passport_countryofissue, passport_expirydate) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
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
app.post('/add-payment', function(req, res, next){
  console.log(req.body)
  console.log(req.body.booking)
  var mysql = req.app.get('mysql');
  var sql = "INSERT INTO payment(booking_ID, payment_amount, payment_date, payment_description) VALUES(?, (SELECT ((t.amount_perAdult*b.number_adults) + (t.amount_perChild*b.number_children) * (DATEDIFF(b.arrival_date, b.departure_date))) AS payment_amount FROM bookings b INNER JOIN travel_location t ON b.travelLocation_ID = t.travelLocation_ID WHERE booking_ID = ?),?,?);";
  var inserts = [req.body.booking, req.body.booking, req.body.payment_date, req.body.payment_description];
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
app.post('/add-guide', function (req, res, next) {
    console.log(req.body)
    var mysql = req.app.get('mysql');
    var sql = "INSERT INTO tour_guide(first_name, last_name) VALUES(?,?);";
    var inserts = [req.body.first_name, req.body.last_name];
    sql = mysql.pool.query(sql, inserts, function (err, result, fields) {
        if (err) {
            console.log(JSON.stringify(err))
            res.write(JSON.stringify(err));
            res.end();
        } else {
            res.redirect('/guides');
        }
    });
});
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


app.listen(app.get('port'), function(){
  console.log('The site is live at http://localhost:' + app.get('port') + '. Stop Node with Ctrl-C.');
});
