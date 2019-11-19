/*Based on CS340 Sample App Code from https://github.com/knightsamar/cs340_sample_nodejs_app*/


/*get all locations id + names for dropdown*/
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
    //construct the URL and redirect to it
    window.location = '/locations/filter/' + parseInt(location_ID)
}

/*get all guide id + full names for dropdown*/
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
    //construct the URL and redirect to it
    window.location = '/guide/filter/' + parseInt(guide_ID)
}