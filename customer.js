module.exports = function () {
    var express = require('express');
    var app = express.Router();

    /************** functions for customer entity******************/
    
   //function to get the email ids of all the customers in the dropdown for filter 
   function getEmail(res, mysql, context, complete) {
        mysql.pool.query("SELECT customer_ID, email_id FROM customers ORDER BY customer_ID",
            function (error, results, fields) {
                if (error) {
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.email_display = results;
                complete();
            });
    }
    //function to display customers in the table
    function getCustomer(res, mysql, context, complete){
        var sql_query = "SELECT customers.customer_ID as customer_ID, customers.first_name " +
                       "as first_name, customers.middle_name as middle_name, " +
                       "customers.last_name as last_name,customers.street_no as street_no, " +
                       "customers.city as city, customers.state as state, customers.country " +
                       "as country,customers.postal_code as postal_code, " +
                       "customers.phone_number as phone_number, " +
                       "customers.email_id as email_id, customers.passport_number as passport_number, " +
                       "customers.passport_countryofissue as passport_countryofissue " +
                        "FROM customers " +
                        "GROUP BY customers.customer_ID " +
                        "ORDER BY customers.customer_ID;";
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
      //function to get the customer data from :id for update form
      function getCustomerUpdate(res, mysql, context, id, complete){
        var sql_query = "SELECT customer_ID as customer_ID,first_name as first_name, " +
                        "last_name as last_name, street_no as street_no, city as city, " +
                        "state as state, country as country, postal_code as postal_code, " +
			"phone_number as phone_number, " +
                        "email_id as email_id FROM customers WHERE customer_ID = ?";
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
      //function to get display customers in the table on filter 
      function getCustomerByEmail(res, mysql, context, id, complete){
          var query = "SELECT customers.customer_ID as customer_ID, customers.first_name " +
                       "as first_name, customers.middle_name as middle_name, " +
                       "customers.last_name as last_name,customers.street_no as street_no, " +
                       "customers.city as city, customers.state as state, customers.country " +
                       "as country,customers.postal_code as postal_code, " +
		       "customers.phone_number as phone_number, " +
                       "customers.email_id as email_id, customers.passport_number as passport_number, " +
		       "customers.passport_countryofissue as passport_countryofissue " +
			"FROM customers " +
                       "WHERE customers.customer_ID = ?"; 
          console.log(id)
          var inserts = [id];
          mysql.pool.query(query, inserts, function(error, results, fields){
                if(error){
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.customer = results;
                complete();
            });
      }

    /************** routes for customer entity ********************/
	
    //render customer page
    app.get('/', function (req, res, next) {
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["filters.js"];
        var mysql = req.app.get('mysql');
        getEmail(res, mysql, context, complete);
        getCustomer(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 2) {
                res.render('customer', context);
            }
        }
    });
	
    //render add-customer page
    app.get('/add-customer', function (req, res) {
        res.render('add-customer');
    });
	
    //adds customer to database	
    app.post('/add-customer', function(req, res, next) {
      console.log(req.body)
      var mysql = req.app.get('mysql');
      var sql = "INSERT INTO customers (first_name, last_name, middle_name, " +
                "street_no, city, state, country, postal_code, phone_number, email_id, " +
                "passport_number, passport_countryofissue, passport_expirydate) " +
                "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
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
    
    //render the update-customer page using :id	
    app.get('/:id', function(req, res) {
      var callbackCount = 0;
      var context = {};
      context.jsscripts = ["update.js"];
      var mysql = req.app.get('mysql');
      getCustomerUpdate(res, mysql, context, req.params.id, complete);
      function complete() {
          callbackCount++;
          if (callbackCount >= 1) {
              res.render('update-customer', context);
          }
      }
    });
	
    //updates the customer with the specific :id
    app.put('/:id', function(req, res) {
      var mysql = req.app.get('mysql');
      var sql = "UPDATE customers SET first_name = ?, last_name = ?, street_no = ?, " +
                "city = ?, state = ?, country = ?, postal_code=?, phone_number = ?, email_id = ? " +
                "WHERE customer_ID = ?";
      var inserts = [req.body.first_name, req.body.last_name, req.body.street_no, req.body.city, req.body.state, req.body.country, req.body.postal_code, req.body.phone_number, req.body.email_id, req.params.id];
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
	
    //filter the customers using email 
    app.get('/filter/:id', function(req, res){
            var callbackCount = 0;
            var context = {};
            var mysql = req.app.get('mysql');
            getCustomerByEmail(res, mysql, context, req.params.id, complete);
            getEmail(res, mysql, context, complete); 
            function complete(){
                callbackCount++;
                if(callbackCount >= 2){
                    res.render('customer', context);
                }
    
            }
    });
	
	return app;
}();
