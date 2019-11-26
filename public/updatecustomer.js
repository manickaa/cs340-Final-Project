function updateCustomer(id){
    $.ajax({
        url: '/customer/' + id,
        type: 'PUT',
        data: $('#update-customer').serialize(),
        success: function(result){
            window.location.replace("/customer");
        }
    })
};
