'use strict';

(function () {

    $('#settings').click( function () {
        $.get(window.location.origin + '/api/:id', function (result) {
            $('#user-id').val(result.id);
            $('#user-display-name').val(result.displayName);
            $('#user-full-name').val(result.fullName);
            $('#user-city').val(result.city);
            $('#user-region').val(result.region);
            
            $('#settings-modal').modal();
        });
    });
    
    $('#save-settings').click( function () {
        var url = window.location.origin + '/api/:id/settings' +
            '?fullName=' + encodeURIComponent($('#user-full-name').val()) +
            '&city=' + encodeURIComponent($('#user-city').val()) +
            '&region=' + encodeURIComponent($('#user-region').val()); 
        
        $.post(url, function (result) {
            $('#settings-modal').modal('toggle');
        });
    });
})();