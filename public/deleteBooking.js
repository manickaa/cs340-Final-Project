function deleteBooking(id){
    $.ajax({
        url: '/booking/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};
