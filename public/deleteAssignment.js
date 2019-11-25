function deleteAssignment(id) {
    $.ajax({
        url: '/assignments/' + id,
        type: 'DELETE',
        success: function (result) {
            window.location.reload(true);
        }
    })
};