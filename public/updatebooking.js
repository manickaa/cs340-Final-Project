function updateBooking(id){
    $.ajax({
        url: '/booking/' + id,
        type: 'PUT',
        data: $('#update-booking').serialize(),
        success: function(result){
            window.location.replace("/booking");
        }
    })
};
