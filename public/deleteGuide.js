function deleteGuide(id){
    $.ajax({
        url: '/guides/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};
