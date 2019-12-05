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

function updateLocation(id) {
    $.ajax({
        url: '/locations/' + id,
        type: 'PUT',
        data: $('#update-location').serialize(),
        success: function (result) {
            window.location.replace("/locations");
        }
    })
};
