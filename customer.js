module.exports = function(){

    var express = require('express');
    var router = express.Router();

    function getCustomers(res, mysql, context, done){
        var sql_query = "SELECT customers.customer_ID as customer_ID, customers.first_name as first_name, customers.middle_name as middle_name, customers.last_name as last_name,customers.street_no as street_no, customers.city as city, customers.state as state, customers.country as country,customers.phone_number as phone_number, customers.email_id as email_id, COUNT(bookings.booking_ID) AS numberofbookings,COUNT(ratings.rating_ID) AS numberofreviews FROM customers LEFT JOIN bookings ON customers.customer_ID = bookings.customer_ID LEFT JOIN ratings ON customers.customer_ID = ratings.rating_ID GROUP BY customers.customer_ID ORDER BY customers.customer_ID;";
        mysql.pool.query(sql_query, function(err, result, fields){
            if(err){
                console.log(err);
                res.write(JSON.stringify(err));
                res.end();
            }
            context.customers = result;
            console.log(context.customers);
            done();
        });
    }
    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "SELECT customers.customer_ID as customer_ID, customers.first_name as first_name, customers.middle_name as middle_name, customers.last_name as last_name,customers.street_no as street_no, customers.city as city, customers.state as state, customers.country as country,customers.phone_number as phone_number, customers.email_id as email_id, COUNT(bookings.booking_ID) AS numberofbookings,COUNT(ratings.rating_ID) AS numberofreviews FROM customers LEFT JOIN bookings ON customers.customer_ID = bookings.customer_ID LEFT JOIN ratings ON customers.customer_ID = ratings.rating_ID WHERE customers.email_id = ?";
        var inserts = [req.body.email_id];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/people');
            }
        });
    });

    router.get('/', function(req, res){

        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');

        getCustomers(res, mysql, context, done);

        function done(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('customers', context);
            }
        }
    });
    
    return router;
}();