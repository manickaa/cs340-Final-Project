/*Based on CS340 Sample App Code from https://github.com/knightsamar/cs340_sample_nodejs_app*/

module.exports = function () {
    var express = require('express');
    var mysql = require('./dbcon.js');
    var bodyParser = require('body-parser');
    var router = express.Router();
    var app = express();
    var handlebars = require('express-handlebars').create({ defaultLayout: 'main' });

    /*Search & return all location*/
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

    /*display all locations*/
    app.get('/tour_guides', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["scripts.js"];
        var mysql = req.app.get('mysql');
        getGuides(res, mysql, context, complete);
        getGuidesDetails(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('guides', context);
            }
        }
    });

    /* Adds a new location*/
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

    return app;
}();
