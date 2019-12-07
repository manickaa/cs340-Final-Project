module.exports = function () {
    var express = require('express');
    var app = express.Router();

    //gets guide information for main guide page table display
    function getGuides(res, mysql, context, complete) {
        var sql_query = "SELECT tour_guide.tourGuide_ID as guide_ID, tour_guide.first_Name as first_name, tour_guide.last_Name as last_name, " +
                        "COUNT(assignment.tourGuide_travelLocation) AS count_assignments, " +
                        "COUNT(travel_location.travelLocation_ID) AS count_locations " +
                        "FROM tour_guide " +
                        "LEFT JOIN assignment ON tour_guide.tourGuide_ID = assignment.tourGuide_ID " +
                        "LEFT JOIN travel_location ON assignment.travelLocation_ID = travel_location.travelLocation_ID " +
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
    //function gets guide first and last name to populate update form
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
    //searches for guides with first name similar to user input
    function getGuideWithNameLike(req, res, mysql, context, complete) {
        var query = "SELECT tour_guide.tourGuide_ID as guide_ID, tour_guide.first_Name as first_name, tour_guide.last_Name as last_name, " +
                "COUNT(assignment.tourGuide_travelLocation) AS count_assignments, " +
                "COUNT(travel_location.travelLocation_ID) AS count_locations " +
                "FROM tour_guide " +
                "LEFT JOIN assignment ON tour_guide.tourGuide_ID = assignment.tourGuide_ID " +
                "LEFT JOIN travel_location ON assignment.travelLocation_ID = travel_location.travelLocation_ID " +
                "WHERE tour_guide.first_Name LIKE " + mysql.pool.escape(req.params.s + '%');
        console.log(query);
        mysql.pool.query(query, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            context.tour_guide = results;
            console.log(results);
            complete();
        });
    }

    //main guide page
    app.get('/', function (req, res) {
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteGuide.js","update.js", "filters.js", "selectors.js"];
        var mysql = req.app.get('mysql');
        getGuides(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                res.render('guides', context);
            }
        }
    });
    app.post('/', function (req, res) {
        res.render('guides');
    });
    //adds new guide to database based on user input
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
    app.get('/add-guide', function (req, res) {
        res.render('add-guide');
    });
    //gets & displays guide first/last name to user for update
    app.get('/:id', function (req, res) {
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["update.js"]
        var mysql = req.app.get('mysql');
        getGuideUpdate(res, mysql, context, req.params.id, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                res.render('update-guide', context);
            }
        }
    });
    //updates guide first/last name of current guide based on user input
    app.put('/:id', function (req, res) {
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
    //implements search of guide by first name
    app.get('/search/:s', function (req, res) {
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["update.js", "filters.js", "selectors.js"];
        var mysql = req.app.get('mysql');
        getGuideWithNameLike(req, res, mysql, context, complete);
        console.log(context);
        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                res.render('guides', context);
            }
        }
    });
    app.delete('/:id', function (req, res) {
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM tour_guide WHERE tourGuide_ID = ?";
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

    return app;
}();
