function deletePayment(id){
    $.ajax({
        url: '/payment/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};
