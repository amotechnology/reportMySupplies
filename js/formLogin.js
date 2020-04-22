$(document).ready(function() {
    $('#submit-btn').click(function() {
        lambdaApiUrl = 'https://5alsy89r1j.execute-api.us-east-2.amazonaws.com/prod/formlogin';
        $.ajax({
            type: 'POST',
            url: lambdaApiUrl,
            crossDomain: true,
            data: JSON.stringify({'password': $('#password').val()}),
            dataType: 'json',
            contentType: 'application/json',
            success: function(response) {
                if (response.body == 'success') {
                    window.location.href = 'http://reportmysupplies.app';
                } 
                else {
                    $('#invalid-password').css('display', 'block');
                }
            }
        });
    });
});