function updateGuide(id) {
    $.ajax({
        url: '/guides/' + id,
        type: 'PUT',
        data: $('#update-guide').serialize(),
        success: function (result) {
            window.location.replace("/guides");
        }
    })
};
