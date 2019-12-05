
function searchLocationByCountry() {
    //get the country
    var country_search_string = document.getElementById('country_search_string').value
    //construct the URL and redirect to it
    window.location = '/locations/search/' + encodeURI(country_search_string)
}

function searchGuideByFirstName() {
    //get the first name 
    var first_name_search_string = document.getElementById('first_name_search_string').value
    //construct the URL and redirect to it
    window.location = '/guides/search/' + encodeURI(first_name_search_string)
}