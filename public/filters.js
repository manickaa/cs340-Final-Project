
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
function filterCustomerBycustomerID(){
    //get the customer id by email
    var customer_id = document.getElementById('email_id').value
    //construct the URL and redirect to it
    window.location = '/customer/filter/' + parseInt(customer_id)
}
function filterPaymentByBooking(){
    //get the booking id
    var booking_id = document.getElementById('booking_id').value
    //construct the URL and redirect to it
    window.location = '/payment/filter/' + parseInt(booking_id)
}
function filterRatingByRating(){
    // get rating
    var rating_value = document.getElementById('select_rating').value
    //construct the URL and redirect to it
    window.location = '/rating/filterRating/' + parseInt(rating_value)
}
function filterBooking(){
    //get customer id through customer name
    var customer_id = document.getElementById('customer_name').value
    //construct the URL and redirect to it
    window.location = '/booking/filter/' + parseInt(customer_id)
}
