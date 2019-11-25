function updateGuide(id) {
    $.ajax({
        url: '/assignments/' + id,
        type: 'PUT',
        data: $('#update-assignment').serialize(),
        success: function (result) {
            window.location.replace("/assignments");
        }
    })
};
